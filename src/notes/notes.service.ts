import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import responseMessage from 'src/utils/response-message.helper';
import { CreateNoteDto, SearchDto } from './dto/create-note.dto';
import { NoteModeratorAction, UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private prismaService: PrismaService,
    private emailService: EmailService,
  ) {}
  async create(createNoteDto: CreateNoteDto, userId: string) {
    await this.emailService.sendUserConfirmation(createNoteDto.categoriesId);
    return this.prismaService.notes.create({
      data: {
        ...createNoteDto,
        userId,
      },
    });
  }

  findAll(categoriesId: string) {
    console.log(categoriesId);
    return this.prismaService.notes.findMany({
      where: {
        categoriesId,
      },
      include: {
        author: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });
  }

  searchNote(dto: SearchDto, categoryId: string) {
    return this.prismaService.notes.findMany({
      where: {
        isAccepted: true,
        categoriesId: categoryId,
        title: {
          mode: 'insensitive',
          contains: dto.searchValue,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async getNotesForModeration(userId: string, categoryId: string) {
    const user = await this.prismaService.user.findFirst({
      include: {
        moderatedContent: true,
        categories: true,
      },
      where: {
        id: userId,
      },
    });
    if (!user.moderatedContent.length)
      throw new HttpException(
        'Вы не модерируете данную категорию',
        HttpStatus.FORBIDDEN,
      );
    const category = await this.prismaService.categories.findFirst({
      where: {
        id: categoryId,
      },
    });
    const notes = await this.prismaService.notes.findMany({
      where: {
        categoriesId: categoryId,
        OR: [{ isAccepted: false }, { isEdited: true }],
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    return {
      category,
      notes,
    };
  }

  async acceptNoteByModerator(userId: string, param: NoteModeratorAction) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });
    const note = await this.prismaService.notes.findFirst({
      where: {
        id: param.noteId,
      },
      include: {
        author: true,
        categories: {
          include: {
            moderators: true,
          },
        },
      },
    });
    if (
      note.categories.moderators.find((moderator) => moderator.id === user.id)
    ) {
      switch (param.type) {
        case 'ACCEPT':
          await this.prismaService.moderActionLog.create({
            data: {
              type: 'ACCEPT',
              moderatorId: userId,
            },
          });
          if (note.isEdited) {
            await this.prismaService.notes.update({
              where: {
                id: note.id,
              },
              data: {
                isEdited: false,
                oldContent: null,
              },
            });
            await this.emailService.sendEmailForAcceptPublishUser(
              note.author.email,
              note.categoriesId,
              note.id,
            );
            return responseMessage(
              true,
              'Одобрено',
              'Публикация успешно отредактирована',
            );
          }
          await this.emailService.sendEmailForAcceptPublishUser(
            note.author.email,
            note.categoriesId,
            note.id,
          );
          await this.prismaService.notes.update({
            where: {
              id: note.id,
            },
            data: {
              isAccepted: true,
            },
          });
          return responseMessage(
            true,
            'Одобрено',
            'Статья опубликована в общую ленту',
          );
        case 'UNACCEPT':
          await this.prismaService.moderActionLog.create({
            data: {
              type: 'UNACCEPT',
              moderatorId: userId,
            },
          });
          await this.emailService.sendEmailForAcceptPublishUser(
            note.author.email,
            note.categoriesId,
            note.id,
            false,
          );
          if (note.isEdited) {
            await this.emailService.sendEmailForAcceptPublishUser(
              note.author.email,
              note.categoriesId,
              note.id,
              false,
            );
            await this.prismaService.notes.update({
              where: {
                id: note.id,
              },
              data: {
                isEdited: false,
                oldContent: null,
                content: note.oldContent,
              },
            });
            return responseMessage(
              true,
              'Отклонено',
              'Редактирование публикации отклонено',
            );
          }
          await this.remove(note.id, user.id);
          return responseMessage(
            true,
            'Отклонено',
            'Публикация статьи отклонена',
          );
      }
    }
    throw new HttpException(
      'Вы не являетесь модератором',
      HttpStatus.FORBIDDEN,
    );
  }
  findOne(id: string) {
    return this.prismaService.notes.findFirst({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(updateNoteDto: UpdateNoteDto, noteId: string, userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        moderatedContent: true,
      },
    });
    const note = await this.prismaService.notes.findFirst({
      where: {
        id: noteId,
      },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      user.isAdmin ||
      note.author.id !== userId ||
      user.moderatedContent.length > 0
    ) {
      await this.prismaService.notes.update({
        where: {
          id: noteId,
        },
        data: {
          isEdited: true,
          oldContent: note.content,
          ...updateNoteDto,
        },
      });
      await this.emailService.sendUserConfirmation(note.categoriesId);
      return {
        success: true,
        message: {
          title: 'Отредактировано',
          description: 'Обновленная статья появится в ленте после модерации',
        },
      };
    }
    throw new HttpException(
      'Вы не являетесь автором публикации, модератором или администратором',
      HttpStatus.BAD_REQUEST,
    );
  }

  async remove(id: string, userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        moderatedContent: true,
      },
    });
    const postForUserValidate = await this.prismaService.notes.findFirst({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log(user);

    if (
      user.isAdmin ||
      postForUserValidate.author.id === userId ||
      user.moderatedContent.length > 0
    )
      return this.prismaService.notes.delete({
        where: {
          id: postForUserValidate.id,
        },
      });

    throw new HttpException(
      'Вы не являетесь автором публикации, модератором или администратором',
      HttpStatus.BAD_REQUEST,
    );
  }
}

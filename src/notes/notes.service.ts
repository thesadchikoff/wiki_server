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

  async pinnedToggle(userId: string, noteId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        moderatedContent: {
          select: {
            id: true,
          },
        },
      },
    });
    const note = await this.prismaService.notes.findFirst({
      where: {
        id: noteId,
      },
    });
    if (
      user.isAdmin ||
      user.moderatedContent.find((data) => data.id === note.categoriesId)
    ) {
      await this.prismaService.notes.update({
        where: {
          id: note.id,
        },
        data: {
          isPinned: !note.isPinned,
        },
      });
      return {
        success: true,
        message: {
          title: 'Успешно',
          description: `Запись ${note.isPinned ? 'откреплена' : 'закреплена'}`,
        },
      };
    }
    throw new HttpException(
      'Вы не модератор категории или не администратор',
      HttpStatus.FORBIDDEN,
    );
  }

  async searchNote(dto: SearchDto, categoryId: string, page: string) {
    const currentPage = parseInt(page) || 1; // Получаем текущую страницу из query параметра, по умолчанию 1
    const itemsPerPage = 9; // Количество записей на странице
    const totalPageCount = await this.prismaService.notes.count({
      where: {
        isAccepted: true,
        categoriesId: categoryId,
        title: {
          mode: 'insensitive',
          contains: dto.searchValue,
        },
      },
    });
    const notes = await this.prismaService.notes.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      where: {
        isAccepted: true,
        categoriesId: categoryId,
        title: {
          mode: 'insensitive',
          contains: dto.searchValue,
        },
      },
      orderBy: [
        {
          isPinned: 'desc',
        },
        {
          User: {
            _count: 'desc',
          },
        },
      ],
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
      notes: notes,
      pages: Math.ceil(totalPageCount / itemsPerPage),
    };
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
        _count: {
          select: { User: true },
        },
        User: {
          select: {
            id: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
            createdAt: true,
            _count: {
              select: {
                moderatedContent: true,
              },
            },
          },
        },
      },
    });
  }

  async usefulNote(userId: string, notesId: string) {
    const note = await this.prismaService.notes.findFirst({
      where: {
        id: notesId,
      },
      include: {
        User: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log(note);
    if (!note)
      throw new HttpException(
        'Такой записи не существует',
        HttpStatus.NOT_FOUND,
      );
    await this.prismaService.notes.update({
      where: {
        id: note.id,
      },
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: 'Статья отмечена как полезная',
      },
    };
  }

  async disUsefulNote(userId: string, notesId: string) {
    const note = await this.prismaService.notes.findFirst({
      where: {
        id: notesId,
      },
      include: {
        User: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log(note);
    if (!note)
      throw new HttpException(
        'Такой записи не существует',
        HttpStatus.NOT_FOUND,
      );
    await this.prismaService.notes.update({
      where: {
        id: note.id,
      },
      data: {
        User: {
          disconnect: {
            id: userId,
          },
        },
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: 'Отметка убрана',
      },
    };
  }

  async actualNote(noteId: string, userId: string) {
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
      note.author.id === userId ||
      user.moderatedContent.length > 0
    ) {
      await this.prismaService.notes.update({
        where: {
          id: noteId,
        },
        data: {
          isActual: !note.isActual,
        },
      });

      return {
        success: true,
        message: {
          title: 'Успешно',
          description: `Статус статьи изменен на ${
            note.isActual ? '"Неактуально"' : '"Актуально"'
          }`,
        },
      };
    }
    throw new HttpException(
      'Вы не являетесь автором публикации, модератором или администратором',
      HttpStatus.BAD_REQUEST,
    );
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
      note.author.id === userId ||
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

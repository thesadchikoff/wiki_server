import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto, SearchDto } from './dto/create-note.dto';
import { NoteModeratorAction, UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prismaService: PrismaService) {}
  create(createNoteDto: CreateNoteDto, userId: string) {
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
        isAccepted: false,
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
        categories: {
          include: {
            moderators: true,
          },
        },
      },
    });
    if (
      !note.categories.moderators.find((moderator) => moderator.id !== user.id)
    )
      throw new HttpException(
        'Вы не являетесь модератором',
        HttpStatus.FORBIDDEN,
      );

    switch (param.type) {
      case 'ACCEPT':
        await this.prismaService.moderActionLog.create({
          data: {
            type: 'ACCEPT',
            moderatorId: userId,
          },
        });
        return this.prismaService.notes.update({
          where: {
            id: note.id,
          },
          data: {
            isAccepted: true,
          },
        });
      case 'UNACCEPT':
        await this.prismaService.moderActionLog.create({
          data: {
            type: 'UNACCEPT',
            moderatorId: userId,
          },
        });
        this.remove(note.id, user.id);
    }
  }
  findOne(id: string) {
    return this.prismaService.notes.findFirst({
      where: {
        id,
      },
      include: {
        author: true,
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
    )
      return this.prismaService.notes.update({
        where: {
          id: noteId,
        },
        data: {
          isAccepted: false,
          ...updateNoteDto,
        },
      });
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

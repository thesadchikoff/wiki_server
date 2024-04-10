import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoteDto, SearchDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

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
  async getNotesForModeration(userId: string) {
    console.log('Start note handler');
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
    const categoryForModeration = user.categories.map(async (category) => {
      const note = await this.prismaService.notes.findMany({
        where: {
          categoriesId: category.id,
        },
      });
      return note;
    });
    return [...categoryForModeration];
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

    if (note.author.id !== userId)
      throw new HttpException(
        'Вы не являетесь автором публикации',
        HttpStatus.BAD_REQUEST,
      );
    return this.prismaService.notes.update({
      where: {
        id: noteId,
      },
      data: {
        ...updateNoteDto,
      },
    });
  }

  async remove(id: string, userId: string) {
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
    if (postForUserValidate.author.id !== userId)
      throw new HttpException(
        'Вы не являетесь автором публикации',
        HttpStatus.BAD_REQUEST,
      );
    return this.prismaService.notes.delete({
      where: {
        id: postForUserValidate.id,
      },
    });
  }
}

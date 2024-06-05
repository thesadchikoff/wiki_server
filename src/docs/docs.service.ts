import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateDocDto } from './dto/update-doc.dto';

@Injectable()
export class DocsService {
  constructor(private prismaService: PrismaService) {}
  async create(file: Express.Multer.File, userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });
    await this.prismaService.file.create({
      data: {
        fileName: file.originalname,
        fileUrl: file.path,
        userId: user.id,
        size: file.size,
      },
    });
    return {
      success: true,
      message: {
        title: 'Документ загружен',
        description:
          'Документ отправлен на проверку модераторам, ожидайте оповещения',
      },
    };
  }

  findAll() {
    return this.prismaService.file.findMany({
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

  findOne(id: string) {
    return this.prismaService.file.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: number, updateDocDto: UpdateDocDto) {
    return `This action updates a #${id} doc`;
  }

  remove(id: number) {
    return `This action removes a #${id} doc`;
  }
}

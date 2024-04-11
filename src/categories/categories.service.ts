import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private hexString = '0123456789abcdef';
  constructor(private prismaService: PrismaService) {}
  async create(
    createCategoryDto: CreateCategoryDto,
    userId: string,
    file: Express.Multer.File,
  ) {
    const { angle, colorOne, colorTwo } = this.generateGrad();
    const newCategorie = await this.prismaService.categories.create({
      data: {
        title: createCategoryDto.title,
        bannerColorLeft: colorOne,
        bannerColorRight: colorTwo,
        userId: userId,
        angle,
        iconUrl: file && file.path,
      },
    });
    return newCategorie;
  }

  randomColor() {
    let hexCode = '#';
    for (let i = 0; i < 6; i++) {
      hexCode +=
        this.hexString[Math.floor(Math.random() * this.hexString.length)];
    }
    return hexCode;
  }

  generateGrad() {
    let colorOne = this.randomColor();
    let colorTwo = this.randomColor();
    let angle = Math.floor(Math.random() * 360);
    return {
      angle,
      colorOne,
      colorTwo,
    };
  }

  async addNoteToCategory() {}

  findAll() {
    return this.prismaService.categories.findMany({
      include: {
        _count: {
          select: {
            notes: {
              where: {
                isAccepted: true,
              },
            },
          },
        },
      },
    });
  }

  async getCategoryForModeration(userId: string) {
    const user = await this.prismaService.user.findFirst({
      include: {
        moderatedContent: {
          include: {
            _count: true,
            notes: {
              where: {
                isAccepted: false,
              },
            },
          },
        },
        categories: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user.moderatedContent.length)
      throw new HttpException('Вы не модератор', HttpStatus.FORBIDDEN);
    return user.moderatedContent;
  }

  findOne(id: string) {
    return this.prismaService.categories.findFirst({
      where: { id },
      include: {
        moderators: {
          select: {
            id: true,
            email: true,
          },
        },
        notes: { include: { author: { select: { id: true, email: true } } } },
      },
    });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateToken } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  create(data: CreateUserDto) {
    const user = this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    });
    if (!user)
      throw new HttpException(
        { message: 'Ошибка регистрации' },
        HttpStatus.BAD_GATEWAY,
      );
    return user;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async updateRefreshToken(dto: UpdateToken) {
    const refreshToken = this.prisma.refreshToken.create({
      data: {
        user_id: dto.userId,
        refresh_token: dto.refreshToken,
      },
    });

    if (!refreshToken)
      throw new HttpException(
        { message: 'Ошибка генерации токена' },
        HttpStatus.BAD_GATEWAY,
      );

    return refreshToken;
  }

  async removeRefreshToken(userId: string) {
    const removeRefreshToken = this.prisma.refreshToken.delete({
      where: {
        user_id: userId,
      },
    });

    if (!removeRefreshToken)
      throw new HttpException(
        { message: 'Sign Out Error' },
        HttpStatus.BAD_GATEWAY,
      );

    return removeRefreshToken;
  }

  async findByEmailOrId(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
      include: {
        moderatedContent: true,
      },
    });
  }
}

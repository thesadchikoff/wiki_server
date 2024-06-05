import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramDto } from 'src/telegram/dto/telegram.dto';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateUserDto, UpdateToken } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private telegramService: TelegramService,
  ) {}
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

  hashData(data: string) {
    return argon2.hash(data);
  }

  async validCode(code: string) {
    const hashCode = this.generateCodeAndHash(code);
    const preUser = await this.prisma.preRegisterUser.findFirst({
      where: {
        verifyCode: hashCode,
      },
    });
    if (!preUser) {
      if (preUser.writeCount > 3) {
        await this.prisma.preRegisterUser.delete({
          where: {
            id: preUser.id,
          },
        });
        return {
          success: false,
          message: {
            title: 'Failed',
            description:
              'Количество попыток исчерпано, зарегистрируйтесь снова',
          },
        };
      }
      await this.prisma.preRegisterUser.update({
        where: {
          id: preUser.id,
        },
        data: {
          writeCount: preUser.writeCount + 1,
        },
      });
      throw new HttpException(
        `Неверный код, у вас осталось ${preUser.writeCount++} попыток`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.create({ email: preUser.email, password: preUser.password });
    await this.prisma.preRegisterUser.delete({
      where: {
        id: preUser.id,
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно!',
        description: 'Аккаунт успешно зарегистрирован',
      },
    };
  }

  async createTempUser(data: CreateUserDto) {
    const validUser = await this.findByEmailOrId(data.email);
    if (validUser)
      throw new HttpException('Запрос отклонен', HttpStatus.BAD_REQUEST);
    const code = this.generateCodeAndHash();
    console.log(this.decodeBase64(code));
    const hash = await this.hashData(data.password);
    const preUser = await this.prisma.preRegisterUser.create({
      data: {
        email: data.email,
        password: hash,
        verifyCode: code,
      },
    });
    this.emailService.sendMailForVerify(
      preUser.email,
      `${process.env.PRODUCTION_FRONTEND_URL}verify/${code}`,
    );
    if (!preUser)
      throw new HttpException(
        { message: 'Ошибка регистрации' },
        HttpStatus.BAD_GATEWAY,
      );
    return preUser;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async changePassword(userId: string, newPassword: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newPassword,
      },
    });
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

  generateCodeAndHash(decodeCode?: string): string {
    // Генерируем шестизначный код
    const code = !decodeCode && Math.floor(100000 + Math.random() * 900000);
    console.log(code);
    // Преобразуем код в строку
    const codeString = !decodeCode ? code.toString() : decodeCode.toString();

    return btoa(codeString);
  }

  decodeBase64(encodedString: string): string {
    // Декодируем строку из base64
    return atob(encodedString);
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

  async connectTelegramNotify(userId: string, dto: TelegramDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    console.log(user);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        telegramNotification: true,
      },
    });
    await this.telegramService.activateTelegramNotification(
      user,
      dto.telegramId,
    );
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: 'Вы успешно подключили уведомления через Telegram',
      },
    };
  }

  async disconnectTelegramNotify(userId: string) {
    await this.prisma.telegramAccount.delete({
      where: {
        userId,
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: 'Вы успешно отвязали ваш телеграм аккаунт',
      },
    };
  }

  async toggleTelegramNotify(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        telegramNotification: !user.telegramNotification,
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: `Уведомление в Telegram ${user.telegramNotification ? 'отключены' : 'подключены'}`,
      },
    };
  }

  async toggleEmailNotification(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user)
      throw new HttpException('Сервер ответил с ошибкой', HttpStatus.NOT_FOUND);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailNotification: !user.emailNotification,
      },
    });
    return {
      success: true,
      message: {
        title: 'Успешно',
        description: `Уведомление на почту ${user.emailNotification ? 'отключены' : 'подключены'}`,
      },
    };
  }

  async findByEmailOrId(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
      include: {
        TelegramAccount: true,
        moderatedContent: {
          include: {
            _count: {
              select: {
                notes: {
                  where: {
                    OR: [{ isAccepted: false }, { isEdited: true }],
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

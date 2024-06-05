import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly bot: Telegraf;
  constructor(private prisma: PrismaService) {
    this.bot = new Telegraf(process.env.TG_TOKEN);
  }
  async activateTelegramNotification(user: User, telegramId: string) {
    const telegramNotificationUser =
      await this.prisma.telegramAccount.findFirst({
        where: {
          telegramUserId: telegramId,
        },
      });
    if (telegramNotificationUser) {
      throw new HttpException('Что-то пошло не так', HttpStatus.BAD_REQUEST);
    }
    const telegramUser = await this.bot.telegram.getChat(telegramId);
    const telegramUsePhoto = await this.bot.telegram.getUserProfilePhotos(
      Number(telegramId),
    );
    console.log(telegramUsePhoto.photos);
    const file = await this.bot.telegram.getFile(
      telegramUser.photo.big_file_id,
    );
    const avatarUrl = `https://api.telegram.org/file/bot${process.env.TG_TOKEN}/${file.file_path}`;
    await this.prisma.telegramAccount.create({
      data: {
        // @ts-ignore
        username: telegramUser?.username,
        avatarUrl: avatarUrl,
        telegramUserId: telegramId,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });
    await this.sendMessage(
      telegramId,
      'Вы успешно подключили уведомления с сервиса Knowledge Base к своему аккаунту.',
    );
    return {
      message: 'Вы успешно подключили уведомления через Telegram',
    };
  }

  async sendMessageForModeration(categoryId: string) {
    try {
      const category = await this.prisma.categories.findFirst({
        where: {
          id: categoryId,
        },
        include: {
          moderators: {
            include: {
              TelegramAccount: true,
            },
          },
        },
      });
      category.moderators.forEach(async (moderator) => {
        if (moderator.telegramNotification) {
          await this.bot.telegram.sendMessage(
            moderator.TelegramAccount.telegramUserId,
            `*На модерацию поступила новая статья.* Проверить статью можно [по ссылке](https://wiki.credos.ru/mod-panel).`,
            {
              parse_mode: 'Markdown',
            },
          );
        }
        return null;
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendMessageForNotification(
    userId: string,
    message: string,
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          TelegramAccount: true,
        },
      });
      if (user && user.telegramNotification) {
        await this.bot.telegram.sendMessage(
          user.TelegramAccount.telegramUserId,
          message,
          {
            parse_mode: 'Markdown',
          },
        );
      }
      return null;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async sendMessage(chatId: string | number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

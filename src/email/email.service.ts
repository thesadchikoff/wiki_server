import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private prismaService: PrismaService,
  ) {}

  async sendUserConfirmation(categoryId: string) {
    try {
      const category = await this.prismaService.categories.findFirst({
        where: {
          id: categoryId,
        },
        include: {
          moderators: true,
        },
      });
      category.moderators.forEach(async (modrator) => {
        if (modrator.emailNotification) {
          return this.mailerService.sendMail({
            to: modrator.email,
            subject: 'Уведомление от WIKI',
            template: './confirmation',
          });
        }
        return null;
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendMailForVerify(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Регистрация в WIKI',
        template: './verification',
        context: {
          link,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendEmailForAcceptPublishUser(
    email: string,
    categoryId: string,
    noteId: string,
    type: boolean = true,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    try {
      if (!user)
        throw new HttpException(
          'Не удалось отправить уведомление',
          HttpStatus.NOT_FOUND,
        );
      if (user.emailNotification) {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Уведомление от WIKI',
          template: './confirm',
          context: {
            categoryId,
            noteId,
            accept: type,
          },
        });
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }
}

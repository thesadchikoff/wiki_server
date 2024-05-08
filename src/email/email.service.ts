import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
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
        await this.mailerService.sendMail({
          to: modrator.email,
          subject: 'Уведомление от WIKI',
          template: './confirmation',
        });
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
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
}

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
  }

  async sendMailForVerify(email: string, link: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Регистрация в WIKI',
      template: './verification',
      context: {
        link,
      },
    });
  }

  async sendEmailForAcceptPublishUser(
    email: string,
    categoryId: string,
    noteId: string,
    type: boolean = true,
  ) {
    // /categories/832607da-8f87-476c-aade-99d8a3f737b9/note/793e6323-5702-466d-9c5d-d39fe8f8a85b
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
}

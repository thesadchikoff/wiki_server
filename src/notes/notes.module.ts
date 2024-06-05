import { Module } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, PrismaService, EmailService, TelegramService],
})
export class NotesModule {}

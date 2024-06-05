import { Module, forwardRef } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramModule } from 'src/telegram/telegram.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [EmailModule, forwardRef(() => TelegramModule)],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, EmailService],
})
export class UsersModule {}

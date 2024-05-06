import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [EmailModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, EmailService],
})
export class UsersModule {}

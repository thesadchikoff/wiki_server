import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // MailerModule.forRoot({
    //   transport: '',
    // }),
    UsersModule,
    PrismaModule,
    AuthModule,
    NotesModule,
    CategoriesModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService],
})
export class AppModule {}

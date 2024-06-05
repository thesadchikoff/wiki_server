import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EmailModule } from './email/email.module';
import { EmailService } from './email/email.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { DocsModule } from './docs/docs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    PrismaModule,
    AuthModule,
    NotesModule,
    CategoriesModule,
    EmailModule,
    TelegramModule,
    JwtModule.register({}),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploads'), // Путь к папке с файлами
      serveRoot: '/uploads', // URL для доступа к файлам
    }),
    DocsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService, JwtAuthGuard],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/uploads/*'); // Применение middleware к маршруту
  }
}

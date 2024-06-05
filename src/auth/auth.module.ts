import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccessTokenStrategy } from 'src/strategy/auth.strategy';
import { RefreshTokenStrategy } from 'src/strategy/refresh.strategy';
import { TelegramService } from 'src/telegram/telegram.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), UsersModule, forwardRef(() => AuthModule)],
  providers: [
    AuthService,
    UsersService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PrismaService,
    ConfigService,
    EmailService,
    TelegramService,
  ],
  controllers: [AuthController],
  exports: [AuthService, AuthModule],
})
export class AuthModule {}

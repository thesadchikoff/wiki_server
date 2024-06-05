import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => AuthModule)],
  controllers: [TelegramController],
  providers: [TelegramService, PrismaService],
  exports: [TelegramService],
})
export class TelegramModule {}

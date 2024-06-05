import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';

@Module({
  controllers: [DocsController],
  providers: [DocsService, PrismaService],
})
export class DocsModule {}

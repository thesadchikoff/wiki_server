import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { DocsService } from './docs.service';
import { UpdateDocDto } from './dto/update-doc.dto';

type RequestWithUser = Request & { user: User };

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/docs',
        filename: (req, file, cb) => {
          console.log(file);
          const { user } = req as unknown as RequestWithUser;
          const filename: string =
            user['sub'] + '-' + file.originalname.split('.')[0];
          const extension: string = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
          );
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000000 }),
          new FileTypeValidator({ fileType: /pdf/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.docsService.create(file, req.user['sub']);
  }

  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocDto: UpdateDocDto) {
    return this.docsService.update(+id, updateDocDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docsService.remove(+id);
  }
}

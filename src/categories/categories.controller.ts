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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type RequestWithUser = Request & { user: User };

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('category_icon', {
      storage: diskStorage({
        destination: './uploads/category/icons',
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
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: RequestWithUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 30000000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|jpg)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.categoriesService.create(
      createCategoryDto,
      req.user['sub'],
      file,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/moderation')
  getCategoryForModeration(@Req() req: RequestWithUser) {
    console.log('Starting handler in controller');
    return this.categoriesService.getCategoryForModeration(req.user['sub']);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}

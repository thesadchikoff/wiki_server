import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { TelegramDto } from 'src/telegram/dto/telegram.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

type RequestWithUser = Request & { user: User };

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/verify')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.createTempUser(dto);
  }

  @Get('verify-check/:code')
  checkVerify(@Param('code') code: string) {
    return this.usersService.validCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/toggle-email-notification')
  toggleEMailNotification(@Req() req: RequestWithUser) {
    return this.usersService.toggleEmailNotification(req.user['sub']);
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect-telegram-notify')
  connectTelegramNotification(
    @Req() req: RequestWithUser,
    @Body() dto: TelegramDto,
  ) {
    return this.usersService.connectTelegramNotify(req.user['sub'], dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/toggle-telegram-notify')
  toggleTelegramNotify(@Req() req: RequestWithUser) {
    return this.usersService.toggleTelegramNotify(req.user['sub']);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect-telegram-notify')
  disconnectTelegramNotify(@Req() req: RequestWithUser) {
    return this.usersService.disconnectTelegramNotify(req.user['sub']);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByEmailOrId(id);
  }
}

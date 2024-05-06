import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByEmailOrId(id);
  }
}

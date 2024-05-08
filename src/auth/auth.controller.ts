import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';

type RequestWithUser = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('sign-in')
  async signIn(@Body() data: CreateUserDto) {
    return this.authService.signIn(data);
  }

  @Post('sign-up')
  async signUp(@Body() data: CreateUserDto) {
    return this.authService.signUp(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Req() req: RequestWithUser) {
    console.log(req.user);
    this.authService.logout(req.user['sub']);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/change-pass')
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() request: RequestWithUser,
  ) {
    return this.authService.changePassword(dto, request.user['sub']);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user['sub']);
  }
}

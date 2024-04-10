import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const userExist = await this.usersService.findByEmailOrId(
      createUserDto.email,
    );
    if (userExist)
      throw new HttpException(
        { message: 'Ошибка регистрации' },
        HttpStatus.BAD_GATEWAY,
      );
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const { password, ...result } = newUser;
    const tokens = await this.getTokens(newUser.id, newUser.email);
    // await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      user: result,
    };
  }

  async signIn(dto: CreateUserDto) {
    console.log('Sign In');
    const user = await this.usersService.findByEmailOrId(dto.email);
    if (!user)
      throw new HttpException(
        { message: 'Пользователь не найден' },
        HttpStatus.NOT_FOUND,
      );
    const passwordMatches = await this.decodeData(user.password, dto.password);

    if (!passwordMatches)
      throw new HttpException(
        { message: 'Неверно  введен пароль' },
        HttpStatus.BAD_REQUEST,
      );
    const { password, ...result } = user;
    const tokens = await this.getTokens(user.id, user.email);
    // await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      user: result,
    };
  }

  async logout(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  decodeData(data: string, equaled: string) {
    return argon2.verify(data, equaled);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.updateRefreshToken({
      userId,
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '5d' },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findByEmailOrId(userId);
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }
}

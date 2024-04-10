export class CreateUserDto {
  email: string;
  password: string;
}

export class UpdateToken {
  userId: string;
  refreshToken: string;
}

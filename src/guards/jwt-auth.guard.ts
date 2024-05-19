import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// If user create a GET request, user accept password hash who created 
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

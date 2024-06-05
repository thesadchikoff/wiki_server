// jwt.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';

import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtAuthGuard: JwtAuthGuard) {}

  use(req: any, res: any, next: () => void) {
    const context: ExecutionContext = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as ExecutionContext;
    const canActivate$ = this.jwtAuthGuard.canActivate(
      context,
    ) as Observable<boolean>;

    canActivate$.subscribe((canActivate) => {
      if (canActivate) {
        console.log('@@@@');
        next();
      } else {
        console.log('@@@@');

        res.status(401).json({ message: 'Unauthorized' });
      }
    });
  }
}

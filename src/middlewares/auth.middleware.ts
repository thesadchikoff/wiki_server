// auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

type RequestWithUser = Request & { user: User };

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    // Пример проверки аутентификации
    if (req.user['sub']) {
      return next();
    } else {
      return res.status(401).send('Unauthorized');
    }
  }
}

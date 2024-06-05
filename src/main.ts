import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('pug');
  const PORT = process.env.PORT ?? 3000;
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://wiki.credos.ru:8080',
      'https://wiki.credos.ru',
      'http://192.168.88.165:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', 'https://wiki.credos.ru');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      );
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
bootstrap();

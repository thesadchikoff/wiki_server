import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.hbs')
  root() {
    return {
      title: 'Knowledge Base Server',
      actualVersion: 'version 3.21',
    };
  }
}

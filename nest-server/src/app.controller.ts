import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
// import { Ip } from './decorators/ip.decorators';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger();

  @Get()
  getHello(): string {
    // console.log(this.configService.get('ENVIRONMENT'));
    return this.appService.getHello();
  }
}

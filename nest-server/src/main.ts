import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exceptions/http.exceptions';
import { Logger, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { WinstonModule, utilities } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const PORT = 3000;
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('N-UP-NVidia-Inspection')
    .setDescription('N-UP-NVidia-Inspection API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      // class-transformer 적용
      transform: true,
    }),
  );

  await app.listen(PORT);
  console.info(`listening on port ${PORT}`);
  console.info(`STAGE: ${process.env.STAGE}`);
}

bootstrap();

// Nest-Winston을 활용한 로깅
// async function bootstrap() {
//   const PORT = 3000;
//   const app = await NestFactory.create(AppModule, {
//     logger: WinstonModule.createLogger({
//       transports: [
//         new winston.transports.Console({
//           level: process.env.STAGE === 'prod' ? 'info' : 'debug',
//           format: winston.format.combine(
//             winston.format.timestamp(),
//             utilities.format.nestLike('NestJS', { prettyPrint: true }),
//           ),
//         }),
//       ],
//     }),
//   });

//   const configService = app.get(ConfigService);
//   const stage = configService.get('STAGE');

//   // Swagger
//   const SWAGGER_ENV = ['local', 'dev'];
//   if (SWAGGER_ENV.includes(stage)) {
//     app.use(
//       ['/docs', '/docs-json'],
//       basicAuth({
//         challenge: true,
//         users: {
//           [configService.get('swagger.user')]:
//             configService.get('swagger.password'),
//         },
//       }),
//     );
//     const config = new DocumentBuilder()
//       .setTitle('N-UP-NVidia-Inspection')
//       .setDescription('N-UP-NVidia-Inspection API description')
//       .setVersion('1.0')
//       .addBearerAuth()
//       .build();

//     const customOptions: SwaggerCustomOptions = {
//       swaggerOptions: {
//         persistAuthorization: true,
//       },
//     };

//     const document = SwaggerModule.createDocument(app, config);
//     SwaggerModule.setup('docs', app, document, customOptions);
//   }

//   // ValidationPipe 전역 적용
//   app.useGlobalPipes(
//     new ValidationPipe({
//       // class-transformer 적용
//       transform: true,
//     }),
//   );

//   app.useGlobalInterceptors(new TransformInterceptor());
//   await app.listen(PORT, '0.0.0.0');

//   Logger.log(`Listening on port ${PORT}`);
//   Logger.log(`STAGE: ${process.env.STAGE}`);
// }

// bootstrap();

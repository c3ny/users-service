import { NestFactory } from '@nestjs/core';
import { AppModule } from './user.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '../swagger/swagger.config';
import { join } from 'path';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'temp', 'uploads'), {
    prefix: '/uploads/',
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3002);

  console.log(
    `🚀 Users Service running on: http://localhost:${process.env.PORT ?? 3002}`,
  );
  console.log(
    `📚 API Documentation: http://localhost:${process.env.PORT ?? 3002}/api-docs`,
  );
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './user.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from temp/uploads directory
  app.useStaticAssets(join(__dirname, '..', 'temp', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3002);
}

void bootstrap();

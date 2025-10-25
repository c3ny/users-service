import { NestFactory } from '@nestjs/core';
import { AppModule } from './user.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupSwagger } from '../swagger/swagger.config';
import { join } from 'path';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Serve static files for avatar uploads
  app.useStaticAssets(join(__dirname, '..', '..', 'temp', 'uploads'), {
    prefix: '/uploads/',
  });

  // Setup Swagger documentation
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

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common';
import { initNewsletterService, verifyNewsletterService, sendNewsletterEmail } from './userEmailService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    // whitelist: true,
    // forbidNonWhitelisted: true
  }));

  // initNewsletterService();
  // verifyNewsletterService();

  await app.listen(3000);
}
bootstrap();
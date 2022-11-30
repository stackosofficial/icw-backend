import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterEmail, NewsletterEmailSchema } from '../DTO/newsletterEmail';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/events/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NewsletterEmail.name, schema: NewsletterEmailSchema },
    ]),
    HttpModule,
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, UserService],
})
export class NewsletterModule {}

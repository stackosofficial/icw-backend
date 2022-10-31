import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import {NewsletterEmail, NewsletterEmailSchema} from '../DTO/newsletterEmail';

@Module({
  imports: [MongooseModule.forFeature([{name: NewsletterEmail.name, schema: NewsletterEmailSchema}])],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterController],
})
export class NewsletterModule {}
 

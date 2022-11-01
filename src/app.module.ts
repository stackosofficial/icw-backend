import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import {NewsletterModule} from './newsletter/newsletter.module';
import { AppService } from './app.service';
import { EventModule } from './events/event.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule.forRoot(),
    EventModule,
    NewsletterModule,
    MongooseModule.forRoot(process.env.MONGO_HOST,
    {
      dbName: 'local',
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 

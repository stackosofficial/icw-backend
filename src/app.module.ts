import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import {NewsletterModule} from './newsletter/newsletter.module';
import { AppService } from './app.service';
import { EventModule } from './events/event.module';
import { AppController } from './app.controller';
import {ICWModule} from './icw.module';

const test = () => {
  console.log("Mongo test: ",process.env.MONGO_HOST);
  return process.env.MONGO_HOST;
}

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true, envFilePath: ['.env.development'],}),
    ICWModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 

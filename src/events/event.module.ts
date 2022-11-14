import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { EventsService} from './event.service';
import {UserService} from './user.service';
import { AdminController } from './admin.controller';
import { UserController } from './user.controller';
import {Event, EventSchema} from '../DTO/event';
import {NewsletterEmail, NewsletterEmailSchema} from '../DTO/newsletterEmail';
import {HttpModule} from '@nestjs/axios';
import { AdminService } from './admin.service';
import { NewsletterService } from 'src/newsletter/newsletter.service';
import { Admin, AdminSchema } from 'src/DTO/admin';

@Module({
    imports: [MongooseModule.forFeature([{name: Event.name, schema: EventSchema},
            {name: NewsletterEmail.name, schema: NewsletterEmailSchema},
            {name: Admin.name, schema: AdminSchema}]),
    HttpModule],
    providers: [EventsService, UserService, AdminService, NewsletterService],
    controllers: [AdminController, UserController],
})
export class EventModule {}

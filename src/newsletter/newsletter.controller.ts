import {Controller, Get, Post, Body, Param} from '@nestjs/common';
import { EventsService } from '../events/event.service';
import {UserService} from '../events/user.service';
import { NewsletterService } from './newsletter.service';
import { Query } from 'mongoose';

@Controller('newsletter')
export class NewsletterController {

    constructor(private newsletterService: NewsletterService) {}

    @Post()
    async addNewsletterUser(@Body() payload : {email: string}) {
        const resp = await this.newsletterService.addUserAndSendConfirmMail(payload.email);
        return resp;
    }

    @Post('validation/:token')
    async confirmNewsletterUser(@Param('token') token: string) {
        if(!token) {
            return {success: false, reason: 'The token is not valid.'};
        }
        try {
            const res = await this.newsletterService.validateConfirmMail(token);
            return res;
        }
        catch(err) {
            return {success: false, reason: 'An error occured when validating the token.'}
        }
    }
}
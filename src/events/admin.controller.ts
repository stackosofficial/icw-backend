import {Controller, Get, Post, Put, Delete, Param, Body} from '@nestjs/common';
import { EventsService } from './event.service';
import { NewsletterService } from 'src/newsletter/newsletter.service';
import { Event } from '../DTO/event';
import { AdminService } from './admin.service';
import {LoginAuth} from '../DTO/loginAuth'

@Controller('admin')
export class AdminController {

    constructor(private eventsService : EventsService
        ,private adminService: AdminService
        ,private newsletterService: NewsletterService) {}


    @Get('token')
    async getToken()
    {
        const tokenResp = await this.adminService.generateToken(null, false);

        if(!tokenResp) {
            return {
                success: false,
                reason: 'Failed to generate token.'
            }
        }

        return {
            success: true,
            auth: {
                token: tokenResp.token
            }
        };
    }

    @Post('login')
    async adminLogin(@Body() payload) {
        const resp = await this.adminService.login(payload);
        return resp;
    }

    @Post('logout')
    async adminLogout(@Body() payload) {
        const resp = await this.adminService.logout(payload);
        return resp;
    }

    @Post('events')
    async getEvents(@Body() payload)
    {
        const resp = await this.adminService.authorizeAdmin(payload, null);
        if(!resp.success) {
            return resp;    
        }

        const eventList = await this.eventsService.getAllEvents();

        return {
            ...resp,
            eventList
        };
    }

    @Post('modify-events')
    async postEvents(@Body() payload)
    {
        const resp = await this.adminService.authorizeAdmin(payload, null);
        if(!resp.success) {
            return resp;    
        }

        try {
            await this.eventsService.adminSendDeleteMail(payload.modifiedEvents);
        } catch(error) {
            console.error(error);
        }

        const changeRes = await this.eventsService.adminChangeEvents(payload.modifiedEvents);

        if(!changeRes.success) {
            return changeRes;
        }

        await this.eventsService.adminSendApprovedMail(payload.modifiedEvents);

        try {
            const res = await this.eventsService.getAllEvents();
            return {success: true, events: res};
        } catch (error) {
            return {success: true};
        }
    }
    

    @Post('newsletter')
    async getNewsletter(@Body() payload)
    {
        const resp = await this.adminService.authorizeAdmin(payload, null);
        if(!resp.success) {
            return resp;    
        }

        return await this.newsletterService.getNewsletterEmails();
    }

    // @Post('event-file')
    // async getEvents(@Body() payload)
    // {
    //     const resp = await this.adminService.authorizeAdmin(payload, null);
    //     if(!resp.success) {
    //         return resp;    
    //     }

    //     const eventList = await this.eventsService.getAllEvents();

    //     return {
    //         ...resp,
    //         eventList
    //     };
    // }
}
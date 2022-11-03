import {Controller, Get, Post, Put, Delete, Param, Body} from '@nestjs/common';
import { EventsService } from './event.service';
import { Event } from '../DTO/event';

@Controller('admin')
export class AdminController {

    constructor(private eventsService : EventsService) {}

    @Get()
    async getEvents() {
        const eventList = await this.eventsService.getAllEvents();
        return eventList;
    }

    @Post()
    async postEvents(@Body() modifiedEvents) {

        try {
            await this.eventsService.adminSendDeleteMail(modifiedEvents);
        } catch(error) {
            console.error(error);
        }

        const changeRes = await this.eventsService.adminChangeEvents(modifiedEvents);

        if(!changeRes.success) {
            return changeRes;
        }

        await this.eventsService.adminSendApprovedMail(modifiedEvents);

        try {
            const res = await this.eventsService.getAllEvents();
            return {success: true, events: res};
        } catch (error) {
            return {success: true};
        }
    }

}
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
            await this.eventsService.adminChangeEvents(modifiedEvents);
        } catch(error) {
            return {success: false, reason: 'Failed to process the changes.'};
        }

        try {
            const res = await this.eventsService.getAllEvents();
            return {success: true, events: res};
        } catch (error) {
            return {success: true};
        }
    }

}
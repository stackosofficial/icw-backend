import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventsService } from './event.service';
import { Event } from '../DTO/event';
import { UserEvent } from '../DTO/userEventPayload';
import { RealIP } from 'nestjs-real-ip';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private eventsService: EventsService,
    private userService: UserService,
  ) {}

  @Get()
  async getEvents() {
    const approvedEvents = await this.eventsService.getApprovedEvents();
    return approvedEvents;
  }

  @Post()
  async postEvents(@Body() payload: UserEvent, @RealIP() ip: string) {
    if (!payload.token) {
      return {
        success: false,
        reason: 'Captcha is not valid. Please enter captcha again.',
      };
    }

    if (!payload.event) {
      return { success: false, reason: 'Validating event submission failed.' };
    }

    const validate = this.eventsService.validateEvent(payload.event);

    if (!validate.success) {
      return validate;
    }

    // return {success: false, reason: 'invalid payload'};

    const res = await this.userService.validateRecaptcha(payload.token);

    console.log("res: ", JSON.stringify(res.data));

    if (!res || !res.data || !res.data.success)
      return { success: false, reason: 'Failed to autenticate' };

    payload.event.senderIP = ip;

    try {
      await this.eventsService.userAddEvent(payload.event);
    } catch (err) {
      console.error(err);
      return { success: false, reason: 'Failed to add user event.' };
    }

    this.eventsService.userSendSuccessMail(payload.event);

    return { success: true };
  }
}

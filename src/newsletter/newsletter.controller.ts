import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { UserService } from 'src/events/user.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService
    ,private userService: UserService
    ) {}

  @Post()
  async addNewsletterUser(@Body() payload: { email: string, token: string })
  {
    const res = await this.userService.validateRecaptcha(payload.token);

    console.log("res: ", JSON.stringify(res.data));

    if (!res || !res.data || !res.data.success)
      return { success: false, reason: 'Failed to autenticate' };

    const resp = await this.newsletterService.addUserAndSendConfirmMail(
      payload.email,
    );
    return resp;
  }

  @Post('validation/:token')
  async confirmNewsletterUser(@Param('token') token: string) {
    if (!token) {
      return { success: false, reason: 'The token is not valid.' };
    }
    try {
      const res = await this.newsletterService.validateConfirmMail(token);
      return res;
    } catch (err) {
      return {
        success: false,
        reason: 'An error occured when validating the token.',
      };
    }
  }
}

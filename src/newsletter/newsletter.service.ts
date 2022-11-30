import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import {
  NewsletterEmail,
  NewsletterEmailDocument,
} from '../DTO/newsletterEmail';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterEmail.name)
    private letterModel: Model<NewsletterEmailDocument>,
    private mailService: MailerService,
  ) {}

  async addUserAndSendConfirmMail(email: string) {
    let findRes;

    try {
      findRes = await this.letterModel.find({ email });
      if (findRes && findRes.length) {
        return { success: false, reason: 'Email already exists.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, reason: 'Failed to validate the email.' };
    }

    let token = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const nlUser: NewsletterEmail = { email, active: false, validToken: token };

    try {
      const sendLink = `${process.env.FE_DOMAIN}/newsletter/validation/${token}`;
      const emailRes = await this.mailService.sendMail({
        to: email,
        from: process.env.EMAIL_USER,
        subject: 'Confirmation',
        text: `Click on this URL for confirming your email. ${sendLink}`,
      });
    } catch (err) {
      console.error(err);
      return { success: false, reason: 'Failed to send confirmation mail.' };
    }

    try {
      await new this.letterModel(nlUser).save();
    } catch (err) {
      console.error(err);
      return { success: false, reason: 'Failed to save email.' };
    }

    return { success: true };
  }

  async validateConfirmMail(token: string) {
    let findRes;
    try {
      findRes = await this.letterModel.find({
        validToken: token,
        active: false,
      });
      if (!(findRes && findRes.length)) {
        return { success: false, reason: 'The token is not valid.' };
      }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        reason: 'Failed to validate token. Please try again after some time.',
      };
    }

    try {
      const updateDoc = {
        $set: {
          active: true,
          token: '',
        },
      };
      const updateRes = await this.letterModel.updateOne(
        { email: findRes[0].email },
        updateDoc,
      );
      return { success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        reason:
          'Failed to confirm user email. Please try again after sometime.',
      };
    }
  }

  async getNewsletterEmails() {
    try {
      const res = await this.letterModel.find({ active: true });
      return {
        success: true,
        emailList: res,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        reason: 'Failed to retreive the email list.',
      };
    }
  }
}

// https://www.google.com/recaptcha/api/siteverify?secret=${6LdsqrkiAAAAAOLLzdLz5porX_RVOgbp5guMMBXq}&response=

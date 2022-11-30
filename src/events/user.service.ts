import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import {
  NewsletterEmail,
  NewsletterEmailDocument,
} from '../DTO/newsletterEmail';
import { sendNewsletterEmail } from '../userEmailService';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(NewsletterEmail.name)
    private letterModel: Model<NewsletterEmailDocument>,
  ) {}

  async validateRecaptcha(token) {
    const url =`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`; 
    console.log("url: "+ url);
    return await this.httpService.axiosRef.get(
      url
    );
  }
}

// https://www.google.com/recaptcha/api/siteverify?secret=${6LdsqrkiAAAAAOLLzdLz5porX_RVOgbp5guMMBXq}&response=

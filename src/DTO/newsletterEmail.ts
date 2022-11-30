import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterEmailDocument = NewsletterEmail & Document;
@Schema()
export class NewsletterEmail {
  @Prop()
  email: string;

  @Prop()
  active: boolean;

  @Prop()
  validToken: string;
}

export const NewsletterEmailSchema =
  SchemaFactory.createForClass(NewsletterEmail);

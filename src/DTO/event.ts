import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsString, IsNumberString, IsEmail, IsNumber } from 'class-validator';

export type EventDocument = Event & Document;
@Schema()
export class Event {
    
    @Prop()
    @IsNotEmpty()
    name : string;

    @Prop()
    @IsNotEmpty()
    link : string;

    @Prop()
    @IsNumberString()
    from : string;

    @Prop()
    @IsNumberString()
    to : string;

    @Prop()
    @IsNumberString()
    venue : string;

    @Prop()
    @IsNumberString()
    senderIP : string;

    @Prop()
    @IsString()
    status : string;

    @Prop()
    @IsEmail()
    @IsString()
    createdByEmail: string;

    @Prop()
    @IsString()
    phoneNumber: string;

    @Prop()
    @IsString()
    category: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
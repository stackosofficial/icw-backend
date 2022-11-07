import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsNotEmpty, IsString, IsDateString, IsBoolean } from 'class-validator';

export type AdminDocument = Admin & Document;
@Schema()
export class Admin {
    
    @Prop()
    @IsNotEmpty()
    username: string;

    @Prop()
    @IsNotEmpty()
    password : string;

    @Prop()
    @IsNotEmpty()
    @IsDateString()
    loginStart : Date;

    @Prop()
    @IsDateString()
    loginEnd: Date;

    @Prop()
    @IsDateString()
    tokenTime: Date;

    @Prop()
    @IsString()
    baseToken: string;

    @Prop()
    @IsBoolean()
    isLogged: boolean;
}

export function initAdmin(username, password) {
    const admin = new Admin();
    admin.username = username;
    admin.password = password;
    admin.loginStart = new Date();
    admin.loginEnd = new Date();
    admin.tokenTime = new Date();
    admin.baseToken = '';
    admin.isLogged = false;
    
    return admin;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
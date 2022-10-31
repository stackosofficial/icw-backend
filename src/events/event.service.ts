import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Event, EventDocument} from '../DTO/event';
import {NewsletterEmail} from '../DTO/newsletterEmail';
import { sendNewsletterEmail } from '../userEmailService';
import { MailerService } from '@nestjs-modules/mailer';

const categoriesList = [
    "Meetup",
    "Workshop",
    "Conference",
    "Talks & Networking",
    "Networking & After-party",
];


const stringIsAValidUrl = (s, protocols) => {
    try {
        let linkurl = new URL(s);
        
        return protocols
            ? linkurl.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(linkurl.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};

@Injectable()
export class EventsService {

    constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>,private mailService: MailerService ){}

    validateEvent = (event : Event) => {
        let aTime = new Date(event.from);
        let bTime = new Date(event.to);
        const today = new Date();

        if(aTime < today) {
            return {
                success: false,
                reason: 'From time cannot be older than today'
            };
        }
        if(aTime > bTime) {
            return {
                success: false,
                reason: 'From time cannot be older than To time'
            };
        }
        
        if(!stringIsAValidUrl(event.link, ['http', 'https'])) {
            return {
                success: false,
                reason: 'Link is not a valid URL. Enter a HTTP/HTTPS link.'
            };
        }

        if(!event.createdByEmail) {
            return {
                success: false,
                reason: 'Email is not provided.'
            }
        }

        if(event.category && !categoriesList.includes(event.category)) {
            return {
                success: false,
                reason: 'Event category is not valid.'
            }
        }

        return {success: true};
    }

    async userSendSuccessMail(event: Event) {
        return await this.mailService.sendMail({
            to: event.createdByEmail,
            from: process.env.EMAIL_USER,
            subject: 'Your event has been registered.',
            text: `Thanks for registering. Your event ${event.name} is currently under approval.`, 
           });      
    }

    async userAddEvent(event : Event) : Promise<Event> {
        event.status = 'W';
        return new this.eventModel(event).save();
    }

    async adminChangeEvents(eventChanges) : Promise<any> {
        
        const bulkList = [];
        
        var toChangeFlag = false;

        if(eventChanges.updatedEvents) {
            for(const key in eventChanges.updatedEvents) {
                const event = eventChanges.updatedEvents[key];
                bulkList.push({
                    updateOne: {
                        filter: {_id: key},
                        update: event
                    }
                })
                toChangeFlag = true;
            }
        }

        if(eventChanges.addedEvents) {
            for(const key in eventChanges.addedEvents) {
                const event = eventChanges.addedEvents[key];
                if(event._id) {
                    delete event._id;
                }
                if(!event.status) {
                    event.status = 'W';
                }
                bulkList.push({
                    insertOne: { document: {
                            ...event
                        }
                    }
                })
                toChangeFlag = true;
            }
        }

        if(eventChanges.deletedEvents) {

            for(var i = 0; i < eventChanges.deletedEvents.length; i++) {
                const eventID = eventChanges.deletedEvents[i];
                bulkList.push( { deleteOne: { filter: { _id: eventID } } } );
                toChangeFlag = true;
            }
        }

        if(toChangeFlag) {
            return this.eventModel.bulkWrite(bulkList);
        }
        
        return null;
    }

    async getApprovedEvents() : Promise<any> {
        return await this.eventModel.find({status: 'A'});
    }

    async getAllEvents() : Promise<any> {
        return await this.eventModel.find();
    }

}
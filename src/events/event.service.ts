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

        if(event.name.length > 32) {
            return {
                success: false,
                reason: 'name should be less than 32 characters.'
            };
        }

        if(event.venue && event.venue.length > 32) {
            return {
                success: false,
                reason: 'Venue should be less than 32 characters.'
            };
        }

        if(event.createdByEmail.length > 254) {
            return {
                success: false,
                reason: 'Email length is too big.'
            };
        }

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
        try {
            await this.mailService.sendMail({
                to: event.createdByEmail,
                from: process.env.EMAIL_USER,
                subject: 'Your event has been registered.',
                text: `Thanks for registering. Your event ${event.name} is currently under approval.`, 
               }); 
        }
        catch(err) {
            console.error(err);
        }
    }

    async adminSendApprovedMail(modifiedEvents) {
        const updatedEvents = modifiedEvents.updatedEvents;
        if(updatedEvents) {
            for(const key in updatedEvents) {
                if(updatedEvents[key].status == 'A') {
                    const approvedEvent = await this.eventModel.find({_id: key});
                    if(approvedEvent && approvedEvent.length > 0 && approvedEvent[0].createdByEmail) {
                        try {
                            await this.mailService.sendMail({
                                to: approvedEvent[0].createdByEmail,
                                from: process.env.EMAIL_USER,
                                subject: 'Your event has been approved.',
                                text: `Your event ${approvedEvent[0].name} is approved and will be displayed on our website.`, 
                               });   
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
        }
    }

    async adminSendDeleteMail(modifiedEvents) {
        const deletedEvents = modifiedEvents.deletedEvents;
        if(deletedEvents) {
            for(var i = 0; i < deletedEvents.length; i++) {
                const {eventID, reason} = deletedEvents[i];
                console.log("before sending deleted email: ", JSON.stringify(deletedEvents[i]));
                
                const deletedEvent = await this.eventModel.find({_id: eventID});

                console.log("message sent to user, ",`Your event ${deletedEvent[0].name} is ${deletedEvent[0].status == 'A' ? 'deleted': 'rejected'}. ${reason? `reason: ${reason}`: ''}`)
                if(deletedEvent && deletedEvent.length > 0 && deletedEvent[0].createdByEmail) {
                    try {
                        await this.mailService.sendMail({
                            to: deletedEvent[0].createdByEmail,
                            from: process.env.EMAIL_USER,
                            subject: deletedEvent[0].status == 'A' ? 'Your event has been deleted.' : 'Your event has been rejected.',
                            text: `Your event ${deletedEvent[0].name} is ${deletedEvent[0].status == 'A' ? 'deleted': 'rejected'}. ${reason? `reason: ${reason}`: ''}`, 
                           });   
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    async userAddEvent(event : Event) : Promise<Event> {
        event.status = 'W';
        return new this.eventModel(event).save();
    }

    async adminChangeEvents(eventChanges) {
        
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
                console.log("checking deleted events: "+ JSON.stringify(eventChanges.deletedEvents));
                const {eventID} = eventChanges.deletedEvents[i];
                bulkList.push( { deleteOne: { filter: { _id: eventID } } } );
                toChangeFlag = true;
            }
        }

        if(toChangeFlag) {
            try {
                await this.eventModel.bulkWrite(bulkList);
            } catch(err) {
                console.error(err);
                return {success: false, reason: 'Failed to process the changes.'};
            }
       }

        return {success: true};
    }

    async getApprovedEvents() : Promise<any> {
        return await this.eventModel.find({status: 'A'})
        .select({
            _id: 0,
            name: 1,
            link: 1,
            venue: 1,
            category: 1,
            from: 1,
            to: 1
        })
        ;
    }

    async getAllEvents() : Promise<any> {
        return await this.eventModel.find();
    }

}
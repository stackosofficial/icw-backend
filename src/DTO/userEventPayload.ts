import { Event } from './event';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class UserEvent {
  @IsNotEmpty()
  token: string;

  @ValidateNested()
  event: Event;
}

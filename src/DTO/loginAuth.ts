

import { IsNotEmpty, ValidateNested } from 'class-validator';

export class LoginAuth {

    @IsNotEmpty()
    auth : {token: string };
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {

    @Get('me') 
    getme(@GetUser()user : User,
    //@GetUser('email') email : string
    ) 
    {
        //console.log({email},)
        return user;
    }
}

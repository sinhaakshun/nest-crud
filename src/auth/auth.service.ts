import { ForbiddenException, Injectable, Req } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()

export class AuthService {

    constructor(private prisma : PrismaService,
        private jwt : JwtService,
        private config : ConfigService,
        ){}

    async signup(dto : AuthDto){

        //generate pwd hash
        const hash = await argon.hash(dto.password);

        //save user in db
        const User = await this.prisma.user.create({
            data : {
                email : dto.email,
                hash,
            }
        })

        delete User.hash ;

        return User;
    }

    async signin(dto : AuthDto){

        const user = await this.prisma.user.findFirst({
            where : {
                email : dto.email
            },
        })

        if(!user){
            throw new ForbiddenException(
                'Credentials incorrect'
            )
        }

        const pwdMatch = await argon.verify(
            user.hash,
            dto.password,
        )

        if(!pwdMatch){
            throw new ForbiddenException(
                'Credentials incorrect'
            )
        }

        delete user.hash ;
        return this.signToken(user.id, user.email);
    }

    async signToken(
        userId : number,
        email : string,
    ) : Promise<{access_token : string}>{
        const data = {
            sub : userId,
            email
        }
        const secret = this.config.get('SECRET_KEY');

        const token = await this.jwt.signAsync(data, {
            expiresIn : '2h',
            secret : secret
        });

        return { 
            access_token : token
        }
    }

}
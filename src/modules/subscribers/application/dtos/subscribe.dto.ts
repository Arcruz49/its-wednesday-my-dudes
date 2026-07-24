import { IsEmail, IsNotEmpty } from "class-validator";

export class SubscribeDTO{
    @IsEmail({}, {message: 'Email inválido'})
    @IsNotEmpty()
    email!: string;
}
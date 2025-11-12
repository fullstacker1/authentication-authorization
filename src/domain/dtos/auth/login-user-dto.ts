import { regularExps } from "../../../config/reagular-exp";


export class LoginUserDto {
    constructor(
        public email: string,
        public password: string,
    ) { }
        static loggin (object: { [key: string]: any }): [ string?, LoginUserDto?] {
        const { email, password } = object;

        if(!email ) return ['Email is required', undefined];
        
        if(!regularExps.email.test(email))return ['Email is invalid'];
        
        if(!password ) return ['Password is required', undefined];
        
        if(password.length < 6) return ['Password must be at least 6 characters long', undefined];

        return [undefined, new LoginUserDto( email, password)];

    }
}
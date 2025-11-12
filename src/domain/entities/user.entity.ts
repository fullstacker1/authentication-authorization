import { CustomError } from "./errors/custom.errors"

export class UserEntity {
    constructor(
        public id: string,
        public name: string,
        public password: string,
        public role: string[],
        public emailValidated: boolean,
        public email: string,
        public image?: string,   
    ) {}

    static fromObject(object:{ [key:string]:any}){
        const {
            id,
            _id,
            name,
            password,
            role,
            emailValidated,
            email,
            image,
        } = object
    
        if(!_id && !id) {
            throw CustomError.badRequest("id is required")
        }

        if(!name) {
            throw CustomError.badRequest("name is required")
        }

        if(!email) {
            throw CustomError.badRequest("email is required")
        }

        if(emailValidated === undefined) {
            throw CustomError.badRequest("emailValidated is required")
        }

        if(!password) {
            throw CustomError.badRequest("password is required")
        }

        if(!role) {
            throw CustomError.badRequest("role is required")
        }

        
        return new UserEntity(
            id || _id,
            name,
            password,
            role,
            emailValidated,
            email,
            image,
        )
    
    }


}
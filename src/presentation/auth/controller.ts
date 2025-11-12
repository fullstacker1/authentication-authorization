import { Request, Response } from 'express';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { AuthService } from './services/auth.service';
import { CustomError } from '../../domain';
import { LoginUserDto } from '../../domain/dtos/auth/login-user-dto';

export class AuthController {

    constructor(
        public readonly authService: AuthService            
    ) { }

     private handleError(error: unknown, res: Response) {
            
            if(error instanceof CustomError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
    
            console.log(error);
            
            return res.status(500).json({ message: 'Internal Server Error' });
    
        }

    registerUser = (req: Request, res: Response) => {

        const [error, registerDto] = RegisterUserDto.create(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        this.authService.registerUser(registerDto!)
         .then((user) => { res.json(user) })
         .catch((error) => this.handleError(error, res))
    
    }

    loginUser = (req: Request, res: Response) => {
        
        const [error, loginDto] = LoginUserDto.loggin(req.body);
        
        if (error) {
            return res.status(400).json({ message: error });
        }
        
        this.authService.loginUser(loginDto!)
        .then((user) => { res.json(user) })
        .catch((error) => this.handleError(error, res))

    }

    validateEmail = (req: Request, res: Response) => {
        const { token } = req.params;
        res.status(200).json({ message: `Email validated with token: ${token}` });
    }

}
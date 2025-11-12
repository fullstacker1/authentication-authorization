import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.services';
import { envs } from '../../config';


export class AuthRoutes {


    static get routes(): Router {

        const router = Router();
        
        const emailService = new EmailService(
            envs.MAILER_SERVICE,
            envs.MAILER_EMAIL,
            envs.MAILER_EMAIL_PASSWORD
          );
        const authService = new AuthService(emailService)

        const authController = new AuthController(authService);

        // Definir las rutas
        // router.use('/api/todos', /*TodoRoutes.routes */ );

        router.post('/login', authController.loginUser)

        router.post('/register', authController.registerUser)

        router.get('/validate-email/:token', authController.validateEmail)


        return router;
    }


}

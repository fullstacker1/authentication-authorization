
import { bcryptAdapter } from "../../../config";
import { UserModel } from "../../../data";
import { CustomError } from "../../../domain";
import { LoginUserDto } from "../../../domain/dtos/auth/login-user-dto";
import { RegisterUserDto } from "../../../domain/dtos/auth/register-user.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { JwtAdapter } from "../../../config/jwt.adapter";
import { EmailService } from "./email.services";
import { env } from "process";


export class AuthService {

    constructor(

        private readonly emailService: EmailService

    ) { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });

        if (existUser) throw CustomError.badRequest('Email is already in use');

        try {

            const user = new UserModel(registerUserDto);
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();

            this.sendEmailValidationLink(user.email);

            const { password, ...rest } = UserEntity.fromObject(user)

            return { ...rest }

        } catch (error) {

            throw CustomError.internalServerError(`${error}`);

        }

    }

    public async loginUser(loginUserDto: LoginUserDto) {

        const user = await UserModel.findOne({ email: loginUserDto.email });
        const email = await UserModel.find({}, { email: loginUserDto.email, _id: 0 });

        if (!user) throw CustomError.unauthorized('Invalid email or password');

        if (email[0].email !== loginUserDto.email) throw CustomError.unauthorized('Invalid email or password');

        const isPasswordValid = bcryptAdapter.compare(loginUserDto.password, user.password);

        if (!isPasswordValid) throw CustomError.unauthorized('Invalid email or password');

        const { password, ...rest } = UserEntity.fromObject(user)

        const token = await JwtAdapter.generateToken({ id: user._id, email: user.email });

        if (!token) throw CustomError.internalServerError('Token generation failed');

        return { ...rest, token: token }

    }

    private sendEmailValidationLink = async (email: string) => {

        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServerError('Token generation failed for email validation');

        const validationLink = `${env.WEB_SERVICE_URL}/auth/validate-email/${token}`;

        const html =
            `<h1>Email Validation</h1>
            <p>Please click the link below to validate your email address:</p>
            <a href="${validationLink}">Validate Email</a>
            <p>If you did not request this, please ignore this email.</p>
            `;

        const options = {
            to: email,
            subject: 'Email Validation',
            htmlBody: html,
        };

        const isSent = await this.emailService.sendEmail(options);
        if (!isSent) throw CustomError.internalServerError('Failed to send email validation link');

    }

    public async validateEmail(token: string) {

        const payload = await JwtAdapter.verifyToken(token);

        if (!payload) throw CustomError.unauthorized('Invalid or expired token');

        const { email } = payload as { email: string };
        if (!email) throw CustomError.internalServerError('Failed to extract email from token');

        const user = await UserModel.findOne({ email });
        if (!user) throw CustomError.internalServerError('User not found for the provided email');

        user.emailValidated = true;
        await user.save();

        return true;

    }

}




import { bcryptAdapter } from "../../../config";
import { UserModel } from "../../../data";
import { CustomError } from "../../../domain";
import { LoginUserDto } from "../../../domain/dtos/auth/login-user-dto";
import { RegisterUserDto } from "../../../domain/dtos/auth/register-user.dto";
import { UserEntity } from "../../../domain/entities/user.entity";
import { JwtAdapter } from "../../../config/jwt.adapter";


export class AuthService {
    constructor() { }

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });

        if (existUser) throw CustomError.badRequest('Email is already in use');

        try {

            const user = new UserModel(registerUserDto);
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();

            const { password, ...rest } = UserEntity.fromObject(user)

            return { ...rest }

        } catch (error) {

            throw CustomError.internalServerError(`${error}`);

        }

    }

    public async loginUser(loginUserDto: LoginUserDto) {

        const user = await UserModel.findOne({ email: loginUserDto.email });
        const email = await UserModel.find({}, { email: loginUserDto.email, _id:0 });     

        if (!user) throw CustomError.unauthorized('Invalid email or password');

        if(email[0].email !== loginUserDto.email) throw CustomError.unauthorized('Invalid email or password');

        const isPasswordValid = bcryptAdapter.compare(loginUserDto.password, user.password);

        if (!isPasswordValid) throw CustomError.unauthorized('Invalid email or password');

        const { password, ...rest } = UserEntity.fromObject(user)

        const token = await JwtAdapter.generateToken({ id: user._id, email: user.email });

        if(!token) throw CustomError.internalServerError('Token generation failed');

        return { ...rest, token: token }

    }

} 

import jwt, { SignOptions } from 'jsonwebtoken';
import { envs } from './envs';

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {

    constructor() { }

    static async generateToken(payload: object, duration: string = '2h') {

        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: duration } as SignOptions, (err, token) => {

                if (err) return resolve(null);

                resolve(token)

            })
        })

    }

    static verifyToken(token: string): object | null {
        // Dummy implementation for token verification

        return new Promise((resolve) => {
            jwt.verify(token, JWT_SEED, (err, decoded) => {

                if (err) { resolve(null); }

                resolve(decoded)

            })
        })

    }


}
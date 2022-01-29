import { Request, Response } from 'express';
import { User } from '../entity/User';
import { BaseEntity, getRepository } from 'typeorm';
import { validate } from 'class-validator';
import { updateUser } from 'src/Repository';

class AuthController extends BaseEntity {
    static login = async (req: Request, res: Response) => {
        const {email, password} = req.body;
        if(!(email&&password)) {
            res.status(400).send('Reuires email and passwerd, both!')
        }

        const userRepository = getRepository(User);
        try {
            let user = await userRepository.findOne({email: email});
            if (user && !user.isValidPassword(password)) {
                res.status(401).send('araswori password!')
                return
            }
            res.status(200).json({access_token: user?.generateJWT()});
        } catch (error) {
            res.status(401).send('araavtorizebulio - Unauthorized')
        }
    }

    static register = async (req: Request, res: Response) => {
        const {email, password} = req.body;
        let user = new User();

        user.email = email;
        user.password = user.setPassword(password);

        const errors = await validate(user);
        if(errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch (error) {
            res.status(409).send('User ukve arsebobs, exists and etc...')
            return;
        }
        res.status(201).send('User has been created!');
    }

    static updateUser = async (req: Request, res: Response) => {
        
    }
}
export default AuthController;
import { Request, Response } from 'express';
import { User } from '../entity/User';
import { BaseEntity, getRepository, getConnection } from 'typeorm';
import { validate } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

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
                res.status(401).send('Incorrect password!')
                return;
            }
            const payload = {
                email: user?.email,
                id: user?.id
            }
            const token = jwt.sign(payload, 'secret', {expiresIn: '15m'})
            res.cookie('session-token', token)
            res.status(200).json({access_token: user?.generateJWT(), token: token});
        } catch (error) {
            res.status(400).send('Bad Request')
        }
    }

    static logout = async (req: Request, res: Response) => {
        res.clearCookie('session-token')
        res.clearCookie('access_token')
        res.send('logout').redirect('/login')
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
        const {firstName, lastName, email, password} = req.body;
        const userRepository = getRepository(User);
        try {
            let user = await userRepository.findOne({email: email});
            if (user && !user.isValidPassword(password)) {
                res.status(401).send('araswori password!')
                return
            }
            if (firstName != '' && email != '' && lastName != '' && password != '') {
                await getConnection()
                    .createQueryBuilder()
                    .update(User)
                    .set({ firstName: firstName, lastName: lastName, email: email, password: bcrypt.hashSync(password, 8) })
                    .where("email = :email", { email: email })
                    .execute();
            } else {
                res.status(400).send('Empty fields')
            }
        } catch (error) {
            res.status(409).send('Some kind of error')
        }
    }

    static getAllUsers = async (req: Request, res: Response) => {
        try {
            const result = await getRepository(User).createQueryBuilder('user').getMany();
            res.status(200).json(result);
        } catch (error) {
            res.status(400).send('Bad request');
        }
    }
}
export default AuthController;
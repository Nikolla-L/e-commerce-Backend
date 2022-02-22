import e, { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { BaseEntity, getRepository, getConnection } from 'typeorm';
import { validate } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const nodemailer = require("nodemailer");
const {OAuth2Client} = require('google-auth-library');

const googleClient = new OAuth2Client(`1068850605287-o1pignk020ft6da6c5ijovube2km1k49.apps.googleusercontent.com`);

const sendMail = async (email: string, code: string) => {
    let transporter = await nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'eCommerseTeam@gmail.com',
            pass: 'kuzanovi0000'
        }, 
        tls:{
            rejectUnauthorized:false
        }
    }); 
    let info = await transporter.sendMail({
        from: '"e_commerse" <eCommerseTeam@gmail.com>',
        to: email,
        subject: "mailer testing", 
        html: `<p>ერთჯერადი კოდია: <span style='color:red'>${code}</span>;</p>`,
    });
  
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
// function to generater random numbers string
const generateString = () => {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
        result += characters.charAt(Math.floor(Math.random()*charactersLength));
    }
    return result;
}
// email validation
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

class AuthController extends BaseEntity {
    static login = async (req: Request, res: Response) => {
        const {email, password} = req.body;
        
        if(!(email&&password)) {
            return res.status(400).send('Reuires email and passwerd, both!')
        }

        if(!emailRegexp.test(email)) {
            return res.status(400).send('Bad request: email is not valid')
        }

        try {
            let user = await getRepository(User).findOne({email: email});
            if(!user) {
                return res.status(404).send('User not found')
            }
            if (user && !user.isValidPassword(password)) {
                return res.status(401).send('Incorrect password!')
            }
            const payload = {
                email: user?.email,
                id: user?.id
            }
            const token = jwt.sign(payload, 'secret', {expiresIn: '30m'})
            res.cookie('session-token', token)
            return res.status(200).json({token: token, userData: user});
        } catch (error) {
            return res.status(400).send('Bad Request')
        }
    }

    static logout = async (req: Request, res: Response) => {
        let token = req.cookies['session-token'];
        if (token) {
            res.clearCookie('session-token');
            return res.status(200).send('logout');
        } else {
            return res.status(200).send('You are not authorized');
        }
    }

    static register = async (req: Request, res: Response) => {
        const {firstName, lastName, userName, email, password} = req.body;

        if(password =='' || email == '' || email == null || password == null) {
            return res.status(400).send('Please insert all values')
        }

        if(!emailRegexp.test(email)) {
            return res.status(400).send('Bad request: email is not valid')
        }

        let user = new User();
        user.firstName = firstName;
        user.lastName = lastName;
        user.userName = userName;
        user.email = email;
        user.password = user.setPassword(password);

        const errors = await validate(user);
        if(errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        const userRepository = getRepository(User);

        let userNameExists = await userRepository.findOne({userName: userName});
        let emailExists = await userRepository.findOne({email: email});
        if(emailExists) {
            return res.status(400).send('Email is already taken');
        }
        if(userNameExists) {
            return res.status(400).send('Account with this username already exists, try another');
        }

        try {
            await userRepository.save(user);
        } catch (error) {
            return res.status(403).send('Ops.. Occurred an error. Please try later.')
        }

        return res.status(201).json(user);
    }

    static updateUser = async (req: Request, res: any) => {
        const {firstName, lastName, userName, email} = req.body;
        const userRepository = getRepository(User);
        
        let token = req.cookies['session-token'];
        if(!token) {
            return res.status(401).send('U need authorization')
        }
        let oldEmail = Object(jwt.verify(token, 'secret')).email

        try {
            let user = await userRepository.findOne({email: oldEmail});
            let emailExists = await userRepository.findOne({email: email});
            let userNameExists = await userRepository.findOne({userName: userName});

            if(!emailRegexp.test(email) && email) {
                return res.status(400).send('Bad request: email is not valid');
            }
            if(emailExists && email != oldEmail) {
                return res.status(400).send('Email is already taken');
            }
            if(userNameExists && userName != user?.userName) {
                return res.status(400).send('Account with this username already exists, try another');
            }

            if(user) {
                let updatedValues = {
                    firstName: firstName ? firstName : user.firstName,
                    lastName: lastName ? lastName : user.lastName,
                    userName: userName ? userName : user.userName,
                    email: email ? email : user.email
                }
                await userRepository.update({email: oldEmail}, updatedValues)
                return res.status(200).json(updatedValues)
            }
        } catch (error) {
            return res.status(403).send('Ops.. Occurred an error. Please try later.');
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

    static sendMail = async (req: Request, res: any) => {
        const {email} = req.body;
        let user = await getRepository(User).findOne({email: email});
        if(user) {
            let code = generateString();
            sendMail(email, code).then(()=>{
                getConnection()
                .createQueryBuilder()
                .update(User)
                .set({resetCode: code})
                .where("email = :email", { email: email })
                .execute();
                return res.status(200).send('Code has been send');
            }).catch(e => {
                return res.status(400).send('Bad request');
            })
        } else {
            return res.status(404).send('User was not found');
        }
    }

    static checkCode = async (req: Request, res: any, next: NextFunction) => {
        const {email, code} = req.body
        let user = await getRepository(User).findOne({email: email});
        let resetCode = user?.resetCode;
        if(code == resetCode) {
            next();
        } else {
            return res.status(400).send("Code's incorrect");
        }
    }

    static resetPassword = async (req: Request, res: any) => {
        const {email, newPassword, confirmPassword} = req.body;
        let user = await getRepository(User).findOne({email: email});
        if(user) {
            if (newPassword === confirmPassword && newPassword != null) {
                // clear code column & set new password
                getConnection()
                .createQueryBuilder()
                .update(User)
                .set({resetCode: 'null', password: bcrypt.hashSync(newPassword, 8)})
                .where("email = :email", { email: email })
                .execute();
                res.status(200).send('Success')
            } else if (newPassword == null) {
                res.status(403).send("continue")
            } else {
                res.status(404).send("Insert both same passwords")
            }
        } else {
            return res.status(400).send("User doesn't exist")
        }
    }
      
    static googleAuth = async (req: any, res: any) => {
        const {token} = req.body

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: `1068850605287-o1pignk020ft6da6c5ijovube2km1k49.apps.googleusercontent.com`
        });

        const payload = await ticket.getPayload();
        let user = await getRepository(User).findOneOrFail({email: payload?.email})

        if(!user) {
            res.status(404).send('User does not exist, please register at first')
        }

        try {
            const p = {
                email: user?.email,
                id: user?.id
            }
            const t = jwt.sign(p, 'secret', {expiresIn: '30m'})
            res.cookie('session-token', t);
            return res.status(200).json({user: payload, userData: user})
        } catch (error) {
            return res.status(400).send('Bad request')
        }
    }
}

export default AuthController;
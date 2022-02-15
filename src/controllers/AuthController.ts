import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { BaseEntity, getRepository, getConnection } from 'typeorm';
import { validate } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const nodemailer = require("nodemailer");
const {OAuth2Client} = require('google-auth-library');

const googleClient = new OAuth2Client({
    clientId:`1068850605287-o1pignk020ft6da6c5ijovube2km1k49.apps.googleusercontent.com`
});

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
            res.status(200).json({token: token, userData: user});
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
        const {firstName, lastName, userName, email, password} = req.body;
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
        let emailExists = await userRepository.findOne({email: email});
        let userNameExists = await userRepository.findOne({userName: userName});

        if(userNameExists) {
            res.status(400).send('Account with this username already exists, try another');
            return;
        }
        
        if(emailExists) {
            res.status(400).send('Email is already taken');
            return;
        }

        try {
            await userRepository.save(user);
        } catch (error) {
            res.status(409).send('User ukve arsebobs, exists and etc...')
            return;
        }
        res.status(201).json(user);
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

    static sendMail = async (req: Request, res: Response) => {
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
                res.status(200).send('Code has been send');
            }).catch(e => {
                res.status(400).send('Bad request');
            })
        } else {
            res.status(404).send('User was not found');
        }
    }

    static checkCode = async (req: Request, res: Response, next: NextFunction) => {
        const {email, code} = req.body
        let user = await getRepository(User).findOne({email: email});
        let resetCode = user?.resetCode;
        if(code == resetCode) {
            next();
        } else {
            res.status(400).send("Code's incorrect");
            return;
        }
    }

    static resetPassword = async (req: Request, res: Response) => {
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
            res.status(400).send("User doesn't exist")
        }
    }
      
    static googleAuth = async (req: Request, res: Response) => {
        const { token } = req.body;
      
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audient: `1068850605287-o1pignk020ft6da6c5ijovube2km1k49.apps.googleusercontent.com`,
        });
      
        const payload = ticket.getPayload();
      
        let user = await getRepository(User).findOne({email: payload?.email});
        if (!user) {
          let user = new User();
          user.email = payload?.email;
          user.firstName = payload?.name
      
          await getRepository(User).save(user);
        }
      
        res.status(200).json({ user, token });
    };
}

export default AuthController;
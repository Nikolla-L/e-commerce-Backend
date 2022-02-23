import { Request, Response } from 'express';
import { Email } from '../entity/Email';
import { BaseEntity, getRepository } from 'typeorm';
import { sendWelcome } from '../service/Mailer';

// email validation
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

class SubscribeController extends BaseEntity {
    static addEmail = async (req: Request, res: any) => {
        const email = req.body.email;

        if(email == '' || email == null) {
            return res.status(400).send('Bad request');
        }
        if(!emailRegexp.test(email)) {
            return res.status(400).send('Bad request: email is not valid')
        }

        let hasAlreadySubscribed = await getRepository(Email).findOne({email: email});
        if(hasAlreadySubscribed) {
            return res.status(400).send('You have already subscirbed');
        }

        try {
            await getRepository(Email).save({email: email});
        } catch (error) {
            return res.status(400).send('Ops... occured some issue. Please try later');
        }
        
        sendWelcome(email)
        .then(() => res.status(200).send('Success'))
        .catch(error => res.status(400).send('Ops... occured issue, please try later'))
    }

    static getEmails = async (req: Request, res: Response) => {
        try {
            const result = await getRepository(Email).createQueryBuilder('email').getMany();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).send('Bad request');
        }
    }

    static deleteEmail = async (req: Request, res: Response) => {
        const id = req.params.id;
        if(id) {
            try {
                await getRepository(Email).delete(id);
                return res.status(200).send("Subscriber's email removed");
            } catch (error) {
                return res.status(404).send('Subscriber not found');
            }
        } else {
            return res.status(400).send('Bad request: missing Id');
        }
    }
}

export default SubscribeController;
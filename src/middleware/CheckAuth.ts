import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkAuthenicated = (req: any, res: any, next: NextFunction) => {
    let token = req.cookies['session-token'];

    if (!token) {
        res.status(401).send('You are not authorized!')
    }

    const verify = async () => {
        const payload = jwt.verify(token, 'secret')
    }

    verify().then(() => {
        next();
    }).catch(error => 
        res.send('U are not authorized!')
    )
}
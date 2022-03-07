import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkAuthenicated = (req: any, res: any, next: NextFunction) => {
    let token = req.cookies['session-token'];
    let headerToken = req.headers.authorization.split(" ")[1];

    if (!token && !headerToken) {
        return res.status(401).send('You are not authorized!');
    }

    const verify = async () => {
        const payload = jwt.verify(token || headerToken, 'secret');
    }

    verify()
    .then(() => next())
    .catch(error =>  res.send('You are not authorized!'));
}
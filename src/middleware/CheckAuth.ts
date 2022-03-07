import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkAuthenicated = (req: any, res: any, next: NextFunction) => {
    let headerToken = req.headers.authorization.split(" ")[1];

    if (!headerToken) {
        return res.status(401).send('You are not authorized!');
    }

    const verify = async () => {
        const payload = jwt.verify(headerToken, 'secret');
    }

    verify()
    .then(() => next())
    .catch(error =>  res.send('You are not authorized!'));
}
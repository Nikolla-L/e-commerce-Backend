import express from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import BodyParser from 'body-parser';
import cors from 'cors';
import productRouter from "./routes/productRoutes";
import authRouter from "./routes/authRoutes";

const port = 3001;

createConnection()
    .then(async connection => {
        const app = express();
        app.use(cors())
        app.use(BodyParser.json());

        app.use('/product', productRouter)
        app.use('/auth', authRouter);

        app.listen(port, () => console.log(`Server is running on port ${port}`))
    }).catch(err => {
        console.log(err)
    })
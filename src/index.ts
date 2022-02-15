import express, { NextFunction } from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import BodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import productRouter from "./routes/productRoutes";
import authRouter from "./routes/authRoutes";
import cartRouter from './routes/cartRoutes';
import swaggerUi from 'swagger-ui-express' 
import swaggerDocs from './swagger.json'
import fileUpload from "express-fileupload";
import ProductController from './controllers/ProductController';

let port = process.env.PORT || 3001;

const checkAuthenicated = (req: any, res: any, next: NextFunction) => {
    let token = req.cookies['session-token'];

    if (!token) {
        return res.status(401).send("U need authentication");
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

createConnection()
    .then(async connection => {
        const app = express();
        app.use(cors())
        app.use(BodyParser.urlencoded({ extended: false }))
        app.use(BodyParser.json())
        app.use(cookieParser())

        app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));

        app.use('/auth', authRouter);
        app.use('/product', checkAuthenicated, productRouter);
        app.use('/cart', checkAuthenicated, cartRouter);
        
        // static types and all products api
        app.get('/types', ProductController.getTypes);
        app.get('/products', ProductController.getProducts);
        app.get('/products/:id', ProductController.getOneProduct);

        // swagger documentation for apis
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

        app.listen(port, () => console.log(`Server is running on port ${port}`))
    }).catch(err => {
        console.log(err)
    })
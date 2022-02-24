import express from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import BodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import productRouter from "./routes/productRoutes";
import authRouter from "./routes/authRoutes";
import cartRouter from './routes/cartRoutes';
import subscribeRouter from './routes/subscribeRoutes';
import ProductController from './controllers/ProductController';
import swaggerUi from 'swagger-ui-express' 
import swaggerDocs from './swagger.json'
import fileUpload from "express-fileupload";
import { checkAuthenicated } from './middleware/CheckAuth'

let port = process.env.PORT || 3001;

createConnection()
    .then(async connection => {
        const app = express();
        app.use(cors({
            origin: ["http://localhost:3000", 'https://levani.d2xzaaged6xhtu.amplifyapp.com', '*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true,
        }))
        app.use(BodyParser.urlencoded({ extended: false }))
        app.use(BodyParser.json())
        app.use(cookieParser())

        app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));

        app.use('/auth', authRouter);
        app.use('/sub', subscribeRouter);
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
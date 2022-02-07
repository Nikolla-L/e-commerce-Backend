import express from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import BodyParser from 'body-parser';
import cors from 'cors';
import productRouter from "./routes/productRoutes";
import authRouter from "./routes/authRoutes";
import cartRouter from './routes/cartRoutes';
import swaggerUi from 'swagger-ui-express' 
import swaggerDocs from './swagger.json'
import {MYFile} from "./entity/file"
import fileUpload from "express-fileupload";
import ProductController from './controllers/ProductController';

let port = process.env.PORT || 3001;

createConnection()
    .then(async connection => {
        const app = express();
        app.use(cors())
        app.use(BodyParser.urlencoded({ extended: false }))
        app.use(BodyParser.json())

        app.use(fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        }));

        app.use('/product', productRouter);
        app.use('/auth', authRouter);
        app.use('/cart', cartRouter);
        
        //static types api
        app.get('/types', ProductController.getTypes)

        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

        app.listen(port, () => console.log(`Server is running on port ${port}`))
    }).catch(err => {
        console.log(err)
    })
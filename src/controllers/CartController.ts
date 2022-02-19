import { Request, Response } from 'express';
import { CartProduct } from '../entity/CartProduct';
import { BaseEntity, getRepository } from 'typeorm';
import { User } from '../entity/User';
import jwt from 'jsonwebtoken';


class CartController extends BaseEntity {
    static getUserId = (req: any, res: any) => {
        let token = req.cookies['session-token'];
        if(!token) {
            return res.status(401).send('U need authorization')
        }
        return Object(jwt.verify(token, 'secret')).id
    }
    
    static addProduct = async (req: Request, res: Response) => {
        let userId = this.getUserId(req, res);
        const {productId} = req.body

        const newItem = {
            productId: productId,
            addedBy: userId
        }

        const item = await getRepository(CartProduct).create(newItem);
        const result = await getRepository(CartProduct).save(item);
        return res.status(200).send('product added to cart');
    }

    static getProducts = async (req: Request, res: Response) => {
        let id = req.query.userId;
        if(id) {
            id = id.toString();
            const result = await getRepository(CartProduct)
                                .createQueryBuilder('p')
                                .where('p.user_id = : id', {id})
                                .orderBy('p.added_at', 'ASC')
                                .getMany();
            return res.status(200).json(result);
        } else {
            const result = await getRepository(CartProduct).createQueryBuilder("p").getMany();
            return res.status(200).json(result);
        }
    }

    static removeProduct = async (req: Request, res: Response) => {

    }

    static editProduct = async (req: Request, res: Response) => {

    }
}

export default CartController;
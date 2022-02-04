import { Request, Response } from 'express';
import { CartProduct } from '../entity/CartProduct';
import { BaseEntity } from 'typeorm';
import { getRepository } from 'typeorm';


class CartController extends BaseEntity {
    static addProduct = async (req: Request, res: Response) => {
        const newItem = {
            productId: req.body.productId,
            addedBy: req.body.userId
        }
        const item = await getRepository(CartProduct).create(newItem);
        const result = await getRepository(CartProduct).save(item);
        return res.json(result);
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
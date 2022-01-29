import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../entity/Product';

class ProductController {
    static postProduct = async (req: Request, res: Response) => {
        const newProduct = {
            title: req.body.title,
            content: req.body.content
        };
        const product = getRepository(Product).create(newProduct)
        const result = await getRepository(Product).save(product);
        return res.json(result);
    }

    static getProduct = async (req: Request, res: Response) => {
        const result = await getRepository(Product).find();
        return res.json(result);
    }

    static getOneProduct = async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await getRepository(Product).findOne(id);
        return res.json(product);
    }

    static updateProduct = async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await getRepository(Product).findOne(id);
        if (product) {
            getRepository(Product).merge(product, req.body);
            const result = await getRepository(Product).save(product);
            return res.json(result);
        }
        return res.json({message: 'Producti ver vipoveeeit'});
    }

    static deleteProduct = async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await getRepository(Product).delete(id);
        return res.json(product);
    }
}
export default ProductController;
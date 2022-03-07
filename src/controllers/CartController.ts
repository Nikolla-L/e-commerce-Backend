import { Request, Response } from 'express';
import { CartProduct } from '../entity/CartProduct';
import { BaseEntity, getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { Product } from '../entity/Product';
import { changeStock } from '../service/StockFunctions';


class CartController extends BaseEntity {
    static getUserId = (req: any, res: any) => {
        let headerToken = req.headers.authorization.split(" ")[1];
        if(!headerToken) {
            return res.status(401).send('U need authorization')
        }
        return Object(jwt.verify(headerToken, 'secret')).id?.toString()
    }
    
    static addProduct = async (req: Request, res: Response) => {
        let userId = this.getUserId(req, res);
        const {productId, number} = req.body;

        if (productId == '' || number == '' || productId == null || number == null) {
            return res.status(400).send('Bad request: Please insert both - productId and number of products');
        }

        let product = await getRepository(Product).findOne({productId: productId});
        if(!product) {
            return res.status(404).send('Product not found with this ID!');
        }

        if(!product?.inStock) {
            return res.status(403).send('Product is not avalaible');
        }

        const newItem = {
            productId: productId,
            number: number,
            addedBy: userId
        }

        const item = await getRepository(CartProduct).create(newItem);
        changeStock(productId, false);
        await getRepository(CartProduct).save(item);
        return res.status(200).json(item);
    }

    static getProducts = async (req: Request, res: Response) => {
        let id = this.getUserId(req, res)
        if(id) {
            const result = await getRepository(CartProduct)
                                .createQueryBuilder('p')
                                .where(`p.added_by = ${id}`)
                                .orderBy('p.added_at', 'ASC')
                                .getMany();
            let arr: any = result;                    
            let allProducts = await getRepository(Product).createQueryBuilder('p').getMany()                   
            await Array.from(arr)?.forEach((product: any) => {
                let productObj = Array.from(allProducts).find(p => p.productId == product.productId)
                Object.assign(product, {productData: productObj})
            })

            return res.status(200).json(arr)
        } else {
            return res.status(200).send('U need authorization')
        }
    }

    static getOneProduct = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if(id) {
            try {
                let cartProduct = await getRepository(CartProduct).findOneOrFail(id);
                let productId = cartProduct?.productId;
                let product = await getRepository(Product).findOne({productId: productId});
                cartProduct = Object.assign(cartProduct, {productData: product})
                return res.status(200).json(cartProduct)
            } catch (error) {
                return res.status(404).send('Cart product not found with this Id')
            }
        } else {
            return res.status(400).send('Bad request: cart product Id is missing!');
        }
    }

    static removeProduct = async (req: any, res: any) => {
        const id = req.params.id;
        if(id) {
            try {
                let cartProduct = await getRepository(CartProduct).findOneOrFail(id);
                let productId = cartProduct?.productId;
                changeStock(productId, true);
                await getRepository(CartProduct).delete(id);
                return res.status(200).send('Cart product has been deleted');
            } catch (error) {
                return res.status(404).send('Cart product not found with this Id');
            }
        } else {
            res.status(400).send('Bad request: cart product Id is missing!');
        }
    }

    static editProduct = async (req: any, res: any) => {
        const id = Number(req.params.id);
        if(id) {
            try {
                const {productId, number} = req.body;
                let cartProduct = await getRepository(CartProduct).findOneOrFail(id);
                if(cartProduct) {
                    let updated = {
                        productId: productId ? productId : cartProduct.productId,
                        number: number ? number : cartProduct.number
                    }
                    await getRepository(CartProduct).update({id: id}, updated);

                    let product = await getRepository(Product).findOne({productId: updated?.productId});
                    let updatedValues = Object.assign(updated, {productData: product});
                    return res.status(200).json(updatedValues);
                }
            } catch (error) {
                return res.status(404).send('Cart product not found with this Id');
            }
        } else {
            return res.status(400).send('Bad request: cart product Id is missing!');
        }
    }
}

export default CartController;
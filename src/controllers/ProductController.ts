import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../entity/Product';
const request = require('request-promise');

class ProductController {
    static postProduct = async (req: Request, res: Response) => {
        const newProduct = {
            title: req.body.title,
            typeId: req.body.typeId,
            price: req.body.price,
            about: req.body.about,
            materials: req.body.materials,
            dimensions: req.body.dimensions,
            careInstructions: req.body.careInstructions
        };
        const product = await getRepository(Product).create(newProduct);
        const result = await getRepository(Product).save(product);
        return res.json(result);
    }

    static getProducts = async (req: Request, res: Response) => {
        let id = req.query.id
        if(id == '0' || id==null || id == undefined) {
            const result = await getRepository(Product).createQueryBuilder("product").getMany();
            return res.status(200).json(result);
        } else {
            id = id.toString();
            const result = await getRepository(Product)
                                .createQueryBuilder('p')
                                .where('p.type_id = :id', {id})
                                .orderBy('p.created_at', 'ASC')
                                .getMany();
            return res.status(200).json(result);
        }
    }

    static getOneProduct = async (req: Request, res: Response) => {
        let caucasus: any = {};
        await request('https://freecurrencyapi.net/api/v2/latest?apikey=22fdaaa0-87ec-11ec-b421-4b29aa3a7e8a')
        .then(async (response: any) => {
            let currencies = JSON.parse(response).data;
            caucasus = {...caucasus, gela: currencies.GEL, putini: currencies.RUB};

            const financial = (x: any) => {
                return Number.parseFloat(x).toFixed(2);
            }

            const id = req.params.id;
            let product = await getRepository(Product).findOne(id);
            let productPrice = product?.price;
            let prices = [
                {
                    name: 'USD',
                    price: productPrice
                },
                {
                    name: 'GEL',
                    price: productPrice ? financial(productPrice*caucasus.gela) : null
                },
                {
                    name: 'RUB',
                    price: productPrice? financial(productPrice*caucasus.putini) : null
                }
            ];
            let productObj: any = product;
            productObj.price = prices;
            return res.json(productObj);
        })
        .catch((error: any) => {
            console.log(error)
            res.status(404).send('Not found')
        })
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
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../entity/Product';
const request = require('request-promise');

class ProductController {
    static postProduct = async (req: Request, res: Response) => {
        const newProduct = {
            title: req.body.title,
            typeId: req.body.typeId,
            price: Number(req.body.price),
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
        let id = req.query.id;
        let sort = req.query.sort;
        let productsRepo: any = '';
        let result: any = [];
        
        if(id == '0' || id==null || id == undefined) {
            productsRepo = await getRepository(Product).createQueryBuilder("p");
        } else if (id == 'bags') {
            productsRepo = getRepository(Product)
                            .createQueryBuilder('p')
                            .where('p.type_id = :id', {id: 1 })
                            .orWhere('p.type_id = :id', {id: 2})
                            .orWhere('p.type_id = :id', {id: 3})
                            .orWhere('p.type_id = :id', {id: 4})
                            .orWhere('p.type_id = :id', {id: 5});
        } else if (id == 'shoes') {
            productsRepo = getRepository(Product)
                            .createQueryBuilder('p')
                            .where('p.type_id = :id', {id: 6})
                            .orWhere('p.type_id = :id', {id: 7});
        } else {
            id = id.toString();
            productsRepo = getRepository(Product).createQueryBuilder('p').where('p.type_id = :id', {id});
        }

        switch (sort) {
            case 'alph-AZ':
                result =  await productsRepo.orderBy('p.title', 'ASC').getMany();
                break;
            case 'alph-ZA':
                result =  await productsRepo.orderBy('p.title', 'DESC').getMany();
                break;
            case 'price-ASC':
                result =  await productsRepo.orderBy('p.price', 'ASC').getMany();
                break;
            case 'price-DESC':
                result =  await productsRepo.orderBy('p.price', 'DESC').getMany();
                break;
            case 'date-ASC':
                result =  await productsRepo.orderBy('p.created_at', 'ASC').getMany();
                break;
            case 'date-DESC':
                result =  await productsRepo.orderBy('p.created_at', 'DESC').getMany();
                break;
            default:
                result =  await productsRepo.orderBy('p.created_at', 'ASC').getMany();
                break;
        }

        return res.status(200).json(result);
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
            if(!id) {
                res.status(400).send('required product ID')
            }
            let product = await getRepository(Product).findOneOrFail(id);
            if(!product) {
                res.status(404).send('Product not found');
                return;
            }
            let productPrice = product?.price;
            let prices = [
                {
                    name: 'USD',
                    price: productPrice?.toString()
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
        const productId = Number(req.params.id);
        const {title, typeId, price, about, materials, dimensions, careInstructions} = req.body
        const product = await getRepository(Product).findOne(productId);
        if(product) {
            let updatedValues = {
                title: title ? title : product.title,
                typeId: typeId ? typeId : product.typeId,
                price: Number(price) ? Number(price) : product.price,
                about: about ? about : product.about,
                materials: materials ? materials : product.materials,
                dimensions: dimensions ? dimensions : product.dimensions,
                careInstructions: careInstructions ? careInstructions : product.careInstructions
            }
            await getRepository(Product).update({productId}, updatedValues);
            return res.status(200).json(updatedValues);
        } else {
            return res.status(404).send('Product not found');
        }
    }

    static deleteProduct = async (req: Request, res: Response) => {
        const id = req.params.id;
        const product = await getRepository(Product).delete(id);
        return res.json(product);
    }

    static getTypes = async (req: Request, res: Response) => {
        const types = [
            {
                typeId: 'shoes',
                typeName: 'Shoes'
            },
            {
                typeId: 'bags',
                typeName: 'Bags'
            },
            {
                typeId: 1, 
                typeName: "Tote bags"
            },
            {
                typeId: 2, 
                typeName: "Shoulder bags"
            },
            {
                typeId: 3, 
                typeName: "Crossbody bags"
            },
            {
                typeId: 4, 
                typeName: "Top handle bags"
            },
            {
                typeId: 5, 
                typeName: "Mini bags"
            },
            {
                typeId: 6, 
                typeName: "Sandals"
            },
            {
                typeId: 7, 
                typeName: "Boots"
            }
        ]
        return res.json(types)
    }
}
export default ProductController;
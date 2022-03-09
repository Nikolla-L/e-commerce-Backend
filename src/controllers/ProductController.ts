import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Product } from '../entity/Product';
import { Email } from '../entity/Email';
import { sendNews } from '../service/Mailer';
const request = require('request-promise');

class ProductController {
    static postProduct = async (req: Request, res: any) => {
        const {title, typeId, sale, price, color, about, materials, dimensions, careInstructions} = req.body;
        const types = ['1', '2', '3', '4', '5', '6', '7', 1, 2, 3, 4, 5, 6, 7, 'bags', 'shpoes'];
        const colors = ["blue", "black", "red", "white", "purple", "yellow", "green", "orange", "gray", "violet"];
        
        if(
            title == '' || typeId == '' ||  sale == '' || price == '' || color == '' || about == '' || dimensions == '' || careInstructions == '' ||
            title == null || typeId == null || sale == null || price == null || color == null || about == null || dimensions == null || careInstructions == null
        ) {
            return res.status(400).send('Bad request: All fields must be filled');
        }

        if(!types.includes(typeId)) {
            return res.status(400).send('Bad request: This type of product does not exist');
        }

        if(!colors.includes(color)) {
            return res.status(400).send('Bad request: This color of product does not exist ');
        }
        
        const newProduct = {
            title: title,
            typeId: typeId,
            sale: sale,
            img: urls[Number(typeId)] ? urls[Number(typeId)] : 'https://cdn0.iconfinder.com/data/icons/cosmo-layout/40/box-512.png',
            price: Number(price),
            color: color,
            about: about,
            materials: materials,
            dimensions: dimensions,
            careInstructions: careInstructions
        };
        const product = await getRepository(Product).create(newProduct);
        const result = await getRepository(Product).save(product);

        let emails = await getRepository(Email).createQueryBuilder('email').getMany();
        let array = Array.from(emails)?.map(obj => obj?.email);
        
        sendNews(array)
        .then(() => res.status(200).json(result))
        .catch(error => res.status(400).send('Ops... occured issue, please try later'));
    }

    static getProducts = async (req: Request, res: Response) => {
        let { typeId, color, priceFrom, priceTo } = req.query;
        let sort = req.query.sort;
        let inStock = req.query.stock;
        let productsRepo: any = '';
        let result: any = [];
        
        if(typeId == '0' || typeId == null) {
            productsRepo = await getRepository(Product).createQueryBuilder("p");
        } else if (typeId == 'bags') {
            productsRepo = getRepository(Product)
                            .createQueryBuilder('p')
                            .where('p.type_id = :typeId', {typeId: 1 })
                            .orWhere('p.type_id = :typeId', {typeId: 2})
                            .orWhere('p.type_id = :typeId', {typeId: 3})
                            .orWhere('p.type_id = :typeId', {typeId: 4})
                            .orWhere('p.type_id = :typeId', {typeId: 5});
        } else if (typeId == 'shoes') {
            productsRepo = getRepository(Product)
                            .createQueryBuilder('p')
                            .where('p.type_id = :typeId', {typeId: 6})
                            .orWhere('p.type_id = :typeId', {typeId: 7});
        } else {
            typeId = typeId.toString();
            productsRepo = getRepository(Product).createQueryBuilder('p').where('p.type_id = :typeId', {typeId});
        }

        if(color) {
            productsRepo = productsRepo.andWhere('p.color = :color', {color});
        }

        if(priceFrom != null && priceTo != null) {
            productsRepo = productsRepo.andWhere('"price" BETWEEN :priceFrom AND :priceTo', {priceFrom: priceFrom, priceTo: priceTo});
        }

        if(inStock == 'in') {
            productsRepo = productsRepo.andWhere('p.in_stock = :inStock', {inStock: true});
        } else if(inStock == 'out') {
            productsRepo = productsRepo.andWhere('p.in_stock = :inStock', {inStock: false});
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

        result.forEach((product: Product) => {
            if(product.img == null) {
                product.img = urls[Number(product.typeId)] ? urls[Number(product.typeId)] : 'https://cdn0.iconfinder.com/data/icons/cosmo-layout/40/box-512.png'
            }
        })

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
        if(productId==null) {
            return res.status(400).send('Bad Request: needs productId param');
        }
        const {title, typeId, sale, price, color, about, materials, dimensions, careInstructions} = req.body

        const types = ['1', '2', '3', '4', '5', '6', '7', 1, 2, 3, 4, 5, 6, 7, 'bags', 'shpoes']
        const colors = ["blue", "black", "red", "white", "purple", "yellow", "green", "orange", "gray", "violet"];
        if(!types.includes(typeId) && typeId!=null && typeId!='') {
            return res.status(400).send('Bad request: This type of product does not exist');
        }
        if(!colors.includes(color) && color!=null && color!='') {
            return res.status(400).send('Bad request: This color of product does not exist ');
        }
        
        const product = await getRepository(Product).findOne({productId: productId});

        if(product) {
            let updatedValues = {
                title: title ? title : product.title,
                typeId: typeId ? typeId : product.typeId,
                sale: sale ? sale : product.sale,
                price: Number(price) ? Number(price) : product.price,
                color: color ? color : product.color,
                about: about ? about : product.about,
                materials: materials ? materials : product.materials,
                dimensions: dimensions ? dimensions : product.dimensions,
                careInstructions: careInstructions ? careInstructions : product.careInstructions
            }
            await getRepository(Product).update({productId: productId}, updatedValues);
            return res.status(200).json(updatedValues);
        } else {
            return res.status(404).send('Product not found');
        }
    }

    static deleteProduct = async (req: Request, res: Response) => {
        const id = req.params.id;
        if(id) {
            try {
                await getRepository(Product).delete(id);
                return res.status(200).send('Product has been deleted');
            } catch (error) {
                return res.status(404).send('Product not found');
            }
        } else {
            return res.status(400).send('Bad request: missing product Id');
        }
    }

    static getColors = async (req: Request, res: Response) => {
        const colors = ["blue", "black", "red", "white", "purple", "yellow", "green", "orange", "gray", "violet"];
        return res.status(200).json(colors);
    }

    static getTypes = async (req: Request, res: Response) => {
        return res.status(200).json(types)
    }
}

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

const urls = [
    "https://cdn.shopify.com/s/files/1/0551/9242/0441/products/mlouye-studio-denim-4_f841accc-a055-4250-a646-fe53c956b3af_360x.jpg?v=1637108123",
    "https://www.miumiu.com/content/dam/miumiu_products/5/5BC/5BC107/2AJBF0009/5BC107_2AJB_F0009_V_OOO_SLR.png/jcr:content/renditions/miumiunux_color.600.600.jpg",
    "https://cdn.shopify.com/s/files/1/0551/9242/0441/products/mlouye-mini-naomi-bag-harvest-2_360x.jpg?v=1637107230",
    "https://static.fendi.com/dam/is/image/fendi/8BN244AFQ8F0H43_01?wid=540&hei=540&hash=9bdfd8c13b53948948ceccdb90afa859-17ee0b7568d",
    "https://cdn-images.farfetch-contents.com/17/54/91/08/17549108_37672960_300.jpg",
    'https://cdn.shopify.com/s/files/1/0551/9242/0441/products/mlouye-louise-slide-sandal-buttermilk-5_04f1f6dd-4f7c-498b-bce7-2932fa651c00_360x.jpg?v=1637106712',
    "https://images.timberland.com/is/image/timberland/10061024-HERO"
]


export default ProductController;
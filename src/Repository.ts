import { getConnection } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";

const getRepository = (entity: any) => {
	return getConnection().getRepository(entity)
}

export const updateUser = async (firstName: string, lastName: string, email: string, password: string) => {
    return await getConnection()
        .createQueryBuilder()
        .update(User)
        .setParameters({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
        .where('email = : email', {email: email})
        .execute();
}

export const addProduct = async (title: string, typeId: string, price: string, about: any, materials: any, ) => {

}

export const getAllProducts = async () => {
    return await getRepository(Product)
        .createQueryBuilder('p')
        .orderBy('p.created_at', 'ASC')
        .getMany();
}

export const getSingleProduct = async (id: any) => {
    return await getRepository(Product)
        .createQueryBuilder('p')
        .where('p.id = :id', {id})
        .getOne()
}

export const addToCard = () => {
    
}

export const getCartProducts = () => {

}

export const deleteFromCart = () => {

}
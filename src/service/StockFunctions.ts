import { getConnection } from 'typeorm'
import { Product } from '../entity/Product'

export const changeStock = async (productId: number, inStock: boolean) => {
    await getConnection()
        .createQueryBuilder()
        .update(Product)
        .set({ inStock: inStock })
        .where("productId = :productId", { productId: productId })
        .execute();
}
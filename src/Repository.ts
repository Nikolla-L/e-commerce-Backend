import { getConnection } from "typeorm";
import { User } from "./entity/User";

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
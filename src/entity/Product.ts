import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn({
        name: 'product_id'
    })
    productId: number;

    @Column()
    title: string;

    @Column({
        name: 'type_id'
    })
    typeId: string

    @Column()
    price: number;

    @Column()
    color?: string;

    @Column({
        nullable: true
    })
    about: string;

    @Column({
        nullable: true
    })
    materials: string;

    @Column({
        nullable: true
    })
    dimensions: string;

    @Column({
        name: 'care_instructions',
        nullable: true
    })
    careInstructions: string;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;
}
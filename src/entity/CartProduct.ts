import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from 'typeorm'

@Entity('cart')
export class CartProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'product_id'
    })
    productId: number;

    @Column({
        default: 1,
        nullable: true
    })
    number: number;

    @Column({
        name: 'added_by'
    })
    addedBy: number;

    @CreateDateColumn({
        name: 'added_at'
    })
    addedAt: Date;

    @Column({
        default: true
    })
    active: Boolean;
}
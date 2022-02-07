import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    JoinColumn,
    ManyToOne
} from 'typeorm'
import { Product } from './Product';

@Entity('cart')
export class CartProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(()=>Product, productId => productId.productId)
    @JoinColumn()
    productId: number;

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
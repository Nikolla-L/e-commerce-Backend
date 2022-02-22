import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";

@Entity('emails')
export class Email {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @CreateDateColumn({
        name: 'subscribed_at'
    })
    subscribedAt: Date;
}
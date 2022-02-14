import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'first_name',
        nullable: true
    })
    firstName: string;

    @Column({
        name: 'last_name',
        nullable: true
    })
    lastName: string;

    @Column()
    email: string;

    @Column({
        nullable: true
    })
    password: string;

    @Column({
        name: 'created_at'
    })
    @CreateDateColumn()
    createdAt: Date;

    @Column({
        name: 'updated_at',
        nullable: true
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        name: 'reset_code',
        nullable: true,
        default: null
    })
    resetCode: string;

    setPassword = (password: string) => {
        return (this.password = bcrypt.hashSync(password, 8))
    }

    isValidPassword = (password: string) => {
        return bcrypt.compareSync(password, this.password);
    }

    generateJWT = () => {
        return jwt.sign(
            {
                email: this.email
            },
            'SECRET',
            {
                expiresIn: '30min'
            }
        );
    }
}
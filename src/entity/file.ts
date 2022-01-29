import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity('file')
export class MYFile{

    @PrimaryGeneratedColumn()
    id: number 


    @Column()
    name: string

    @Column({
        type: "bytea",
        nullable: false
    })
    data: Buffer

    @Column()
    mimeType:string
}
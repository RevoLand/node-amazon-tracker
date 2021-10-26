import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { SettingsEnum } from '../helpers/enums/SettingsEnum';

@Entity('settings')
export class Setting extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      type: 'varchar',
      unique: true
    })
    key: SettingsEnum;

    @Column()
    value: string;
}

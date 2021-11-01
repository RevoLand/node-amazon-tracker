import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, AfterUpdate } from 'typeorm';
import { ProductTrackerMain } from '../app';
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

    @AfterUpdate()
    async updateProductTracker() {
      if (this.key !== SettingsEnum.TrackingInterval) {
        return;
      }

      await ProductTrackerMain.restart();
    }
}

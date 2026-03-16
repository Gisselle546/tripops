import { AppBaseEntity } from '../../common/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends AppBaseEntity {
  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ length: 120, nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  passwordHash?: string;
}

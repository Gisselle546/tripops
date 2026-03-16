import { AppBaseEntity } from '../../common/base.entity';
import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('auth')
export class Auth extends AppBaseEntity {
  @Index()
  @Column()
  userId: string;

  @Index({ unique: true })
  @Column()
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ip?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

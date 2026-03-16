import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { WorkspaceMember } from './workspace-member.entity';

@Entity('workspaces')
export class Workspace extends AppBaseEntity {
  @Column({ length: 160 })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => WorkspaceMember, (m) => m.workspace)
  members: WorkspaceMember[];
}

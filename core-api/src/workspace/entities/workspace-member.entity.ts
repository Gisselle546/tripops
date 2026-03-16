import { Entity, Column, ManyToOne, Unique, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Workspace } from './workspace.entity';
import { User } from '../../users/entities/user.entity';

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

@Entity('workspace_members')
@Unique('uq_workspace_member', ['workspaceId', 'userId'])
export class WorkspaceMember extends AppBaseEntity {
  @Index()
  @Column()
  workspaceId: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
  role: WorkspaceRole;

  @ManyToOne(() => Workspace, (w) => w.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}

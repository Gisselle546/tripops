import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from '../entities/workspace-member.entity';

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}

import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: { user: AuthUser }) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Get(':id')
  async findOne(@Req() req: { user: AuthUser }, @Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

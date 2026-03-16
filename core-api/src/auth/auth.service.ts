import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Auth } from './entities/auth.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './utils/password';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
  ) {}

  private get accessSecret(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  private get accessTtl(): number {
    return this.config.get<number>('JWT_ACCESS_TTL') ?? 900;
  }

  private get refreshTtl(): number {
    return this.config.get<number>('JWT_REFRESH_TTL') ?? 1209600;
  }

  private toUserDto(user: any) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async issueAccessToken(user: { id: string; email: string }) {
    return this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: this.accessSecret, expiresIn: this.accessTtl },
    );
  }

  // We generate a random refresh token string; store only hash in DB.
  private generateRefreshToken() {
    return crypto.randomBytes(48).toString('base64url');
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(dto: RegisterDto, meta: { userAgent?: string; ip?: string }) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use.');

    const passwordHash = await hashPassword(dto.password);
    const user = await this.usersService.createLocalUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    const accessToken = await this.issueAccessToken(user);
    const refreshRaw = this.generateRefreshToken();
    await this.authRepo.save(
      this.authRepo.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshRaw),
        expiresAt: new Date(Date.now() + this.refreshTtl * 1000),
        revoked: false,
        userAgent: meta.userAgent,
        ip: meta.ip,
      }),
    );

    return {
      user: this.toUserDto(user),
      accessToken,
      refreshToken: refreshRaw,
    };
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Invalid credentials.');

    const ok = await verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    const accessToken = await this.issueAccessToken(user);
    const refreshRaw = this.generateRefreshToken();
    await this.authRepo.save(
      this.authRepo.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshRaw),
        expiresAt: new Date(Date.now() + this.refreshTtl * 1000),
        revoked: false,
        userAgent: meta.userAgent,
        ip: meta.ip,
      }),
    );

    return {
      user: this.toUserDto(user),
      accessToken,
      refreshToken: refreshRaw,
    };
  }

  async refresh(refreshRaw: string) {
    if (!refreshRaw) throw new UnauthorizedException('Missing refresh token.');
    const tokenHash = this.hashToken(refreshRaw);

    const row = await this.authRepo.findOne({ where: { tokenHash } });
    if (!row || row.revoked)
      throw new UnauthorizedException('Invalid refresh token.');
    if (row.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh token expired.');

    // Rotate: revoke old and issue new
    row.revoked = true;
    await this.authRepo.save(row);

    const user = await this.usersService.findById(row.userId);
    if (!user) throw new UnauthorizedException('User not found.');

    const accessToken = await this.issueAccessToken(user);
    const newRefreshRaw = this.generateRefreshToken();
    await this.authRepo.save(
      this.authRepo.create({
        userId: user.id,
        tokenHash: this.hashToken(newRefreshRaw),
        expiresAt: new Date(Date.now() + this.refreshTtl * 1000),
        revoked: false,
      }),
    );

    return { accessToken, refreshToken: newRefreshRaw };
  }

  async logout(refreshRaw: string) {
    if (!refreshRaw) return;
    const tokenHash = this.hashToken(refreshRaw);
    const row = await this.authRepo.findOne({ where: { tokenHash } });
    if (!row) return;
    row.revoked = true;
    await this.authRepo.save(row);
  }

  /** Remove expired and revoked tokens from the database. */
  async cleanupExpiredTokens() {
    await this.authRepo
      .createQueryBuilder()
      .delete()
      .where('revoked = :revoked OR "expiresAt" < NOW()', { revoked: true })
      .execute();
  }
}

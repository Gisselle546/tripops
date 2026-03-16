import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { setRefreshCookie, clearRefreshCookie } from './utils/cookies';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get cookieName(): string {
    return this.config.get<string>('REFRESH_COOKIE_NAME') ?? 'tripops_refresh';
  }

  private get refreshTtl(): number {
    return this.config.get<number>('JWT_REFRESH_TTL') ?? 1209600;
  }

  private get cookieOpts() {
    return {
      secure: this.config.get<boolean>('COOKIE_SECURE') ?? false,
      domain: this.config.get<string>('COOKIE_DOMAIN'),
    };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } = await this.auth.register(dto, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    setRefreshCookie(
      res,
      this.cookieName,
      refreshToken,
      this.refreshTtl,
      this.cookieOpts,
    );
    return { user, accessToken };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, accessToken, refreshToken } = await this.auth.login(dto, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    setRefreshCookie(
      res,
      this.cookieName,
      refreshToken,
      this.refreshTtl,
      this.cookieOpts,
    );
    return { user, accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const refreshRaw = (req.cookies?.[this.cookieName] as string) ?? '';

    const { accessToken, refreshToken } = await this.auth.refresh(refreshRaw);

    setRefreshCookie(
      res,
      this.cookieName,
      refreshToken,
      this.refreshTtl,
      this.cookieOpts,
    );
    return { accessToken };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshRaw = (req.cookies?.[this.cookieName] as string) ?? '';
    await this.auth.logout(refreshRaw);

    clearRefreshCookie(res, this.cookieName, this.cookieOpts);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return { userId: req.user.userId, email: req.user.email };
  }
}

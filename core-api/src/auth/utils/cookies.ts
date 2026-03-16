import { Response } from 'express';

export interface CookieOptions {
  secure: boolean;
  domain?: string;
}

export function setRefreshCookie(
  res: Response,
  name: string,
  value: string,
  maxAgeSeconds: number,
  opts: CookieOptions = { secure: false },
) {
  res.cookie(name, value, {
    httpOnly: true,
    sameSite: opts.secure ? 'none' : 'lax',
    secure: opts.secure,
    domain: opts.domain || undefined,
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  });
}

export function clearRefreshCookie(
  res: Response,
  name: string,
  opts: CookieOptions = { secure: false },
) {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: opts.secure ? 'none' : 'lax',
    secure: opts.secure,
    domain: opts.domain || undefined,
    path: '/',
  });
}

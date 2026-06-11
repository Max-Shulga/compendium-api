import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import jwtConfig from '../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request: Request = ctx.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        token,
        this.jwtConfiguration
      );
      (request as unknown as Record<string, unknown>)[REQUEST_USER_KEY] =
        payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') ?? [];

    return token;
  }
}

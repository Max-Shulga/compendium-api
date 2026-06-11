import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_TYPE_KEY } from '../decorators/auth.decorators';
import { AuthType } from '../enums/auth-type.enum';

import { AccessTokenGuard } from './access-token.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly AccessTokenGuard: AccessTokenGuard
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.AccessTokenGuard,
      [AuthType.None]: { canActivate: (): boolean => true }
    };
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[] | undefined>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()]
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    let error: Error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context)
      ).catch((err: unknown) => {
        if (err instanceof Error) {
          error = err;
        }
      });
      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}

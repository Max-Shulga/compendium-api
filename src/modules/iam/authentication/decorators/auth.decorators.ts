import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

import type { AuthType } from '../enums/auth-type.enum';

const AUTH_TYPE_KEY = 'authType';
const Auth = (...authType: AuthType[]): CustomDecorator<string> =>
  SetMetadata(AUTH_TYPE_KEY, authType);
export { AUTH_TYPE_KEY, Auth };

import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

import type { Role } from '@/modules/users/enums/role.enum';

const ROLES_KEY = 'roles';
const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);

export { ROLES_KEY, Roles };

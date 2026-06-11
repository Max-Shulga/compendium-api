import type { Role } from '@/modules/users/enums/role.enum';

interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
}
export type { ActiveUserData };

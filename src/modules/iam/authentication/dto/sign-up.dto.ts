import { IsEmail, MinLength } from 'class-validator';

import { MIN_PASSWORD_LENGTH } from '@/common/constants/validation.constants';

export class SignUpDto {
  @IsEmail()
  email!: string;

  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;
}

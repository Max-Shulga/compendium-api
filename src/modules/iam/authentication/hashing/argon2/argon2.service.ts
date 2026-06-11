import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { HashingService } from '../hashing.service';

@Injectable()
export class Argon2Service implements HashingService {
  hash(data: string | Buffer): Promise<string> {
    return argon2.hash(data);
  }

  compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return argon2.verify(encrypted, data as string);
  }
}

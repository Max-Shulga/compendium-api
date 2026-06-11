import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        new Redis({
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port')
        })
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule {}

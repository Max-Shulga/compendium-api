import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';

import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { Argon2Service } from './authentication/hashing/argon2/argon2.service';
import { HashingService } from './authentication/hashing/hashing.service';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RoleGuard } from './authorization/guards/roles.guard';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig)
  ],
  providers: [
    {
      provide: HashingService,
      useClass: Argon2Service
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    AuthenticationService
  ],
  controllers: [AuthenticationController]
})
export class IamModule {}

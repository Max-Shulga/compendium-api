import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from './common/redis/redis.module';
import { appConfig, databaseConfig, redisConfig } from './config';
import { CardsModule } from './modules/cards/cards.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IamModule } from './modules/iam/iam.module';
import { TopicsModule } from './modules/topics/topics.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.username'),
        password: configService.getOrThrow<string>('database.password'),
        database: configService.getOrThrow<string>('database.name'),
        ssl: configService.get<boolean>('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    RedisModule,
    IamModule,
    UserModule,
    CardsModule,
    TopicsModule,
    CategoriesModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

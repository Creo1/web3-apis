import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config/configuration';
import { AccessKeyModule } from './access_key/access-key.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    CacheModule.register({ isGlobal: true }),
  
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `${configService.get<string>('dbURI')}/${configService.get<string>(
          'database'
        )}`
      }),
      inject: [ConfigService]
    }),
    AccessKeyModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

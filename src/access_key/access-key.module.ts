import { Module } from '@nestjs/common';
import { AccessKeyController } from './access-key.controller';
import { AccessKeyService } from './access-key.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessKeySchema } from './schemas/access-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AccessKey', schema: AccessKeySchema }
    ])
  ],
  controllers: [AccessKeyController],
  providers: [AccessKeyService]
})
export class AccessKeyModule {}

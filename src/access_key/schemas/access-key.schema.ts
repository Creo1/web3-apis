import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Schema as MongooseSchema } from 'mongoose';
import { Status } from '../../common/enums';

@Schema({ timestamps: true })
export class AccessKey {

  _id: mongoose.Types.ObjectId;

  @Prop({required: true})
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId})
  userId: Types.ObjectId;


  @Prop({required: true,type: Number, default: 60 })
  rateLimit: number;

  //default is 1 minute.
  @Prop({required: true,type: Number, default: 60000 })
  rateLimitTTLInMilliseconds: number;

  @Prop({enum: Status, default: Status.PENDING})
  status: Status;

  @Prop({ type: Date, required: true })
  expiration: Date;
  
  createdAt: Date;
  updatedAt: Date;

}

export const AccessKeySchema = SchemaFactory.createForClass(AccessKey);
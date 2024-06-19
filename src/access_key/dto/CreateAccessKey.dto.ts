import mongoose from 'mongoose';
import { IsNotEmpty, IsNumber, IsOptional, Length } from 'class-validator';
import { Status } from 'src/common/enums';

export class CreateAccessKeyDto {

  @IsNotEmpty()
  @Length(1, 50, { message: 'name must be between 1 and 50 characters' })
  readonly name: string;

  @IsOptional()
  @IsNotEmpty()
  readonly userId: mongoose.Schema.Types.ObjectId;


  @IsOptional()
  @IsNotEmpty()
  readonly rateLimit: number;

  @IsOptional()
  @IsNotEmpty()
  readonly rateLimitTTLInMilliseconds: number; 

  readonly status: Status;

  @IsNotEmpty()
  readonly expiration: Date;


  @IsOptional()
  @IsNotEmpty()
  readonly createdBy: mongoose.Schema.Types.ObjectId;
}

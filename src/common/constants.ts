import { HttpStatus } from '@nestjs/common';
import { APIStatus } from './enums';

export const CommonSuccessResponseObject = {
  statusCode: HttpStatus.OK,
  status: APIStatus.SUCCESS
};

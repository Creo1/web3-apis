import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
  Query
} from '@nestjs/common';
import { AccessKeyService } from './access-key.service';
import { QueryParams, SuccessResponse } from 'src/common/returnResponse';
import { CommonSuccessResponseObject } from 'src/common/constants';
import { responseMessage } from './dto/responseMessages';
import { CreateAccessKeyDto } from './dto/CreateAccessKey.dto';
import { AccessKey } from './schemas/access-key.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Access Key Management and Token Information Retrieval System')
@Controller('api')
export class AccessKeyController {
  constructor(
    private accessKeyService: AccessKeyService
  ) {}


  @Post('/access-key')
  async createAccessKey(
    @Body()
    accessKey: CreateAccessKeyDto
  ): Promise<SuccessResponse> {
 
    const data = await this.accessKeyService.create(accessKey);
    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.CREATE_ACCESS_KEY,
      data
    };
    return result;
  }

 
  @Get('/access-key')
  async getAllAccessKeys(
    @Query() queryParams: QueryParams
  ): Promise<SuccessResponse> {
    const { data, totalCount } =
      await this.accessKeyService.findAll(queryParams);
    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.LIST_ACCESS_KEY,
      data,
      totalCount: totalCount
    };
    return result;
  }


  @Get('access-key/:id')
  async getAccessKey(
    @Param('id')
    id: string
  ): Promise<SuccessResponse> {

    const data = await this.accessKeyService.findById(id);
    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.DETAIL_ACCESS_KEY,
      data
    };
    return result;
  }


  
  @Get('/token/:id')
  async getToken(
    @Param('id')
    id: string
  ): Promise<SuccessResponse> {

    const data = await this.accessKeyService.getTokenDetails(id);
    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.TOKEN_DETAIL,
      data
    };
    return result;
  }


  @Put('access-key/:id')
  async updateAccessKey(
    @Param('id')
    id: string,
    @Body()
    accessKey: Partial<AccessKey>
  ): Promise<SuccessResponse> {
   
    const data = await this.accessKeyService.updateById(
      id,
      accessKey
    );

    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.UPDATE_ACCESS_KEY,
      data
    };
    return result;
  }

  @Delete('access-key/:id')
  async deleteAccessKey(
    @Param('id')
    id: string
  ): Promise<SuccessResponse> {
   
    const data = await this.accessKeyService.deleteById(
      id
    );

    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.DELETE_ACCESS_KEY,
      data
    };
    return result;
  }


  @Patch('access-key/:id')
  async deactivateOrReactivateAccessKey(
    @Param('id')
    id: string,
    @Body()
    status: Partial<AccessKey>,
  ): Promise<SuccessResponse> {
   

    const data = await this.accessKeyService.statusUpdate(id, status);

    const result = {
      ...CommonSuccessResponseObject,
      message: responseMessage.STATUS_UPDATE_ACCESS_KEY,
      data
    };
    return result;
  }
}

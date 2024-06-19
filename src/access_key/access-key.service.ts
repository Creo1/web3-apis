import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AccessKey } from './schemas/access-key.schema';
import { CreateAccessKeyDto } from './dto/CreateAccessKey.dto';
import * as _ from 'lodash';
import { ErrorMessage } from '../common/errorMessages';
import { AccessKeyList } from './dto/CustomFilter.dto';
import {
  AccessKeyFilterRestrictedInputFields,
  AccessKeyUpdateRestrictedInputFields
} from '../common/accessKeyConst';
import { Status } from '../common/enums';
import { responseMessage } from './dto/responseMessages';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AccessKeyService {
  private readonly logger = new Logger(AccessKeyService.name);
  constructor(
    @InjectModel(AccessKey.name)
    private accessKeyModel: mongoose.Model<AccessKey>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async create(
    accessKey: CreateAccessKeyDto
  ): Promise<Partial<AccessKey>> {
    // Remove unnecessary attributes which is not part of AccessKey Schema
    const AccessKeyAttribs = Object.keys(
      this.accessKeyModel.schema.paths
    );
    const accessKeyDataToUpdate = _.pick(
      accessKey,
      AccessKeyAttribs
    );

    try {
      const res = await this.accessKeyModel.create(
        accessKeyDataToUpdate
      );
      return res;
    } catch (error) {
      this.logger.error(error);
      if (error) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  //Get all access keys list as per filter, text and pagination
  async findAll(queryParams): Promise<AccessKeyList> {
    const {
      page = 1,
      limit = 10,
      sort = '_id|ASC',
      filters = '',
      textSearch = ''
    } = queryParams;
    const skip = page * limit - limit;
    const [sortField, sortOrder] = sort.split('|');
    const filterAry = filters.split(',');
    const queryObj = {};

    for (const element of filterAry) {
      const filterVal = element;
      const [search_field, search_value] = filterVal.split('|');
      if (
        AccessKeyFilterRestrictedInputFields.find(
          (element) => element == search_field
        )
      ) {
        queryObj[search_field] = search_value;
      }
    }

    if (textSearch) {
      queryObj['$or'] = [
        { name: new RegExp(textSearch, 'i') },
        { productDetails: new RegExp(textSearch, 'i') }
      ];
    }
    try {
      const data = await this.accessKeyModel
        .find(queryObj)
        .limit(limit)
        .skip(skip)
        .sort({ [sortField]: sortOrder === 'DESC' ? -1 : 1 });
      const totalCount =
        await this.accessKeyModel.countDocuments(queryObj);

      return { data, totalCount };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findById(id: string): Promise<AccessKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessage.INCORRECT_ID);
    }
    const result = await this.accessKeyModel.findById(id);

    if (_.isEmpty(result)) {
      throw new NotFoundException(responseMessage.ACCESS_KEY_NOT_FOUND);
    }
    try {
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR
      );
    }
  }


  async getTokenDetails(id: string): Promise<AccessKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessage.INCORRECT_ID);
    }
    const accessKeyDetails = await this.accessKeyModel.findById(id);
    if (_.isEmpty(accessKeyDetails)) {
      throw new NotFoundException(responseMessage.ACCESS_KEY_NOT_FOUND);
    }
    const currentDate = new Date();
    if (currentDate.getTime() > new Date(accessKeyDetails.expiration).getTime()) {
      throw new BadRequestException('access key is expired');
    }
  
    // Increment counter for this minute
    let currentCount = await this.cacheManager.get<number>(accessKeyDetails._id.toString());
    console.log("currentCount", currentCount);
    if (!currentCount) {
      console.log("currentCount not", currentCount);
      currentCount = 1;
      await this.cacheManager.set(accessKeyDetails._id.toString(), currentCount, accessKeyDetails.rateLimitTTLInMilliseconds);
      //  await this.cacheManager.expire(key, overallTtl); // Set overall expiration
    } else {
      console.log("yes currentCount", currentCount);
      currentCount++;
      await this.cacheManager.set(accessKeyDetails._id.toString(), currentCount, accessKeyDetails.rateLimitTTLInMilliseconds);
    }
    console.log("currentCount limit", currentCount, accessKeyDetails.rateLimit);
    // Check if current count exceeds the limit
    if (currentCount > accessKeyDetails.rateLimit) {
      throw new BadRequestException('Rate limit exceeded');
    }



    try {
      //TODO: for now returning access key details as static data but need to fetch real token and return
      return accessKeyDetails;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        ErrorMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateById(
    id: string,
    accessKey: Partial<AccessKey>
  ): Promise<AccessKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessage.INCORRECT_ID);
    }

    const AccessKeyAttribs = Object.keys(
      this.accessKeyModel.schema.paths
    );

    // Remove unnecessary values which is not part of Access Key Schema
    let AccessKeyDataToUpdate = _.pick(
      accessKey,
      AccessKeyAttribs
    );
    const restrictedFields = AccessKeyUpdateRestrictedInputFields;
    AccessKeyDataToUpdate = _.omit(
      AccessKeyDataToUpdate,
      restrictedFields
    );

    const result = await this.accessKeyModel.findByIdAndUpdate(
      id,
      AccessKeyDataToUpdate,
      { new: true }
    );

    if (_.isEmpty(result)) {
      throw new NotFoundException(responseMessage.ACCESS_KEY_NOT_FOUND);
    }

    return result;
  }

  async deleteById(
    id: string
  ): Promise<AccessKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessage.INCORRECT_ID);
    }


    const result = await this.accessKeyModel.findByIdAndDelete(
      id
    );

    if (_.isEmpty(result)) {
      throw new NotFoundException(responseMessage.ACCESS_KEY_NOT_FOUND);
    }

    return result;
  }

  //This is to deactivate or reactivate product.
  async statusUpdate(
    id: string,
    status: Partial<AccessKey>
  ): Promise<AccessKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(ErrorMessage.INCORRECT_ID);
    }
    if (
      !(Status.ACTIVE === status.status || Status.INACTIVE === status.status)
    ) {
      throw new BadRequestException(
        responseMessage.STATUS_UPDATE_ALLOWED_VALUE_ERROR
      );
    }

    const result = await this.accessKeyModel.findOneAndUpdate(
      { _id: id },
      { status: status.status },
      { new: true }
    );

    if (_.isEmpty(result)) {
      throw new NotFoundException(responseMessage.ACCESS_KEY_NOT_FOUND);
    }

    return result;
  }
}

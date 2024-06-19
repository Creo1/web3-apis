import { Test, TestingModule } from '@nestjs/testing';
import { AccessKeyService } from './access-key.service';
import { getModelToken } from '@nestjs/mongoose';
import { AccessKey } from './schemas/access-key.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAccessKeyDto } from './dto/CreateAccessKey.dto';

describe('AccessKeyService', () => {
  let accessKeyService: AccessKeyService;
  let model: Model<AccessKey>;

  const mockAccessKey = {
    _id: '6672a487c0735ed106c1ec6a',
    userId: '6672a487c0735ed106c1ec6a',
    name: 'token4',
    rateLimit: 5,
    rateLimitTTLInMilliseconds: 60000,
    status: "pending",
    expiration: "2024-06-27T17:59:12.246Z",
    createdBy: '6672a487c0735ed106c1ec6a'
  };

  const mockAccessKeyService = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessKeyService,
        {
          provide: getModelToken(AccessKey.name),
          useValue: mockAccessKeyService,
        },
      ],
    }).compile();

    accessKeyService = module.get<AccessKeyService>(AccessKeyService);
    model = module.get<Model<AccessKey>>(getModelToken(AccessKey.name));
  });

  describe('findAll', () => {
    it('should return an array of access keys', async () => {
      const query = { page: '1', keyword: 'test' };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockAccessKey]),
            }),
          } as any),
      );

      const result = await accessKeyService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({
        name: { $regex: 'test', $options: 'i' },
      });

      expect(result).toEqual([mockAccessKey]);
    });
  });

  describe('create', () => {
    it('should create and return an access key', async () => {
      const newAccessKey = {
        userId: new mongoose.Types.ObjectId('6672a487c0735ed106c1ec6a'),
        name: 'token4',
        rateLimit: 5,
        rateLimitTTLInMilliseconds: 60000,
        status: 'active',
        expiration: "2024-06-27T17:59:12.246Z",
        createdBy: new mongoose.Types.ObjectId("6672a487c0735ed106c1ec6a")
      };

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockAccessKey));

      const result = await accessKeyService.create(
        newAccessKey as CreateAccessKeyDto
      );

      expect(result).toEqual(mockAccessKey);
    });
  });

  describe('findById', () => {
    it('should find and return an access key by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockAccessKey);

      const result = await accessKeyService.findById(mockAccessKey._id);

      expect(model.findById).toHaveBeenCalledWith(mockAccessKey._id);
      expect(result).toEqual(mockAccessKey);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = 'invalid-id';

      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(accessKeyService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if access key is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(accessKeyService.findById(mockAccessKey._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockAccessKey._id);
    });
  });

  describe('updateById', () => {
    it('should update and return an access key', async () => {
      const updatedAccessKey = { ...mockAccessKey, name: 'AccessKey Name' };
      const accessKey = { name: 'AccessKey Name' };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedAccessKey);

      const result = await accessKeyService.updateById(mockAccessKey._id, accessKey as any);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockAccessKey._id, accessKey, {
        new: true,
        runValidators: true,
      });

      expect(result.name).toEqual(accessKey.name);
    });
  });

  describe('deleteById', () => {
    it('should delete and return an access key', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockAccessKey);

      const result = await accessKeyService.deleteById(mockAccessKey._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockAccessKey._id);

      expect(result).toEqual(mockAccessKey);
    });
  });
});
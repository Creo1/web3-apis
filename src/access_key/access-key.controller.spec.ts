import { Test, TestingModule } from '@nestjs/testing';
import { AccessKeyController } from './access-key.controller';
import { AccessKeyService } from './access-key.service';
import { CreateAccessKeyDto } from './dto/CreateAccessKey.dto';
import mongoose from 'mongoose';

describe('AccessKeyController', () => {
  let accessKeyService: AccessKeyService;
  let accessKeyController: AccessKeyController;

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
    findAll: jest.fn().mockResolvedValueOnce([mockAccessKey]),
    create: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockAccessKey),
    updateById: jest.fn(),
    deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AccessKeyController],
      providers: [
        {
          provide: AccessKeyService,
          useValue: mockAccessKeyService,
        },
      ],
    }).compile();

    accessKeyController = module.get<AccessKeyController>(AccessKeyController);
    accessKeyController = module.get<AccessKeyController>(AccessKeyController);
  });

  it('should be defined', () => {
    expect(AccessKeyController).toBeDefined();
  });

  describe('getAllAccessKeys', () => {
    it('should get all access keys', async () => {
      const result = await accessKeyController.getAllAccessKeys({
        page: 1,
        limit: 10,
        sort:'_id|ASC',
        filters: '',
        textSearch : ''
    });

      expect(accessKeyService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockAccessKey]);
    });
  });

  describe('createAccessKey', () => {
    it('should create a new access key', async () => {
        const newAccessKey = {
            // _id: '61c0ccf11d7bf83d153d7c06',
            userId: new mongoose.Types.ObjectId('6672a487c0735ed106c1ec6a'),
            name: 'token4',
            rateLimit: 5,
            rateLimitTTLInMilliseconds: 60000,
            status: 'active',
            expiration: "2024-06-27T17:59:12.246Z",
            createdBy: new mongoose.Types.ObjectId("6672a487c0735ed106c1ec6a")
          };

          mockAccessKeyService.create = jest.fn().mockResolvedValueOnce(mockAccessKey);

      const result = await accessKeyController.createAccessKey(
        newAccessKey as CreateAccessKeyDto
      );

      expect(accessKeyService.create).toHaveBeenCalled();
      expect(result).toEqual(mockAccessKey);
    });
  });

  describe('getAccessKey', () => {
    it('should get a access key by ID', async () => {
      const result = await accessKeyController.getAccessKey(mockAccessKey._id);

      expect(accessKeyService.findById).toHaveBeenCalled();
      expect(result).toEqual(mockAccessKey);
    });
  });

  describe('updateAccessKey', () => {
    it('should update access key by its ID', async () => {
      const updatedAccessKey = { ...mockAccessKey, name: 'Updated name' };
      const accessKey = { name: 'Updated name' };

      mockAccessKeyService.updateById = jest.fn().mockResolvedValueOnce(updatedAccessKey);

      const result = await accessKeyController.updateAccessKey(
        mockAccessKey._id,
        accessKey as CreateAccessKeyDto,
      );

      expect(accessKeyService.updateById).toHaveBeenCalled();
      expect(result).toEqual(updatedAccessKey);
    });
  });

  describe('deleteAccessKey', () => {
    it('should delete a access key by ID', async () => {
      const result = await accessKeyController.deleteAccessKey(mockAccessKey._id);

      expect(accessKeyService.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
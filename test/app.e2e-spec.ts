import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  beforeAll(async () => {
    await mongoose.connect(process.env.E2E_TESTING_MONGODB_CONNECTION_STRING);
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
  // beforeAll(() => {
  //   mongoose.connect(process.env.E2E_TESTING_MONGODB_CONNECTION_STRING, function () {
  //     mongoose.connection.db.dropDatabase();
  //   });
  // });

  // afterAll(() => mongoose.disconnect());

  let accessKeyCreated;

  const newAccessKey = {
    // _id: '61c0ccf11d7bf83d153d7c06',
    userId: '61c0ccf11d7bf83d153d7c06',
    name: 'token5e2e',
    rateLimit: 5,
    rateLimitTTLInMilliseconds: 60000,
    status: "pending",
    expiration: "2024-06-27T17:59:12.246Z",
    createdBy: '61c0ccf11d7bf83d153d7c06'
  };

  describe('AccessKey', () => {
    it('(POST) - Create new access key', async () => {
      return request(app.getHttpServer())
        .post('/api/access-key')
        .send(newAccessKey)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.title).toEqual(newAccessKey.name);
          accessKeyCreated = res.body;
        });
    });

    it('(GET) - Get all Access Keys', async () => {
      return request(app.getHttpServer())
        .get('/api/access-key')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
    });

    it('(GET) - Get an access key by ID', async () => {
      return request(app.getHttpServer())
        .get(`/api/access-key/${accessKeyCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(accessKeyCreated._id);
        });
    });

    it('(PUT) - Update an access key by ID', async () => {
      const accessKey = { name: 'AccessKey name' };
      return request(app.getHttpServer())
        .put(`/api/access-key/${accessKeyCreated?._id}`)
        .send(accessKey)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.name).toEqual(accessKey.name);
        });
    });

    it('(DELETE) - Delete an access key by ID', async () => {
      return request(app.getHttpServer())
        .delete(`/api/access-key/${accessKeyCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(accessKeyCreated._id);
        });
    });
  });
  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});

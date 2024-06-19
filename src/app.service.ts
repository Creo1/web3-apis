import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class AppService {
  index(): object {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    };

    try {
      return healthcheck;
    } catch (error) {
      throw new ServiceUnavailableException(healthcheck);
    }
  }
}

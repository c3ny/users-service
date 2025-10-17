import { Injectable } from '@nestjs/common';
import {
  JwtPayload,
  JwtRepositoryPort,
  JwtToken,
} from '../../application/ports/out/jwt-repository.port';
import * as jwt from 'jsonwebtoken';
import config from './config/auth';

@Injectable()
export class JwtRepository implements JwtRepositoryPort {
  generate(payload: JwtPayload): string {
    if (typeof payload !== 'string' && typeof payload !== 'object') {
      throw new Error('Payload must be a string or an object');
    }

    const token = jwt.sign(payload, config.secret, {
      algorithm: 'HS256',
      expiresIn: config.expiresIn,
    });

    if (!token) {
      throw new Error('Failed to generate token');
    }

    return token;
  }

  verify(token: string): JwtToken {
    return jwt.verify(token, config.secret);
  }
}

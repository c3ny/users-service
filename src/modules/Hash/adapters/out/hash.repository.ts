import { Injectable } from '@nestjs/common';
import { HashRepositoryPort } from '../../application/ports/out/hash-repository.port';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class HashRepository implements HashRepositoryPort {
  hash(password: string): string {
    const salt = randomBytes(16).toString('hex');

    const hash = scryptSync(password, salt, 64).toString('hex');

    return `${salt}:${hash}`;
  }

  compare(password: string, hash: string): boolean {
    const [salt, storedHash] = hash.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const hashBuffer = Buffer.from(storedHash, 'hex');

    const inputHash = scryptSync(password, salt, 64);

    return timingSafeEqual(hashBuffer, inputHash);
  }
}

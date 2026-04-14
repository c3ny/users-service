import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request['user'] as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Token inválido ou ausente');
    }

    if (user.personType !== 'COMPANY' || !user.companyId) {
      throw new ForbiddenException('Acesso restrito a contas do tipo empresa');
    }

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import * as jwt from 'jsonwebtoken'
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request['cookies'].refresh_token;

    if (!token) {
      throw new UnauthorizedException('Refresh token não enviado');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}

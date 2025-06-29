import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export function validateRequest(request: Request): boolean {
  const token = request.cookies?.access_token;

  if (!token) {
    throw new UnauthorizedException('Token não enviado');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    request.user = decoded;
    return true;
  } catch {
    throw new UnauthorizedException('Token inválido ou expirado');
  }
}

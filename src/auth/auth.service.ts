import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { UserDocument } from '../user/model/user.model';
import { UserService } from '../user/user.service';

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  createToken(user: UserDocument) {
    const payload = {
      name: user.name,
      email: user.email,
      id: String(user.id),
    };
    const opts: SignOptions = {
      expiresIn: '1h',
    };
    return this.jwtService.sign(payload, opts);
  }

  async generateRefreshToken(user: UserDocument, expiresIn: number) {
    const token = await this.userService.createRefreshToken(user.id, expiresIn);
    const payload = {
      name: user.name,
      email: user.email,
      id: String(user.id),
    };
    const opts: SignOptions = {
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id),
    };

    return this.jwtService.sign(payload, opts);
  }

  async resolveRefreshToken(encoded: string) {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.is_revoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return {
      user,
      token,
    };
  }

  async createAccessTokenFromRefreshToken(refresh: string) {
    const { user } = await this.resolveRefreshToken(refresh);
    const token = this.createToken(user);

    return {
      user,
      token,
    };
  }

  private getUserFromRefreshTokenPayload(payload: RefreshTokenPayload) {
    const subId = payload.sub;

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.userService.checkId(subId);
  }

  private decodeRefreshToken(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh Token Expired');
      } else {
        throw new UnprocessableEntityException('Refresh Token Malformed');
      }
    }
  }

  private getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload) {
    const tokenId = payload.jti;
    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.userService.findTokenById(tokenId);
  }
}

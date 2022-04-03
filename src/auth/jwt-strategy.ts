import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      signOptions: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      },
    });
  }

  async validate(payload: any) {
    return {
      name: payload.name,
      email: payload.email,
    };
  }
}

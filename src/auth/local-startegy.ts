import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super();
  }

  async validate(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Promise<{ name: string; email: string; role: string }> {
    const user = await this.userService.checkEmail(username);
    if (
      user &&
      bcrypt.compareSync(password, user.password) &&
      user.role === 'Admin'
    )
      return {
        name: user.name,
        email: user.email,
        role: user.role,
      };
    throw new UnauthorizedException();
  }
}

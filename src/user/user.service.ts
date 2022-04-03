import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model/user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { EditUserDto } from './dto/edit-user.dto';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './model/refresh-token.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepo: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshRepo: Model<RefreshTokenDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  async register(user: CreateUserDto) {
    try {
      return await this.userRepo.create(user);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async checkEmail(email: string) {
    try {
      return await this.userRepo.findOne({ email });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async login(credential: LoginDto) {
    try {
      return await this.userRepo.findOne({ email: credential.email });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async checkId(id: string) {
    try {
      return await this.userRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async editUser(id: string, user: EditUserDto) {
    try {
      return await this.userRepo.updateOne({ _id: id }, user);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async createRefreshToken(userId: string, ttl: number) {
    try {
      const expiration = new Date();
      expiration.setTime(expiration.getTime() + ttl);
      return await this.refreshRepo.create({
        user: userId,
        is_revoked: false,
        expires: expiration,
      });
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }

  async findTokenById(id: string) {
    try {
      return await this.refreshRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
    }
  }
}

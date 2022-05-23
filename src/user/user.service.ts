import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model/user.model';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './model/refresh-token.model';
import { SaveUserDto } from './dto/save-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepo: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshRepo: Model<RefreshTokenDocument>,
    @InjectSentry() private readonly client: SentryService,
  ) {}

  getAll() {
    try {
      return this.userRepo.find();
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  getAllForTransaction() {
    try {
      return this.userRepo.find({ role: 'user' }).select('id email');
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  deleteById(id: string) {
    try {
      return this.userRepo.findByIdAndDelete(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  register(user: SaveUserDto) {
    try {
      return this.userRepo.create(user);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  checkEmail(email: string) {
    try {
      return this.userRepo.findOne({ email });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  login(credential: LoginDto) {
    try {
      return this.userRepo.findOne({ email: credential.email });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  checkId(id: string) {
    try {
      return this.userRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  editUser(id: string, user: SaveUserDto) {
    try {
      return this.userRepo.updateOne({ _id: id }, user);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  //* Refresh Token Services
  createRefreshToken(userId: string, ttl: number) {
    try {
      const expiration = new Date();
      expiration.setTime(expiration.getTime() + ttl * 1000);
      return this.refreshRepo.create({
        user: userId,
        is_revoked: false,
        expireAt: expiration,
      });
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }

  findTokenById(id: string) {
    try {
      return this.refreshRepo.findById(id);
    } catch (error) {
      this.client.instance().captureException(error);
      throw error;
    }
  }
}

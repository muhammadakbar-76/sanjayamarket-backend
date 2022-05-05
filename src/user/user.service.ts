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
    return this.userRepo.find();
  }

  getAllForTransaction() {
    return this.userRepo.find({ role: 'user' }).select('id email');
  }

  deleteById(id: string) {
    return this.userRepo.findByIdAndDelete(id);
  }

  register(user: SaveUserDto) {
    return this.userRepo.create(user);
  }

  checkEmail(email: string) {
    return this.userRepo.findOne({ email });
  }

  login(credential: LoginDto) {
    return this.userRepo.findOne({ email: credential.email });
  }

  checkId(id: string) {
    return this.userRepo.findById(id);
  }

  editUser(id: string, user: SaveUserDto) {
    return this.userRepo.updateOne({ _id: id }, user);
  }

  //* Refresh Token Services
  createRefreshToken(userId: string, ttl: number) {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);
    return this.refreshRepo.create({
      user: userId,
      is_revoked: false,
      expires: expiration,
    });
  }

  findTokenById(id: string) {
    return this.refreshRepo.findById(id);
  }

  sendError(e: any) {
    this.client.instance().captureException(e);
  }
}

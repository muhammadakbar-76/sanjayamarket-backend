import { User } from '../user/model/user.model';

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string;
    token: string;
    refresh_token?: string;
    telegram_key: string;
    chat_id: string;
  };
}

export interface payloadJWT {
  name: string;
  email: string;
  id: string;
}

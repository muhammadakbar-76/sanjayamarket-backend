import { IsNotEmpty } from 'class-validator';

export class RefreshRequestDto {
  @IsNotEmpty({ message: 'Refresh Token is required' })
  refresh_token: string;
}

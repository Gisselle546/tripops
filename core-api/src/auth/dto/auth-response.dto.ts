import { UserDto } from '../../users/dto/user.dto';

export class AuthResponseDto {
  user: UserDto;
  accessToken: string;
}

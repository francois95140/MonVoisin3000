import { LoginUserInput } from '../validations/user.validation';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto implements LoginUserInput {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
} 
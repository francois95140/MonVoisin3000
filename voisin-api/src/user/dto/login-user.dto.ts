import { LoginUserInput } from '../validations/user.validation';

export class LoginUserDto implements LoginUserInput {
  email: string;
  password: string;
} 
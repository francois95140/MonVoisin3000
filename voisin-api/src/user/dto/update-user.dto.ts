import { UpdateUserInput } from '../validations/user.validation';

export class UpdateUserDto implements UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string ;
  avatar?: string ;
  bio?: string ;
  phoneNumber?: string ;
  location?: string ;
  timezone?: string ;
  language?: string ;
} 
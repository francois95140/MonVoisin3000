import { UpdateUserInput } from '../validations/user.validation';

export class UpdateUserDto implements UpdateUserInput {
  tag?: string;
  email?: string;
  password?: string;
  pseudo?: string ;
  avatar?: string ;
  bio?: string ;
  location?: string ;
  timezone?: string ;
  language?: string ;
  rue?: string;
  cp?: string;
  ville?: string;
  address?: string;
} 
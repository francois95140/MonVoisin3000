import { CreateUserInput } from '../validations/user.validation';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto implements CreateUserInput {
  @ApiProperty()
  tag: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiPropertyOptional()
  pseudo?: string ;
  @ApiPropertyOptional()
  avatar?: string ;
  @ApiPropertyOptional()
  bio?: string ;
  @ApiPropertyOptional()
  rue?:string;
  @ApiPropertyOptional()
  cp?:string;
  @ApiPropertyOptional()
  ville?:string;
  @ApiPropertyOptional()
  quartier?:string;
  @ApiPropertyOptional()
  location?: string ;
  @ApiPropertyOptional()
  timezone?: string ;
  @ApiPropertyOptional()
  language?: string ;
} 
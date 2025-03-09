import { ResetPasswordUserInput} from '../validations/user.validation';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto implements ResetPasswordUserInput {
  @ApiProperty()
  passwordResetCode: string;
  @ApiProperty()
  newPassword: string;
}
import { RegisterDto } from "../../auth/dto/register.dto";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class UserRedisDataDto extends RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

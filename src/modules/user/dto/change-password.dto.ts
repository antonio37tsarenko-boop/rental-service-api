import { IsString, IsUUID } from "class-validator";

export class ChangePasswordDto {
  @IsUUID()
  userId: string;

  @IsString()
  newPassword: string;
}

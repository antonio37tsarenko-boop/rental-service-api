import { UserRoles } from "generated/prisma";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class SendOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

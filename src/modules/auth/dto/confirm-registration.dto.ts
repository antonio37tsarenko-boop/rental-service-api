import { IsEmail, IsNumber, IsString, Length } from "class-validator";

export class ConfirmRegistrationDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6, { message: "OTP code must be exactly 6 characters" })
  otp: string;
}

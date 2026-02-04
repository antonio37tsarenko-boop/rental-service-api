import { Controller, Post } from "@nestjs/common";
import { SendOtpDto } from "./dto/send-otp.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Controller("auth")
export class AuthController {
  @Post("register")
  register(dto: SendOtpDto) {}

  @Post("login")
  login(dto: LoginDto) {}

  @Post("verify")
  verifyOtp(dto: VerifyOtpDto) {}
}

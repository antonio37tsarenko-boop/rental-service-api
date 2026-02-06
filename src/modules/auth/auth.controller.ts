import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ConfirmRegistrationDto } from "./dto/confirm-registration.dto";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import { REFRESH_TOKEN_TTL } from "./auth.constants";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, sendData } = await this.authService.login(dto);
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendData;
  }

  @Post("confirm")
  async confirmRegistration(
    @Body() dto: ConfirmRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token, sendData } =
      await this.authService.confirmRegistration(dto);

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendData;
  }

  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const oldRefreshToken = req.cookies["refreshToken"];
    if (!oldRefreshToken) throw new UnauthorizedException();

    const { sendData, refresh_token } =
      await this.authService.refresh(oldRefreshToken);

    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_TTL * 1000,
    });

    return sendData;
  }
}

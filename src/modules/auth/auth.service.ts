import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ConfirmRegistrationDto } from "./dto/confirm-registration.dto";
import {
  EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR,
  MAIL_MESSAGE,
  MAIL_SUBJECT,
  OTP_TTL,
  getAccessTokenPayload,
  USER_EXISTS_ERROR,
  WRONG_OTP_ERROR,
  WRONG_PASSWORD_ERROR,
  getRefreshTokenPayload,
  INVALID_REFRESH_TOKEN_ERROR,
} from "./auth.constants";
import { MailService } from "../mail/mail.service";
import { generateOtp } from "../../utils/generate-otp.util";
import { CacheService } from "../cache/cache.service";
import { ICacheUserData } from "./interfaces/cache-user-data.inteface";
import { HashService } from "../hash/hash.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { UserService } from "../user/user.service";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  logger: Logger = new Logger("AuthService");
  constructor(
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register({
    email,
    password,
    middleName,
    lastName,
    firstName,
  }: RegisterDto) {
    const otp = generateOtp();
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      throw new BadRequestException(USER_EXISTS_ERROR);
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const CacheUserData: ICacheUserData = {
      otp,
      userRegisterData: {
        email,
        hashedPassword,
        firstName,
        middleName,
        lastName,
      },
    };

    await this.cacheService.set(`otp:${email}`, CacheUserData, OTP_TTL);

    await this.mailService.sendMail({
      to: email,
      text: MAIL_MESSAGE + otp,
      subject: MAIL_SUBJECT,
    });

    return "Otp Mail is sent.";
  }

  async confirmRegistration({ email, otp }: ConfirmRegistrationDto) {
    const redisKey = `otp:${email}`;
    const cacheUserData = await this.cacheService.get<ICacheUserData>(redisKey);
    if (!cacheUserData) {
      throw new BadRequestException(EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR);
    }

    const TruthfulOtp = cacheUserData.otp;
    const userData = cacheUserData.userRegisterData;

    if (TruthfulOtp !== otp) {
      throw new BadRequestException(WRONG_OTP_ERROR);
    }

    const user = await this.userService.createUser(userData);
    await this.cacheService.delete(redisKey);

    const { access_token, refresh_token } =
      await this.generateAndSaveTokens(user);
    return {
      sendData: {
        access_token,
        id: user.id,
      },
      refresh_token,
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.userService.findUserByEmailOrThrow(email);

    console.log("DEBUG: _____", user.hashedPassword, password);

    const isCorrectPassword = await this.hashService.compare(
      user.hashedPassword,
      password,
    );

    console.log("DEBUG: _____", isCorrectPassword);

    if (!isCorrectPassword) {
      throw new ForbiddenException(WRONG_PASSWORD_ERROR);
    }

    this.logger.log("Password is checked.");

    const { access_token, refresh_token } =
      await this.generateAndSaveTokens(user);

    this.logger.log("Tokens are generated and response is ready.");

    return {
      sendData: {
        access_token,
        id: user.id,
      },
      refresh_token,
    };
  }

  async generateAndSaveTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token = await this.jwtService.signAsync(
      getAccessTokenPayload(user),
      { expiresIn: "15m" },
    );

    this.logger.log("Access token is generated");

    const refresh_token = await this.jwtService.signAsync(
      getRefreshTokenPayload(user),
      { expiresIn: "7d" },
    );

    this.logger.log("Refresh token is generated");

    return {
      access_token,
      refresh_token,
    };
  }

  async refresh(refreshToken: string) {
    let payload: IJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<IJwtPayload>(refreshToken);
    } catch (e) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_ERROR);
    }

    const user = await this.userService.findUserByIdOrThrow(payload.id);
    console.log(user, user.role);

    const { access_token, refresh_token } =
      await this.generateAndSaveTokens(user);

    return {
      sendData: {
        access_token,
        id: user.id,
      },
      refresh_token,
    };
  }
}

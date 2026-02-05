import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ConfirmRegistrationDto } from "./dto/confirm-registration.dto";
import { PrismaService } from "../prisma/prisma.service";
import {
  EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR,
  MAIL_MESSAGE,
  MAIL_SUBJECT,
  OTP_TTL,
  getAccessTokenPayload,
  USER_DOESNT_EXIST_ERROR,
  USER_EXISTS_ERROR,
  WRONG_OTP_ERROR,
  WRONG_PASSWORD_ERROR,
  getRefreshTokenPayload,
  REFRESH_TOKEN_TTL,
  INVALID_REFRESH_TOKEN_ERROR,
} from "./auth.constants";
import { MailService } from "../mail/mail.service";
import { generateOtp } from "../../utils/generate-otp.util";
import { CacheService } from "../cache/cache.service";
import { ICacheUserData } from "./interfaces/cache-user-data.inteface";
import { HashService } from "./hash.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly cacheService: CacheService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    email,
    password,
    middleName,
    lastName,
    firstName,
  }: RegisterDto) {
    const otp = generateOtp();
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
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

    await this.cacheService.set(
      `otp:${email}`,
      JSON.stringify(CacheUserData),
      OTP_TTL,
    );

    await this.mailService.sendMail({
      to: email,
      text: MAIL_MESSAGE + otp,
      subject: MAIL_SUBJECT,
    });
  }

  async confirmRegistration({ email, otp }: ConfirmRegistrationDto) {
    const redisKey = `otp:${email}`;
    const cacheUserData = await this.cacheService.get<ICacheUserData>(redisKey);
    if (!cacheUserData) {
      throw new BadRequestException(EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR);
    }

    const TruthfulOtp = cacheUserData.otp;
    const { hashedPassword, firstName, middleName, lastName } =
      cacheUserData.userRegisterData;

    if (TruthfulOtp !== otp) {
      throw new BadRequestException(WRONG_OTP_ERROR);
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        middleName,
        lastName,
      },
    });
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

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(USER_DOESNT_EXIST_ERROR);
    }

    const isCorrectPassword = await this.hashService.compare(
      user.hashedPassword,
      password,
    );

    if (!isCorrectPassword) {
      throw new ForbiddenException(WRONG_PASSWORD_ERROR);
    }

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

  async generateAndSaveTokens(user: User): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token = await this.jwtService.signAsync(
      getAccessTokenPayload(user),
    );
    const refresh_token = await this.jwtService.signAsync(
      getRefreshTokenPayload(user),
    );
    await this.cacheService.set(
      `refresh_token:${user.id}`,
      refresh_token,
      REFRESH_TOKEN_TTL,
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<{
      email: string;
      id: string;
      expiresIn: string;
    }>(refreshToken);

    const savedToken = await this.cacheService.get<string>(
      `refresh_token:${payload.id}`,
    );

    if (!savedToken || savedToken !== refreshToken) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_ERROR);
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(USER_DOESNT_EXIST_ERROR);
    }

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

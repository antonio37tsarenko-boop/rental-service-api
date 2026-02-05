import { BadRequestException, Injectable, Post } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ConfirmRegistrationDto } from "./dto/confirm-registration.dto";
import { PrismaService } from "../prisma/prisma.service";
import {
  EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR,
  MAIL_MESSAGE,
  MAIL_SUBJECT,
  OTP_TTL,
  USER_EXISTS_ERROR,
  WRONG_OTP_ERROR,
} from "./auth.constants";
import { MailService } from "../mail/mail.service";
import { generateOtp } from "../../utils/generate-otp.util";
import { CacheService } from "../cache/cache.service";
import { ICacheUserData } from "./interfaces/cache-user-data.inteface";
import { HashService } from "./hash.service";
import { JwtService } from "@nestjs/jwt";

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

    const { id } = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName,
        middleName,
        lastName,
      },
    });
    await this.cacheService.delete(redisKey);

    const access_token = await this.jwtService.signAsync({
      email,
      user: { id, email, firstName },
    });

    return {
      access_token,
      id,
    };
  }

  async login(dto: LoginDto) {}
}

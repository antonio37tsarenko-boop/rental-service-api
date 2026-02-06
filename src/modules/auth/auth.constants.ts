import { User } from "@prisma/client";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";

export const USER_EXISTS_ERROR: string = "User with this email already exists.";
export const MAIL_MESSAGE: string = `This is your One Time Password. Don\'t tell it to nobody. If you didn\'t request it - ignore this message`;
export const MAIL_SUBJECT: string = "Rental service One Time Password";
export const WRONG_OTP_ERROR: string = "Wrong otp.";
export const USER_DOESNT_EXIST_ERROR = "User with this email doesnt exist.";
export const WRONG_PASSWORD_ERROR = "Wrong password.";
export const INVALID_REFRESH_TOKEN_ERROR = "Invalid refresh token.";
export const EMAIL_NOT_ACCEPTED_ON_REGISTRATION_ERROR: string =
  "This email was not accepted on registration.";
export const OTP_TTL: number = 600;
export const REFRESH_TOKEN_TTL: number = 60 * 60 * 24 * 7;

export const getAccessTokenPayload = function (user: User): IJwtPayload {
  const { id, email, role } = user;
  return {
    expiresIn: "15m",
    email,
    id,
    role,
  };
};

export const getRefreshTokenPayload = function (user: User): object {
  const { id, email } = user;

  return {
    email,
    id,
    expiresIn: "7d",
  };
};

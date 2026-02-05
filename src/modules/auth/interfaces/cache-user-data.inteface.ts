export interface ICacheUserData {
  otp: string;
  userRegisterData: {
    email: string;
    hashedPassword: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
}

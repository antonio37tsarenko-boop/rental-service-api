export interface ICreateUserData {
  email: string;
  hashedPassword: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

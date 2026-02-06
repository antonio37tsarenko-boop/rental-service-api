import { UserRoles } from "@prisma/client";

export interface IJwtPayload {
  email: string;
  id: string;
  expiresIn: string;
  role: UserRoles;
}

import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class HashService {
  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  compare(hash: string, password: string) {
    return bcrypt.compare(hash, password);
  }
}

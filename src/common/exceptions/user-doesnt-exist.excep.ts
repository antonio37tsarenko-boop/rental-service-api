import { NotFoundException } from "@nestjs/common";

export class UserDoesntExistException extends NotFoundException {
  constructor() {
    super("User with this email doesnt exist.");
  }
}

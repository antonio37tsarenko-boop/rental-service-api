import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { ISendMail } from "./interfaces/send-mail.interface";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(mailDetails: ISendMail) {
    await this.mailerService.sendMail(mailDetails);
  }
}

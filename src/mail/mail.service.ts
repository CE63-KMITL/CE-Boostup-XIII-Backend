import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { sendMailDto } from './dtos/mail.dto';

@Injectable()
export class MailService {
   constructor(private readonly configService: ConfigService) {}

   emailTransporter() {
      const transporter = nodemailer.createTransport({
         host: this.configService.get<string>(GLOBAL_CONFIG.MAIL_HOST),
         port: this.configService.get<string>(GLOBAL_CONFIG.MAIL_PORT),
         secure: false,
         auth: {
            user: this.configService.get<string>(GLOBAL_CONFIG.MAIL_USER),
            pass: this.configService.get<string>(GLOBAL_CONFIG.MAIL_PASS),
         },
      });

      return transporter;
   }

   async sendMail(mail: sendMailDto) {
      const { recipients, subject, html } = mail;

      const transporter = this.emailTransporter();

      const options: nodemailer.SendMailOptions = {
         from: this.configService.get<string>(GLOBAL_CONFIG.MAIL_USER),
         to: recipients,
         subject: subject,
         html: html,
      };

      try {
         await transporter.sendMail(options);
      } catch (error) {
         throw new HttpException(
            'Faild to send email',
            HttpStatus.INTERNAL_SERVER_ERROR,
         );
      }
   }
}

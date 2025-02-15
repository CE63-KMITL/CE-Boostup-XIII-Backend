import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { sendMailDto } from './dtos/mail.dto';

@Controller('mail')
export class MailController {
   constructor(private readonly mailService: MailService) {}

   @Post('send')
   async sendMail(@Body() mail: sendMailDto) {
      await this.mailService.sendMail(mail);
      return { message: 'Email sent successfully' };
   }
}

import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { MailService } from "./mail.service";
import { sendMailDto } from "./dtos/mail.dto";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("mail")
@ApiTags("Mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("send")
  @ApiResponse({
    status: 200,
    description: "Send email",
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  async sendMail(@Body() mail: sendMailDto): Promise<{ message: string }> {
    await this.mailService.sendMail(mail);
    return { message: "Email sent successfully" };
  }
}

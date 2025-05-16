import { IsEmail, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateVariables } from '../../../mail/interfaces/templated-mail';

export class SendTemplatedMailDto {
	@ApiProperty({
		description: 'Recipient email address',
		example: 'test@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	to: string;

	@ApiProperty({
		description: 'Variables to replace in the email template',
		example: {
			PreheaderText: 'Preheader text goes here',
			MainTitle: 'CE BOOSTUP Email Update',
			ActionPromptText: 'Please verify your account:',
			OTPValue: 'YOUR_OTP_CODE',
			ButtonText: 'Verify Account',
			ExpirationMessage: 'This link is valid for 1 hour.',
			SecurityWarning:
				'If you did not request this email, please ignore it.',
			CustomBodyContent: 'This is custom content for your email body.',
		} as EmailTemplateVariables,
	})
	@IsObject()
	@IsNotEmpty()
	variables: EmailTemplateVariables;
}

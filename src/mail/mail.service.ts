import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailOptions } from './interfaces/mail.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { readFileSync } from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { EmailTemplateVariables } from './interfaces/templated-mail';

@Injectable()
export class MailService implements OnModuleInit {
	private emailTemplate: string;

	constructor(
		@InjectQueue('mailQueue')
		private readonly mailQueue: Queue<MailOptions>,
		private readonly confgiService: ConfigService,
	) {}

	async onModuleInit() {
		const templatePath = path.join(__dirname, '..', 'email.html');
		try {
			this.emailTemplate = readFileSync(templatePath, 'utf-8');
		} catch (error) {
			console.warn(
				`Failed to read email template file at ${templatePath}`,
				error,
			);
		}
	}

	async sendMail(mail: MailOptions) {
		await this.mailQueue.add(
			'sendMail',
			{ ...mail },
			{ removeOnComplete: true, removeOnFail: false },
		);
	}

	generateEmailHtml(variables: EmailTemplateVariables): string {
		if (!this.emailTemplate) {
			console.error('Email template not loaded.');
			return '';
		}

		let html = this.emailTemplate;

		for (const key in variables) {
			if (Object.prototype.hasOwnProperty.call(variables, key)) {
				const placeholder = `{{${key}}}`;
				const regex = new RegExp(placeholder, 'g');
				html = html.replace(regex, String(variables[key]));
			}
		}

		return html;
	}

	generateEmailHtmlWithOtp(
		otp: string,
		variables: EmailTemplateVariables,
	): string {
		variables = {
			...variables,

			ExpirationMessage: `ลิงค์นี้จะหมดอายุในอีก ${this.confgiService.getOrThrow<string>(GLOBAL_CONFIG.OTP_EXPIRY_MINUTE)} นาที`,
		};
		return this.generateEmailHtml(variables);
	}

	generateEmailHtmlOpenAccount(otp: string): string {
		const variables: EmailTemplateVariables = {
			PreheaderText: 'เปิดใช้งานบัญชี!',
			MainTitle: 'CE BOOSTUP XIII กรุณาเปิดใช้งานบัญชี',
			ActionPromptText:
				'ขณะนี้ระบบได้สร้างบัญชีให้คุณแล้ว!~ กรุณาเปิดใช้งานบัญชี',
			OTPValue: otp,
			ButtonText: 'เปิดใช้งานบัญชี!~',
			SecurityWarning: '( •̀ ω •́ )✧',
		};
		return this.generateEmailHtmlWithOtp(otp, variables);
	}

	generateEmailHtmlResetPassword(otp: string): string {
		const variables: EmailTemplateVariables = {
			PreheaderText: 'รีเซ็ตรหัสผ่านของคุณ',
			MainTitle: 'CE BOOSTUP XIII รีเซ็ตรหัสผ่านของคุณ',
			ActionPromptText:
				'มีคําขอรีเซ็ตรหัสผ่าน!~ กรุณารีเซ็ตรหัสผ่านของคุณ',
			OTPValue: otp,
			ButtonText: 'รีเซ็ตรหัสผ่าน!~',
			SecurityWarning:
				'หากคุณไม่ได้เป็นคนทำ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ ( •̀ ω •́ )✧',
		};
		return this.generateEmailHtmlWithOtp(otp, variables);
	}
}

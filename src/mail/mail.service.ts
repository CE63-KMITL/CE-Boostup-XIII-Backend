import { Injectable, OnModuleInit } from '@nestjs/common';
import { mailType } from './types/mail.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { readFileSync } from 'fs';
import * as path from 'path';
import { EmailTemplateVariables } from 'src/auth/dev/dtos/send-templated-mail.dto';

@Injectable()
export class MailService implements OnModuleInit {
	private emailTemplate: string;

	constructor(
		@InjectQueue('mailQueue')
		private readonly mailQueue: Queue<mailType>,
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

	async sendMail(mail: mailType) {
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

	generateEmailHtmlWithOtp(otp: string): string {
		const variables: EmailTemplateVariables = {
			PreheaderText: 'เปิดใช้งานบัญชี!',
			MainTitle: 'CE BOOSTUP XIII กรุณาเปิดใช้งานบัญชี',
			ActionPromptText:
				'ขณะนี้ระบบได้สร้างบัญชีให้คุณแล้ว!~ กรุณาเปิดใช้งานบัญชี',
			OTPValue: otp,
			ButtonText: 'เปิดใช้งานบัญชี!~',
			ExpirationMessage: 'ลิงค์นี้จะหมดอายุในอีก 30 นาที',
			SecurityWarning: '( •̀ ω •́ )✧',
		};
		return this.generateEmailHtml(variables);
	}
}

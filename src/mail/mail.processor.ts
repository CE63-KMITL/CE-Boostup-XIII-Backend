import { Processor, WorkerHost } from '@nestjs/bullmq';
import {
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { Transporter } from 'nodemailer';
import { MailOptions } from './interfaces/mail.type';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';

@Processor('mailQueue')
@Injectable()
export class MailProcessor extends WorkerHost {
	constructor(
		@Inject('MAIL_TRANSPORT')
		private readonly transporter: Transporter,
		private readonly configService: ConfigService,
	) {
		super();
	}

	async process(job: Job<MailOptions>): Promise<void> {
		const { to, subject, html, text } = job.data;
		try {
			await this.transporter.sendMail({
				from: this.configService.getOrThrow<string>(
					GLOBAL_CONFIG.MAIL_USER,
				),
				to,
				subject,
				html,
				text,
			});
		} catch (error) {
			if (error instanceof Error)
				throw new InternalServerErrorException(error.message);
		}
	}
}

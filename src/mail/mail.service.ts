import { Injectable } from '@nestjs/common';
import { mailType } from './types/mail.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
	constructor(
		@InjectQueue('mailQueue')
		private readonly mailQueue: Queue<mailType>,
	) {}

	async sendMail(mail: mailType) {
		await this.mailQueue.add(
			'sendMail',
			{ ...mail },
			{ removeOnComplete: true, removeOnFail: false },
		);
	}
}

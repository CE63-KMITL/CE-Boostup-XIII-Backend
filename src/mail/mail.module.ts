import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProvider } from './mail.provider';
import { MailProcessor } from './mail.processor';

@Module({
	imports: [
		ConfigModule,
		BullModule.registerQueueAsync({
			name: 'mailQueue',
		}),
	],
	providers: [MailService, MailProvider, MailProcessor],
	exports: [MailService],
})
export class MailModule {}

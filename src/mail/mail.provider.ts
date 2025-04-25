import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';

export const MailProvider: Provider = {
	provide: 'MAIL_TRANSPORT',
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return createTransport({
			host: configService.get<string>(GLOBAL_CONFIG.MAIL_HOST),
			port: configService.get<number>(GLOBAL_CONFIG.MAIL_PORT),
			secure: false,
			auth: {
				user: configService.get<string>(GLOBAL_CONFIG.MAIL_USER),
				pass: configService.get<string>(GLOBAL_CONFIG.MAIL_PASS),
			},
		});
	},
};

import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { AutoSendMailDto } from './dtos/auto-send-mail';
import { AuthService } from '../auth.service';
import { IsNull } from 'typeorm';
import { SendTemplatedMailDto } from './dtos/send-templated-mail.dto';

@ApiTags('Auth (DEV)')
@Controller('dev/auth/')
export class DevAuthController {
	constructor(
		private readonly mailService: MailService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}

	/*
	-------------------------------------------------------
	Test Roles Endpoint
	-------------------------------------------------------
	*/
	@Get('roles')
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: 'Success' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden (Requires DEV role)' })
	getRoles() {
		return 'You are dev!';
	}

	@Get('dev')
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: 'Success' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden (Requires DEV role)' })
	getstaffOnly() {
		return 'You are dev!';
	}

	@Get('member')
	@AllowRole(Role.MEMBER)
	@ApiResponse({ status: 200, description: 'Success (MEMBER only)' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden (Requires MEMBER role)',
	})
	getMenberOnly() {
		return 'You are member!';
	}

	@Get('all')
	@AllowRole(Role.MEMBER, Role.DEV)
	@ApiResponse({ status: 200, description: 'Success (MEMBER or DEV)' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden (Requires MEMBER or DEV role)',
	})
	getall() {
		return 'everyone can see this (MEMBER or DEV)';
	}

	@Post('auto-send-mail')
	@AllowRole(Role.DEV)
	async autoSendMail(@Body() body: AutoSendMailDto) {
		const users = await this.userService.findAll(
			{ where: { role: body.role, password: IsNull() } },
			false,
		);

		if (users.length === 0) return 'No user found';

		console.log(users);

		const result = [];

		for (const user of users) {
			try {
				await this.authService.requestOpenAccount(user.email);
				result.push({
					email: user.email,
					status: 'success',
				});
			} catch (error) {
				result.push({
					email: user.email,
					status: 'fail',
					message: error.message,
				});
			}
		}

		return result;
	}

	@Post('email')
	@AllowRole(Role.DEV)
	sentMail(@Body() body) {
		return this.mailService.sendMail({
			to: body?.to,
			subject: body?.subject,
			html: body?.html,
			text: body?.text,
		});
	}

	//-------------------------------------------------------
	// Templated Mail Endpoint
	//-------------------------------------------------------

	@Post('send-templated-mail')
	@AllowRole(Role.DEV)
	@ApiResponse({
		status: 200,
		description: 'Templated email sent successfully',
	})
	@ApiResponse({ status: 400, description: 'Invalid request body' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden (Requires DEV role)' })
	async sendTemplatedMail(@Body() body: SendTemplatedMailDto) {
		const { to, variables } = body;

		const subject = variables.MainTitle || 'CE BOOSTUP  XIII';

		const htmlContent = this.mailService.generateEmailHtml(variables);

		console.log(htmlContent);

		await this.mailService.sendMail({
			to,
			subject,
			html: htmlContent,
			text: 'Please view this email in an HTML-enabled client.',
		});

		return { message: 'Templated email queued successfully', to };
	}
}

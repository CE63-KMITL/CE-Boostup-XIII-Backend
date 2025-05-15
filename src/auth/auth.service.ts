import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	GoneException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { LoginDto } from './dtos/login.dto';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { UserResponseDto } from 'src/user/dtos/user-response.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { OpenAccountDto } from './dtos/open-account.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly mailservice: MailService,
	) {}

	async requestOpenAccount(email: string): Promise<void> {
		const user = await this.userService.findOne({ where: { email } });
		if (!user) throw new BadRequestException('user not found');
		if (!!user.password)
			throw new BadRequestException('account already opened');
		const otp = this.generateOtp(
			this.configService.getOrThrow<number>(GLOBAL_CONFIG.OTP_LENGTH),
		);
		const otpExpires = new Date(
			Date.now() +
				this.configService.getOrThrow<number>(
					GLOBAL_CONFIG.OTP_EXPIRY_MINUTE,
				) *
					60 *
					1000,
		).toISOString();
		try {
			await this.mailservice.sendMail({
				to: email,
				subject: 'your activation code',
				html: `<h1>${otp}</h1>`,
			});
		} catch (error) {
			console.error(error);
			throw new BadRequestException('fail to send mail');
		}

		await this.userService.update(user.id, { otp, otpExpires });
	}

	async openAccount(data: OpenAccountDto): Promise<AuthResponseDto> {
		const { email, password, name, otp } = data;
		const user = await this.userService.findOne({ where: { email } });
		if (!user) throw new UnauthorizedException('user not found');
		if (!!user.password)
			throw new ConflictException('Email already confirm');
		if (!user.otp) throw new BadRequestException('OTP not found');
		if (user.otp !== otp)
			throw new UnauthorizedException('Invalid OTP code');
		if (user.otpExpires && user.otpExpires < new Date())
			throw new GoneException('OTP code expired');

		const userResponse = await this.userService.update(user.id, {
			password,
			name,
			otp: null,
			otpExpires: null,
		});

		const token = await this.generateToken(userResponse);
		return {
			token,
			user: userResponse,
		};
	}

	async register(user: RegisterUserDto): Promise<void> {
		try {
			await this.userService.create(user);
		} catch (error) {
			throw new BadRequestException('User already exists');
		}
	}

	async login(loginData: LoginDto): Promise<AuthResponseDto> {
		const { email, password } = loginData;

		const user = await this.validateUser(email, password);
		const token = await this.generateToken(user);
		return {
			token,
			user,
		};
	}
	private async validateUser(
		email: string,
		password: string,
	): Promise<UserResponseDto> {
		const user = await this.userService.findOne({
			where: { email },
		});
		if (!!user && !user.password)
			throw new ForbiddenException('Account not activated');
		if (!user) throw new UnauthorizedException('Wrong email or password');
		const passwordCompare = await bcrypt.compare(password, user.password);
		if (!passwordCompare)
			throw new UnauthorizedException('Wrong email or password');
		return new UserResponseDto(user);
	}
	private async generateToken(user: UserResponseDto): Promise<string> {
		const expiresIn = this.configService.get<string>(
			GLOBAL_CONFIG.JWT_ACCESS_EXPIRATION,
		) as `${number}${'s' | 'm' | 'h' | 'd'}`;

		// create token
		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			this.configService.get<string>(GLOBAL_CONFIG.TOKEN_KEY),
			{
				expiresIn,
			},
		);
		return token;
	}

	private generateOtp(length: number) {
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let token = '';
		for (let i = 0; i < length; i++) {
			token += characters.charAt(
				Math.floor(Math.random() * charactersLength),
			);
		}
		return token;
	}
}

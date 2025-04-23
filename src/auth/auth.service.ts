import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { User } from '../user/user.entity';
import { LoginDto } from './dto/login.dto';
import { loginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService,
	) {}

	async openAccount(data: { email: string; house: string; key: string }) {
		const { email, house, key } = data;
		switch (key) {
			case 'CE1':
				console.log('key=ce1');
				break;
			default:
				console.log('Unknown key');
		}
	}

	async validateUser(email: string, password: string) {
		const checkEmail = await this.userRepository.findOne({
			where: { email },
		});
		if (!checkEmail) {
			return null;
		}
		const passwordCompare = await bcrypt.compare(
			password,
			checkEmail.password,
		);
		return passwordCompare ? checkEmail : null;
	}

	async login(loginData: LoginDto): Promise<loginResponseDto> {
		const { email, password } = loginData;

		// check null or blank
		if (!(email && password)) {
			throw new BadRequestException(
				'Email and password cannot be empty',
			);
		}

		const user = await this.validateUser(email, password);

		// check if user exists
		if (!user) {
			throw new UnauthorizedException('Wrong email or password');
		}
		const expiresIn = this.configService.get<string>(
			GLOBAL_CONFIG.JWT_ACCESS_EXPIRATION,
		) as `${number}${'s' | 'm' | 'h' | 'd'}`;

		// create token
		const token = jwt.sign(
			{ userId: user.id, email, role: user.role },
			this.configService.get<string>(GLOBAL_CONFIG.TOKEN_KEY),
			{
				expiresIn,
			},
		);

		// return token + user info
		return {
			token,
			user,
		};
	}
}

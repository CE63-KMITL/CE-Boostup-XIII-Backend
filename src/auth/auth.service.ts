import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { GLOBAL_CONFIG } from "../shared/constants/global-config.constant";
import { User } from "../user/user.entity";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async openAccount(data: { email: string; house: string; key: string }) {
		const { email, house, key } = data;
		switch (key) {
			case "CE1":
				console.log("key=ce1");
				break;
			default:
				console.log("Unknown key");
		}
	}

	async validateUser(email: string, password: string) {
		const check_email = await this.userRepository.findOne({ where: { email } });
		console.log(check_email);
		if (!check_email) {
			console.log("Not found user");
			return null;
		}
		const Password_compare = await bcrypt.compare(password, check_email.password);
		return Password_compare ? check_email : null;
	}

	async login(loginData: LoginDto): Promise<any> {
		const { email, password } = loginData;

		// check null or blank
		if (!(email && password)) {
			throw new BadRequestException("Email and password cannot be empty");
		}

		const user = await this.validateUser(email, password);

		// check if user exists
		if (!user) {
			throw new UnauthorizedException("Wrong email or password");
		}

		// create token
		const token = jwt.sign({ user_id: user.id, email }, GLOBAL_CONFIG.TOKEN_KEY, { expiresIn: "1d" });

		// return token + user info
		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name, // ถ้ามี field อื่นเพิ่มก็ใส่ไปได้
			},
		};
	}
}

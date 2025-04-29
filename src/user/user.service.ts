import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { House } from 'src/shared/enum/house.enum';
import { FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { ProblemStatus } from './score/problem-status.entity';
import { ProblemStatusEnum } from 'src/problem/enum/problem-staff-status.enum';
import { ScoreLog } from './score/score-log.entity';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { Role } from 'src/shared/enum/role.enum';

@Injectable()
export class UserService implements OnModuleInit {
	constructor(
		@InjectRepository(User)
		public readonly userRepository: Repository<User>,
		@InjectRepository(ScoreLog)
		private readonly scoreLogRepository: Repository<ScoreLog>,
		@InjectRepository(ProblemStatus)
		private readonly problemStatusRepository: Repository<ProblemStatus>,
		private readonly configService: ConfigService,
	) {}

	async onModuleInit() {
		const adminEmail = this.configService.getOrThrow<string>(
			GLOBAL_CONFIG.ADMIN_EMAIL,
		);
		const salt = await bcrypt.genSalt(10);
		const adminPass = await bcrypt.hash(
			this.configService.getOrThrow<string>(GLOBAL_CONFIG.ADMIN_PASS),
			salt,
		);
		const admin = await this.userRepository.findOne({
			where: { email: adminEmail },
		});
		if (!admin) {
			this.userRepository.save({
				email: adminEmail,
				password: adminPass,
				name: 'admin',
				role: Role.DEV,
			});
		}
	}

	/*
	-------------------------------------------------------
	User Management
	-------------------------------------------------------
	*/
	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.userRepository.find();
		return users.map((user) => new UserResponseDto(user));
	}

	async findOne(option: FindOneOptions<User>): Promise<User> {
		const responseUser = await this.userRepository.findOne(option);
		if (!responseUser) throw new NotFoundException('User not found');

		return responseUser;
	}

	async create(user: CreateUserDto): Promise<UserResponseDto> {
		try {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(user.password, salt);
			user.password = hashedPassword;

			const responseUser = await this.userRepository.save(user);
			return new UserResponseDto(responseUser);
		} catch (error) {
			throw new BadRequestException('User already exists');
		}
	}

	async update(
		id: string,
		partialEntity: QueryDeepPartialEntity<User>,
	): Promise<UserResponseDto> {
		if (partialEntity.score !== undefined) {
			const score = Number(partialEntity.score);
			if (isNaN(score) || score < 0) {
				throw new BadRequestException(
					'Score must be a valid number >= 0',
				);
			}
		}

		if (partialEntity.password !== undefined) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(
				partialEntity.password as string,
				salt,
			);
			partialEntity.password = hashedPassword;
		}

		try {
			await this.userRepository.update(id, partialEntity);
			const responseUser = await this.userRepository.findOne({
				where: { id },
			});
			if (!responseUser) throw new NotFoundException('User not found');

			return new UserResponseDto(responseUser);
		} catch (error) {
			throw new InternalServerErrorException('Error updating user');
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await this.userRepository.delete(id);
		} catch (error) {
			throw new NotFoundException('User not found');
		}
	}

	async uploadIcon(id: string, iconBase64: string) {
		try {
			await this.userRepository.update(id, { icon: iconBase64 });
		} catch (error) {
			throw new InternalServerErrorException('Error uploading icon');
		}
	}

	/*
	-------------------------------------------------------
	House Management
	-------------------------------------------------------
	*/
	async getHouse(id: string): Promise<House> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');
		return user.house;
	}

	async findUsersByHouse(house: House): Promise<UserResponseDto[]> {
		const response = await this.userRepository.find({ where: { house } });
		return response.map((user) => new UserResponseDto(user));
	}

	/*
	-------------------------------------------------------
	Score Management
	-------------------------------------------------------
	*/
	async modifyScore(
		userId: string,
		amount: number,
		modifiedById: string,
	): Promise<UserResponseDto> {
		const user = await this.userRepository.findOneOrFail({
			where: { id: userId },
		});
		const modifiedBy = await this.findOne({
			where: { id: modifiedById },
		});

		user.score += amount;
		if (user.score < 0) user.score = 0;

		const scoreLog = new ScoreLog();
		scoreLog.amount = amount;
		scoreLog.user = user;
		scoreLog.modifiedBy = modifiedBy;

		await this.scoreLogRepository.save(scoreLog);
		const response = await this.userRepository.save(user);
		return new UserResponseDto(response);
	}

	async getUserScoreLogs(id: string): Promise<ScoreLog[]> {
		const user = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.scoreLogs', 'scoreLogs')
			.leftJoinAndSelect('scoreLogs.user', 'scoreLogUser')
			.leftJoinAndSelect('scoreLogs.modifiedBy', 'modifiedByUser')
			.select([
				'user.id',
				'scoreLogs.id',
				'scoreLogs.amount',
				'scoreLogs.date',
				'modifiedByUser.id',
				'modifiedByUser.name',
				'modifiedByUser.studentId',
				'modifiedByUser.icon',
			])
			.where('user.id = :id', { id })
			.getOne();

		if (!user || !user.scoreLogs) return [];
		return user.scoreLogs;
	}

	/*
	-------------------------------------------------------
	Problem Status Management
	-------------------------------------------------------
	*/
	async getProblemStatus(
		userId: string,
		problemId: string,
	): Promise<ProblemStatusEnum> {
		try {
			const userProblem = await this.getUserProblem(userId, problemId);
			return userProblem.status;
		} catch (error) {
			if (String(error).includes('Problem not found'))
				return ProblemStatusEnum.NOT_STARTED;
		}
		return null;
	}

	async getUserProblem(
		userId: string,
		problemId: string,
	): Promise<ProblemStatus> {
		const userProblem = await this.userRepository
			.createQueryBuilder('user')
			.where('user.id = :userId', { userId })
			.leftJoinAndSelect('user.problemStatus', 'problemStatus')
			.andWhere('problemStatus.problemId = :problemId', { problemId })
			.getOne();

		if (!userProblem?.problemStatus?.length) {
			throw new NotFoundException('Problem not found');
		}
		return userProblem.problemStatus[0];
	}

	async setProblemStatus(
		problemId: string,
		userId: string,
	): Promise<ProblemStatus> {
		const userProblem = await this.getUserProblem(userId, problemId);
		userProblem.status = ProblemStatusEnum.IN_PROGRESS;
		await this.problemStatusRepository.save(userProblem);
		return userProblem;
	}
}

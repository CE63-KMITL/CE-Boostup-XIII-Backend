import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { House } from 'src/shared/enum/house.enum';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import {
	ProblemStatus,
	ProblemStatusEnum,
} from './score/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		public readonly userRepository: Repository<User>,
		@InjectRepository(ScoreLog)
		private readonly scoreLogRepository: Repository<ScoreLog>,
		@InjectRepository(ProblemStatus)
		private readonly problemStatusRepository: Repository<ProblemStatus>,
	) {}

	/*
	-------------------------------------------------------
	User Management
	-------------------------------------------------------
	*/
	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.userRepository.find();
		return users.map((user) => new UserResponseDto(user));
	}

	async findOne(id: string): Promise<User> {
		if (!id) throw new BadRequestException('ID is required');

		const responseUser = await this.userRepository.findOne({
			where: { id },
		});
		if (!responseUser) throw new NotFoundException('User not found');

		return responseUser;
	}

	async findEntityById(id: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');
		return user;
	}

	async create(user: CreateUserDto): Promise<UserResponseDto> {
		try {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(user.password, salt);
			user.password = hashedPassword;

			const responseUser = await this.userRepository.save(user);
			return responseUser;
			// return plainToInstance(UserResponseDto, responseUser);
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

			// return plainToInstance(UserResponseDto, responseUser);
			return responseUser;
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

	async findUsersByHouse(house: House): Promise<User[]> {
		return this.userRepository.find({ where: { house } });
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
	): Promise<User> {
		const user = await this.userRepository.findOneOrFail({
			where: { id: userId },
		});
		const modifiedBy = await this.findOne(modifiedById);

		user.score += amount;
		if (user.score < 0) user.score = 0;

		const scoreLog = new ScoreLog();
		scoreLog.amount = amount;
		scoreLog.user = user;
		scoreLog.modifiedBy = modifiedBy;

		await this.scoreLogRepository.save(scoreLog);
		return this.userRepository.save(user);
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
		problemId: number,
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
		problemId: number,
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
		problemId: number,
		userId: string,
	): Promise<ProblemStatus> {
		const userProblem = await this.getUserProblem(userId, problemId);
		userProblem.status = ProblemStatusEnum.IN_PROGRESS;
		await this.problemStatusRepository.save(userProblem);
		return userProblem;
	}
}

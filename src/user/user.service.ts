import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { ConfigService } from '@nestjs/config';
import { ProblemStatusEnum } from 'src/problem/enum/problem-staff-status.enum';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { House } from 'src/shared/enum/house.enum';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import {
	UserFrontDataResponseDto,
	UserPaginatedDto,
	UserResponseDto,
} from './dtos/user-response.dto';
import { ProblemStatus } from './problem_status/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';
import { User } from './user.entity';

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

	//-------------------------------------------------------
	// User Management
	//-------------------------------------------------------
	async findAll(query: PaginationMetaDto): Promise<UserPaginatedDto> {
		const users = await createPaginationQuery({
			repository: this.userRepository,
			dto: query,
		});
		const [data, totalItem] = await users.getManyAndCount();
		return new UserPaginatedDto(data, totalItem, query.page, query.limit);
	}

	async findOne(
		option: FindOneOptions<User>,
		throwError = false,
	): Promise<User> {
		const responseUser = await this.userRepository.findOne(option);
		if (!responseUser && throwError)
			throw new NotFoundException('User not found');

		return responseUser;
	}

	async getData(id: string) {
		return new UserFrontDataResponseDto(
			await this.userRepository.findOne({ where: { id } }),
		);
	}

	async search(query: UserQueryDto) {
		const {
			limit,
			page,
			email,
			name,
			orderByScore,
			house,
			role,
			studentId,
		} = query;
		const users = await createPaginationQuery({
			repository: this.userRepository,
			dto: { limit, page },
		});
		if (!!name)
			users.where('LOWER(entity.name) LIKE LOWER(:name)', {
				name: `%${name}%`,
			});

		if (!!email)
			users.andWhere('LOWER(entity.email) LIKE LOWER(:email)', {
				email: `%${email}%`,
			});

		if (orderByScore !== undefined) {
			users.orderBy('entity.score', orderByScore ? 'DESC' : 'ASC');
		}

		if (!!house) users.andWhere('entity.house  = :house', { house });

		if (!!studentId)
			users.andWhere('entity.studentId = :studentId', {
				studentId: `%${studentId}%`,
			});

		users.andWhere('entity.role = :role', { role });

		const [data, totalItem] = await users.getManyAndCount();
		return new UserPaginatedDto(data, totalItem, page, limit);
	}

	async generateHashedPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	}

	async create(user: CreateUserDto): Promise<UserResponseDto> {
		const existUser = await this.findOne(
			{
				where: { email: user.email },
			},
			false,
		);

		if (existUser) {
			throw new BadRequestException('User already exists');
		}

		if (user.password) {
			user.password = await this.generateHashedPassword(user.password);
		}

		try {
			return await this.userRepository.save(user);
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException('Error creating user');
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

		if (partialEntity.password) {
			partialEntity.password = await this.generateHashedPassword(
				String(partialEntity.password),
			);
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

	//-------------------------------------------------------
	// House Management
	//-------------------------------------------------------
	async getHouse(id: string): Promise<House> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');
		return user.house;
	}

	async findUsersByHouse(house: House): Promise<UserResponseDto[]> {
		const response = await this.userRepository.find({ where: { house } });
		return response.map((user) => new UserResponseDto(user));
	}

	//-------------------------------------------------------
	// Score Management
	//-------------------------------------------------------
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

	//-------------------------------------------------------
	// Problem Status Management
	//-------------------------------------------------------
	async findOneProblemStatus(
		userId: string,
		problemId: number,
		throwError = false,
	): Promise<ProblemStatus | null> {
		const problemStatus = await this.problemStatusRepository.findOne({
			where: { userId, problemId },
		});

		if (!problemStatus && throwError) {
			throw new NotFoundException(`Problem status not found`);
		}

		return problemStatus;
	}

	async setProblemStatus(
		problemId: number,
		userId: string,
	): Promise<ProblemStatus> {
		const userProblem = await this.findOneProblemStatus(
			userId,
			problemId,
		);
		userProblem.status = ProblemStatusEnum.IN_PROGRESS;
		await this.problemStatusRepository.save(userProblem);
		return userProblem;
	}

	async updateProblemStatus(
		problemId: number,
		userId: string,
		status: ProblemStatusEnum,
		code: string,
		difficulty: number,
	): Promise<void> {
		const userProblem = await this.problemStatusRepository.findOne({
			where: { userId, problemId },
		});
		if (!userProblem) {
			await this.problemStatusRepository.save({
				problemId,
				userId,
				code,
				status,
				lastSubmitted: new Date(),
			});
		} else {
			if (userProblem.status === ProblemStatusEnum.DONE) return;
			await this.problemStatusRepository.update(userProblem, {
				code,
				status,
				lastSubmitted: new Date(),
			});
		}
		if (status === ProblemStatusEnum.DONE) {
			//change this to actual logic to calculate score
			const score = 100 * difficulty;
			this.modifyScore(userId, score, userId);
		}
	}

	//-------------------------------------------------------
	// Problem Code Methods
	//-------------------------------------------------------

	async getCode(userId: string, problemId: number): Promise<string | null> {
		const problemStatus = await this.findOneProblemStatus(
			userId,
			problemId,
		);
		return problemStatus?.code || problemStatus?.problem.defaultCode;
	}

	async saveCode(
		userId: string,
		problemId: number,
		code: string,
	): Promise<void> {
		let problemStatus = await this.findOneProblemStatus(
			userId,
			problemId,
		);

		if (!problemStatus) {
			problemStatus = this.problemStatusRepository.create({
				userId,
				problemId,
				code,
				status: ProblemStatusEnum.IN_PROGRESS,
			});
		} else {
			problemStatus.code = code;
		}

		await this.problemStatusRepository.save(problemStatus);
	}
	//getCollectedItems
	async getCollectedItems(id:string){
		const user =await this.userRepository.findOne({where : { id }})
		if (!user){
			throw new NotFoundException('User not found');
		}
		const rewards = user.rewards
		return{ 
			success: true,
			message: 'Show rewards',
			data : rewards
		};
	}
}

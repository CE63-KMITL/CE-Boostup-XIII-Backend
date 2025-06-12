import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

import { ConfigService } from '@nestjs/config';
import { ProblemStatusEnum } from 'src/problem/enums/problem-staff-status.enum';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { House } from 'src/shared/enum/house.enum';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import {
	UserFrontDataResponseDto,
	UserPaginatedDto,
	UserResponseDto,
	UserScoreDataResponseDto,
	UserSearchPaginatedDto,
} from './dtos/user-response.dto';
import { ProblemStatus } from './problem_status/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';
import { User } from './user.entity';
import { HouseScore } from 'src/house_score/house_score.entity';
import { HouseScoreService } from 'src/house_score/house_score.service';
import { ProblemService } from 'src/problem/problem.service';

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
		@InjectRepository(HouseScore)
		private readonly HouseScoreRepo: Repository<HouseScore>,

		@Inject(forwardRef(() => HouseScoreService))
		private readonly houseScoreService: HouseScoreService,

		@Inject(forwardRef(() => ProblemService))
		private readonly problemService: ProblemService,
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
				isActive: true,
			});
		}
	}

	//-------------------------------------------------------
	// User Management
	//-------------------------------------------------------
	async findAll(
		query: PaginationMetaDto,
		pagination?: true,
	): Promise<UserPaginatedDto>;

	async findAll(
		query: FindManyOptions<User>,
		pagination: false,
	): Promise<User[]>;

	async findAll(
		query: PaginationMetaDto | FindManyOptions<User>,
		pagination = true,
	) {
		if (pagination) {
			query = query as PaginationMetaDto;
			const users = await createPaginationQuery({
				repository: this.userRepository,
				dto: query,
			});
			const [data, totalItem] = await users.getManyAndCount();
			return new UserPaginatedDto(
				data,
				totalItem,
				query.page,
				query.limit,
			);
		} else {
			query = query as FindManyOptions<User>;
			return await this.userRepository.find(query);
		}
	}

	async findOne(
		option: FindOneOptions<User>,
		throwError = true,
	): Promise<User> {
		const responseUser = await this.userRepository.findOne(option);
		if (responseUser) {
			responseUser.score = parseFloat(responseUser.score as any);
			return responseUser;
		} else {
			if (throwError) {
				throw new NotFoundException('User not found');
			}
			return null;
		}
	}

	//-------------------------------------------------------
	// User Front Data
	//-------------------------------------------------------

	async getData(id: string): Promise<UserFrontDataResponseDto> {
		const user = await this.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return new UserFrontDataResponseDto(user);
	}

	async getScoreData(id: string): Promise<UserScoreDataResponseDto> {
		const user = await this.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const searchResult = await this.search({
			limit: Number.MAX_SAFE_INTEGER,
			page: 1,
			orderByScore: true,
			role: null,
			email: null,
			name: null,
			house: null,
			studentId: null,
			searchText: null,
		});

		const rank =
			searchResult.data.findIndex((item) => item.id === user.id) + 1;

		const houseScoreResult = await this.houseScoreService.findOne(
			user.house,
		);

		const houseScore = houseScoreResult.data?.value ?? 0;

		const allHousesResult =
			await this.houseScoreService.findAllSorted('DESC');
		const allHouses = allHousesResult.data;
		const houseRank =
			allHouses.findIndex((h) => h.name === user.house) + 1;

		return new UserScoreDataResponseDto({
			user,
			rank,
			houseRank,
			houseScore,
		});
	}

	private async getPassedProblemsCountByDifficulty(
		userId: string,
	): Promise<Record<string, Record<string, number>>> {
		const solvedStatuses = await this.problemStatusRepository.find({
			where: {
				userId: userId,
				status: ProblemStatusEnum.DONE,
			},
			relations: ['problem'],
			order: {
				problem: {
					difficulty: 'DESC',
				},
			},
		});

		const difficultyGroups: Record<
			string,
			{ count: number; totalScore: number }
		> = {};

		for (const ps of solvedStatuses) {
			const difficulty = String(ps.problem.difficulty);
			if (!difficultyGroups[difficulty]) {
				difficultyGroups[difficulty] = { count: 0, totalScore: 0 };
			}
			difficultyGroups[difficulty].count++;
			difficultyGroups[difficulty].totalScore +=
				this.problemService.calScore(ps.problem.difficulty);
		}

		const passedCounts: Record<string, Record<string, number>> = {};
		Object.entries(difficultyGroups).sort(
			([a], [b]) => Number(b) - Number(a),
		);

		['5', '4', '3', '2', '1'].forEach((difficulty) => {
			if (!passedCounts[difficulty]) {
				passedCounts[difficulty] = {
					count: 0,
					totalScore: 0,
				};
			}
		});

		return passedCounts;
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
			searchText,
		} = query;

		const usersQuery = this.userRepository.createQueryBuilder('entity');

		if (!!searchText) {
			usersQuery.andWhere(
				'(LOWER(entity.name) LIKE LOWER(:searchText) OR LOWER(entity.email) LIKE LOWER(:searchText) OR CAST(entity.studentId AS TEXT) LIKE :searchText)',
				{ searchText: `%${searchText}%` },
			);
		} else {
			if (!!name)
				usersQuery.andWhere(
					'LOWER(entity.name) LIKE LOWER(:name)',
					{
						name: `%${name}%`,
					},
				);

			if (!!email)
				usersQuery.andWhere(
					'LOWER(entity.email) LIKE LOWER(:email)',
					{
						email: `%${email}%`,
					},
				);

			if (!!studentId)
				usersQuery.andWhere(
					'CAST(entity.studentId AS TEXT) LIKE :studentId',
					{
						studentId: `%${studentId}%`,
					},
				);
		}

		if (!!house) usersQuery.andWhere('entity.house = :house', { house });

		if (role === null || role === undefined) {
			usersQuery.andWhere('entity.role IN (:...roles)', {
				roles: [Role.MEMBER, Role.STAFF],
			});
		} else {
			usersQuery.andWhere('entity.role = :role', { role });
		}

		const usersRaw = await usersQuery.getMany();
		const totalItem = usersRaw.length;

		const userScores = await Promise.all(
			usersRaw.map(async (user) => {
				const problemScores =
					await this.getPassedProblemsCountByDifficulty(user.id);

				const totalProblemScore = Object.values(
					problemScores,
				).reduce((sum, scores) => sum + scores.totalScore, 0);

				user.score = totalProblemScore;

				const simplifiedScores: Record<string, number> = {};
				Object.entries(problemScores).forEach(
					([difficulty, data]) => {
						simplifiedScores[difficulty] = data.count;
					},
				);

				return {
					user,
					problemScores: simplifiedScores,
				};
			}),
		);

		if (orderByScore !== undefined) {
			userScores.sort((a, b) => {
				return orderByScore
					? b.user.score - a.user.score
					: a.user.score - b.user.score;
			});
		}

		const start = (page - 1) * limit;
		const end = start + limit;
		const paginatedUserScores = userScores.slice(start, end);

		const userResponseItems = paginatedUserScores.map(
			({ user, problemScores }) =>
				new UserResponseDto(user, problemScores),
		);

		return new UserSearchPaginatedDto(
			userResponseItems,
			totalItem,
			page,
			limit,
		);
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
		const user = await this.findOne({ where: { id } }, false);

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		await this.scoreLogRepository.delete({ user: { id } });
		await this.userRepository.delete(id);
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

	async updateHouseByEmail(
		email: string,
		house: House,
	): Promise<UserResponseDto> {
		if (!Object.values(House).includes(house)) {
			throw new BadRequestException(
				`House '${house}' is not a valid house.`,
			);
		}

		const user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			throw new NotFoundException(
				`User with email '${email}' not found`,
			);
		}

		user.house = house;
		const updatedUser = await this.userRepository.save(user);

		return new UserResponseDto(updatedUser);
	}

	async removeUserFromHouse(email: string): Promise<UserResponseDto> {
		const user = await this.userRepository.findOne({ where: { email } });
		if (!user) {
			throw new NotFoundException(
				`User with email '${email}' not found`,
			);
		}

		user.house = null;
		const updatedUser = await this.userRepository.save(user);

		return new UserResponseDto(updatedUser);
	}
	//-------------------------------------------------------
	// Score Management
	//-------------------------------------------------------
	async modifyScore(
		userId: string,
		amount: number,
		modifiedById: string,
		message: string,
	): Promise<UserResponseDto> {
		if (amount == 0) {
			throw new BadRequestException('amount must be a valid number');
		}

		amount = amount > 0 ? Math.ceil(amount) : Math.floor(amount);

		if (!message || message == '') {
			message = 'ไม่รู้อะแค่เปลี่ยนคะแนนเฉยๆ';
		}

		const user = await this.findOne({
			where: { id: userId },
		});
		const modifiedBy = await this.findOne({
			where: { id: modifiedById },
		});

		let oldUserScore = user.score;
		user.score += amount;
		if (user.score < 0) user.score = 0;
		amount = user.score - oldUserScore;

		const scoreLog = new ScoreLog();
		scoreLog.amount = amount;
		scoreLog.user = user;
		scoreLog.modifiedBy = modifiedBy;
		scoreLog.message = message;
		await this.scoreLogRepository.save(scoreLog);
		const response = await this.userRepository.save(user);

		if (user.role == Role.MEMBER && user.house) {
			const house = await this.HouseScoreRepo.findOneBy({
				name: user.house,
			});
			if (!house) throw new NotFoundException('House not found');

			house.value += amount;
			if (house.value < 0) {
				house.value = 0;
			}

			await this.HouseScoreRepo.update(
				{ name: user.house },
				{ value: house.value },
			);
		}

		return new UserResponseDto(response);
	}

	async getUserScoreLogs(id: string): Promise<ScoreLog[]> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['scoreLogs', 'scoreLogs.modifiedBy'],
			order: {
				scoreLogs: {
					date: 'DESC', // Sort by date descending (latest first)
				},
			},
		});

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
		status: ProblemStatusEnum,
	): Promise<void> {
		const userProblem = await this.findOneProblemStatus(
			userId,
			problemId,
		);
		userProblem.status = status;
		await this.problemStatusRepository.save(userProblem);
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
			relations: { problem: true },
		});
		if (!userProblem) {
			await this.problemStatusRepository.save({
				problemId,
				userId,
				code,
				status,
				lastSubmitted: new Date(),
			});
			if (status === ProblemStatusEnum.DONE) {
				const score = this.problemService.calScore(difficulty);
				this.modifyScore(
					userId,
					score,
					userId,
					`แก้โจทย์ ${problemId}. ${userProblem.problem.title}`,
				);
			}
		} else {
			await this.problemStatusRepository.update(
				{
					problemId: userProblem.problemId,
					userId: userProblem.userId,
				},
				{
					code,
					status:
						userProblem.status === ProblemStatusEnum.DONE
							? ProblemStatusEnum.DONE
							: status,
					lastSubmitted: new Date(),
				},
			);

			if (
				status === ProblemStatusEnum.DONE &&
				userProblem?.status !== ProblemStatusEnum.DONE
			) {
				const score = this.problemService.calScore(difficulty);
				this.modifyScore(
					userId,
					score,
					userId,
					`แก้โจทย์ ${problemId}. ${userProblem.problem.title}`,
				);
			}
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

		const problem = await this.problemService.findOne(problemId);
		return problemStatus?.code || problem.defaultCode;
	}

	async saveCode(userId: string, problemId: number, code: string) {
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

		return 'Success';
	}
}

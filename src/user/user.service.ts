import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { plainToInstance } from "class-transformer";
import { House } from "src/shared/enum/house.enum";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { ProblemStatusEnum } from "./score/problem-status.entity";
import { ScoreLog } from "./score/score-log.entity";
import { User } from "./user.entity";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		public readonly userRepository: Repository<User>,
		@InjectRepository(ScoreLog)
		private readonly scoreLogRepository: Repository<ScoreLog>
	) {}

	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.userRepository.find();
		return users.map((user) => plainToInstance(UserResponseDto, user));
	}
	async create(user: CreateUserDto): Promise<UserResponseDto> {
		try {
			// เข้ารหัส password ก่อน
			const salt = await bcrypt.genSalt(10); // หรือจะใช้ค่า default ก็ได้
			const hashedPassword = await bcrypt.hash(user.password, salt);

			// แทนที่ password เดิม
			user.password = hashedPassword;

			const responseUser = await this.userRepository.save(user);
			return plainToInstance(UserResponseDto, responseUser);
		} catch (error) {
			if (error instanceof Error) throw new BadRequestException("User already exists");
		}
	}

	async findOne(id: string): Promise<User> {
		if (!id) {
			throw new BadRequestException("ID is required");
		}
		const responseUser = await this.userRepository.findOne({ where: { id } });
		if (!responseUser) throw new NotFoundException("User not found");
		return responseUser;
	}

	async update(id: string, partialEntity: QueryDeepPartialEntity<User>): Promise<UserResponseDto> {
		if (partialEntity.score !== undefined) {
			const score = Number(partialEntity.score);
			if (isNaN(score) || score < 0) {
				throw new BadRequestException("Score must be a valid number >= 0");
			}
		}
		if (partialEntity.password !== undefined) {
			const salt = await bcrypt.genSalt(10); // หรือใช้ค่าที่ตั้งไว้ใน config
			const hashedPassword = await bcrypt.hash(partialEntity.password as string, salt);
			partialEntity.password = hashedPassword;
		}
		try {
			await this.userRepository.update(id, partialEntity);
			const responseUser = await this.userRepository.findOne({ where: { id } });

			if (!responseUser) {
				throw new NotFoundException("User not found");
			}

			return plainToInstance(UserResponseDto, responseUser);
		} catch (error) {
			throw new InternalServerErrorException("Error updating user");
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await this.userRepository.delete(id);
		} catch (error) {
			if (error instanceof Error) throw new NotFoundException("User not found");
		}
	}

	async getHouse(id: string): Promise<House> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException("User not found");
		return user.house;
	}

	async modifyScore(userId: string, amount: number, modifiedById: string): Promise<User> {
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

	async findEntityById(id: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	// async getuser_scorelogs(id: string): Promise<ScoreLog[]> {
	// 	const user = await this.userRepository.findOne({
	// 		where: { id },
	// 		relations: ["scoreLogs","scoreLogs.modifiedBy"],
	// 	});
	// 	if (!user || !user.scoreLogs) {
	// 		return [];
	// 	}
	// 	return user.scoreLogs;
	// }

	async getUserScoreLogs(id: string): Promise<ScoreLog[]> {
		const user = await this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.scoreLogs", "scoreLogs")
			.leftJoinAndSelect("scoreLogs.user", "scoreLogUser")
			.leftJoinAndSelect("scoreLogs.modifiedBy", "modifiedByUser")
			.select([
				"user.id",
				"scoreLogs.id",
				"scoreLogs.amount",
				"scoreLogs.date",
				"modifiedByUser.id",
				"modifiedByUser.name",
				// "modifiedByUser.studentId",
				// "modifiedByUser.icon",
			])
			.where("user.id = :id", { id })
			.getOne();

		if (!user || !user.scoreLogs) {
			return [];
		}
		return user.scoreLogs;
	}

	async findUsersByHouse(house: House): Promise<User[]> {
		return this.userRepository.find({ where: { house } });
	}

	async getProblemStatus(userId: string, problemId: number): Promise<ProblemStatusEnum> {
		const userWithProblemStatus = await this.userRepository.findOne({
			where: { id: userId, problemStatus: { problem: { id: problemId } } },
		});
		if (!userWithProblemStatus) {
			return ProblemStatusEnum.NOT_STARTED;
		}
		return userWithProblemStatus.problemStatus[0].status;
	}
}

import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { House } from "src/shared/enum/house.enum";
import { Role } from "src/shared/enum/role.enum";
import { Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { ScoreLog } from "./score/score-log.entity";
import { User } from "./user.entity";
import { HouseScore } from '../house_score/house_score.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		public readonly userRepository: Repository<User>,
		@InjectRepository(ScoreLog)
		private readonly scoreLogRepository: Repository<ScoreLog>,
		@InjectRepository(HouseScore)
		private readonly housescoreRepository: Repository<HouseScore>,
	) {}

	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.userRepository.find();
		return users.map((user) => plainToInstance(UserResponseDto, user));
	}
	async create(user: CreateUserDto): Promise<UserResponseDto> {
		try {
			const responseUser = await this.userRepository.save(user);
			return plainToInstance(UserResponseDto, responseUser);
		} catch (error) {
			if (error instanceof Error) throw new BadRequestException("User already exists");
		}
	}
	async findOne(id: string): Promise<UserResponseDto> {
		const responseUser = await this.userRepository.findOne({ where: { id } });
		if (!responseUser) throw new NotFoundException("User not found");
		return plainToInstance(UserResponseDto, responseUser);
	}
	async update(id: string, partialEntity: QueryDeepPartialEntity<User>): Promise<UserResponseDto> {
		if (partialEntity.score !== undefined) {
			const score = Number(partialEntity.score);
			if (isNaN(score) || score < 0) {
				throw new BadRequestException("Score must be a valid number >= 0");
			}
		}

		try {
			const oldUser = await this.userRepository.findOne({ where: { id } });
			const house = await this.housescoreRepository.findOne( { where: { id: oldUser.house } })
			house.total -= oldUser.score
			await this.userRepository.update(id, partialEntity);
			
			const responseUser = await this.userRepository.findOne({ where: { id } });
			house.total += responseUser.score
			await this.housescoreRepository.save(house)
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

	async get_house(id: string): Promise<House> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException("User not found");
		return user.house;
	}

	async modifyScore(userId: string, amount: number, modifiedById: string): Promise<User> {
		const user = await this.userRepository.findOneOrFail({
			where: { id: userId },
		});
		const result = await this.findEntityById(modifiedById);
		if (result.role !== Role.DEV) {
			throw new BadRequestException("Only dev can modify score");
		}
		const house = await this.housescoreRepository.findOne( { where: { id: user.house } });
		if (!house)throw new NotFoundException("house not found for user");
		user.score += amount;
		house.total +=amount;
		if (user.score < 0) user.score = 0;

		const scoreLog = new ScoreLog();
		scoreLog.amount = amount;
		scoreLog.user = user;
		scoreLog.modifiedBy = modifiedById;
		
		await this.scoreLogRepository.save(scoreLog);
		await this.housescoreRepository.save(house)

		return this.userRepository.save(user);
	}

	async findEntityById(id: string): Promise<User> {
		const user = await this.userRepository.findOne({ where: { id } });
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	async getuser_scorelogs(id: string): Promise<ScoreLog[]> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ["scoreLogs"],
		});
		if (!user || !user.scoreLogs) {
			return [];
		}
		return user.scoreLogs;
	}

	async findUsersByHouse(house: House): Promise<User[]> {
		return this.userRepository.find({ where: { house } });
	}
}

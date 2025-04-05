import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "./dtos/user-response.dto";
import { ScoreLog } from "./score-log.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "src/shared/enum/role.enum";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ScoreLog)
    private readonly scoreLogRepository: Repository<ScoreLog>,
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
      if (error instanceof Error)
        throw new BadRequestException("User already exists");
    }
  }
  async findOne(id: string): Promise<UserResponseDto> {
    const responseUser = await this.userRepository.findOne({ where: { id } });
    if (!responseUser) throw new NotFoundException("User not found");
    return plainToInstance(UserResponseDto, responseUser);
  }
  async update(
    id: string,
    partialEntity: QueryDeepPartialEntity<User>
  ): Promise<UserResponseDto> {
    if (partialEntity.score !== undefined) {
      const score = Number(partialEntity.score);
      if (isNaN(score) || score < 0) {
        throw new BadRequestException("Score must be a valid number >= 0");
      }
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

  async modifyScore(
    userId: string,
    amount: number,
    modifiedById: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneOrFail({ 
      where: { id: userId },
    });
      const result = await this.findEntityById(modifiedById);
      if (result.role !== Role.DEV){
        throw new BadRequestException("Only dev can modify score");
      }

    user.score += amount;
    if (user.score < 0) user.score = 0;

    const scoreLog = new ScoreLog();
    scoreLog.amount = amount;
    scoreLog.user = user;
    scoreLog.modifiedBy = modifiedById;
    
    await this.scoreLogRepository.save(scoreLog);

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
      relations: ['scoreLogs'], 
    });
    if (!user || !user.scoreLogs) {
      return []; 
    }
    return user.scoreLogs; 
  }

  

}


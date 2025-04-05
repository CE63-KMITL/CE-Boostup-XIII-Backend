import {
  BadRequestException,
  Inject,
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

@Injectable()
export class UserService {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: Repository<User>
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
}

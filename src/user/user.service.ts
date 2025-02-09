import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
   constructor(
      @Inject('UserRepository')
      private readonly userRepository: Repository<User>,
   ) {}
   async findAll(): Promise<User[]> {
      return await this.userRepository.find();
   }
   async create(user: CreateUserDto): Promise<User> {
      return await this.userRepository.save(user);
   }
}

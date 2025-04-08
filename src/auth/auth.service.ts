import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import {Auth} from './entities/auth.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/user.entity';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(email: string , password: string) {
  //   return `This action returns a #${email} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  async validateUser(email:string,password:string){
    const check_email = await this.userRepository.findOne({where:{email}})
    console.log(check_email)
    if(!check_email){
      console.log("Not found user")
      return null
    }
    const Password_compare = await bcrypt.compare(password,check_email.password);
    return Password_compare ? check_email : null
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
    const token = jwt.sign(
      { user_id: user.id, email },
      GLOBAL_CONFIG.TOKEN_KEY,
      { expiresIn: "1d" }
    );
  
    // return token + user info
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name // ถ้ามี field อื่นเพิ่มก็ใส่ไปได้
      }
    };
  }
  
  // async forgetpassword(email:string){
  // }
  
}

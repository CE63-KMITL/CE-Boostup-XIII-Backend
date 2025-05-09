import {
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseScore } from './house_score.entity';
import { House } from 'src/shared/enum/house.enum';
import { User } from 'src/user/user.entity';

@Injectable()
export class HouseScoreService implements OnModuleInit {
	constructor(
		@InjectRepository(HouseScore)
		private readonly houseRepository: Repository<HouseScore>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async onModuleInit() {
		const house = Object.values(House);
		const res = await this.houseRepository.count();
		if (res !== 0) return;
		for (let i = 0; i < house.length; i++) {
			await this.houseRepository.save({ name: house[i] });
		}
	}

	// สร้างคะแนนใหม่
	async create(name: string, value: number) {
		const existingScore = await this.houseRepository.findOne({
			where: { name },
		});

		if (existingScore) {
			console.log(`${name} group already exists. Creation failed.`);
			throw new HttpException(
				{ status: false, message: `${name} group already exists` },
				HttpStatus.BAD_REQUEST,
			);
		}

		const score = new HouseScore();
		score.name = name;
		score.value = value;

		try {
			const savedScore = await this.houseRepository.save(score);
			return {
				success: true,
				message: 'Score created successfully',
				data: savedScore,
			};
		} catch (error) {
			console.error('Error creating score:', error);
			throw new HttpException(
				{ success: false, message: 'Failed to create score' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// ปรับคะแนน
	async changeScore(name: String, value: number) {
		const house = await this.houseRepository.findOneBy({ name: name });
		if (!house) throw new NotFoundException('Group not found');

		const amount = value - house.value;

		const users = await this.userRepository.find({
			where: { house: house.name as House },
		});
		if (users.length === 0) return;

		const perUser = Math.floor(amount / users.length);

		for (const user of users) {
			user.score += perUser;
		}

		await this.userRepository.save(users);

		house.value = value;
		await this.houseRepository.save(house);

		return {
			success: true,
			message: `${house.name} score updated to ${value}`,
			perUserEffect: perUser,
		};
	}

	// ค้นหาคะแนนของเเต่ละบ้าน
	async findOne(name: string) {
		const score = await this.houseRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		return {
			success: true,
			message: 'Score found successfully',
			data: score,
		};
	}

	// ค้นหาคะแนนบ้านทั้งหมด
	async findAll() {
		const scores = await this.houseRepository.find();
		return {
			success: true,
			message: 'All scores fetched successfully',
			data: scores,
		};
	}

	// ค้นหาคะแนนทั้งหมดและจัดเรียงตามคำสั่ง ASC DESC
	async findAllSorted(order: 'ASC' | 'DESC') {
		const scores = await this.houseRepository.find({
			order: { value: order },
		});
		return {
			success: true,
			message: 'All scores fetched successfully',
			data: scores,
		};
	}

	// ลบคะแนน
	async remove(name: string) {
		const score = await this.houseRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		await this.houseRepository.remove(score);
		console.log(`Score removed for ${name} group`);
		return { success: true, message: 'Score removed successfully' };
	}

	async adjustHouseValue(name: string, amount: number) {
		const house = await this.houseRepository.findOneBy({ name });
		if (!house) throw new NotFoundException('House not found');

		const users = await this.userRepository.find({
			where: { house: name as House },
		});
		if (users.length === 0) return;

		const perUser = Math.floor(amount / users.length);

		for (const user of users) {
			user.score += perUser;
			if (user.score < 0) {
				user.score = 0;
			}
		}
		await this.userRepository.save(users);

		house.value += amount;
		if (house.value < 0) {
			house.value = 0;
		}
		await this.houseRepository.save(house);

		return {
			message:
				amount >= 0
					? `เพิ่มคะแนนกลุ่ม ${name}`
					: `ลดคะแนนกลุ่ม ${name}`,
			totalChange: amount,
			perUserEffect: perUser,
			newHouseScore: house.value,
		};
	}
}

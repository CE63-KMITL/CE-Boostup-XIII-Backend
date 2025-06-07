import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseScore } from './house_score.entity';
import { House } from 'src/shared/enum/house.enum';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/shared/enum/role.enum';

@Injectable()
export class HouseScoreService implements OnModuleInit {
	constructor(
		@InjectRepository(HouseScore)
		private readonly houseRepository: Repository<HouseScore>,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
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
	async setScore(name: string, value: number) {
		const house = await this.houseRepository.findOneBy({ name: name });
		if (!house) throw new NotFoundException('Group not found');

		const amount = value - house.value;

		return await this.changeScore(name, amount);
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

	async changeScore(name: string, amount: number) {
		const house = await this.houseRepository.findOneBy({ name });
		if (!house) throw new NotFoundException('House not found');

		const users = await this.userService.findAll(
			{
				where: {
					house: house.name as House,
					isActive: true,
					role: Role.MEMBER,
				},
			},
			false,
		);

		if (users.length === 0)
			throw new NotFoundException('No one in this house');

		const perUser =
			amount >= 0
				? Math.floor(amount / users.length)
				: Math.ceil(amount / users.length);

		for (const user of users) {
			await this.userService.modifyScore(
				user.id,
				perUser,
				user.id,
				`แก้ไขคะแนนบ้าน : ${name}`,
			);
		}

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

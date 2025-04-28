import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseScore } from './house_score.entity';

@Injectable()
export class HouseScoreService {
	constructor(
		@InjectRepository(HouseScore)
		private readonly scoreRepository: Repository<HouseScore>,
	) {}

	// สร้างคะแนนใหม่
	async create(name: string, value: number) {
		const existingScore = await this.scoreRepository.findOne({
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
			const savedScore = await this.scoreRepository.save(score);
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

	// เพิ่มคะแนน
	async addScore(name: String, value: number) {
		const score = await this.scoreRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		score.value += value;

		try {
			const updatedScore = await this.scoreRepository.save(score);
			return {
				success: true,
				message: 'Score updated successfully',
				data: updatedScore,
			};
		} catch (error) {
			console.error('Error adding score:', error);
			throw new HttpException(
				{ success: false, message: 'Failed to add score' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// ปรับคะแนน
	async changeScore(name: String, value: number) {
		const score = await this.scoreRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		score.value = value;

		try {
			const updatedScore = await this.scoreRepository.save(score);
			return {
				success: true,
				message: 'Score updated successfully',
				data: updatedScore,
			};
		} catch (error) {
			console.error('Error adding score:', error);
			throw new HttpException(
				{ success: false, message: 'Failed to add score' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// ลดคะแนน
	async subtractScore(name: string, value: number) {
		const score = await this.scoreRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		// ตรวจสอบว่าคะแนนหลังจากการลดแล้วไม่ต่ำกว่า 0
		if (score.value - value < 0) {
			console.log(
				`Cannot subtract from ${name} group as it would result in negative score`,
			);
			throw new HttpException(
				{
					success: false,
					message: 'Cannot subtract score, it will result in a negative value',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		score.value -= value;

		try {
			const updatedScore = await this.scoreRepository.save(score);
			return {
				success: true,
				message: 'Score subtracted successfully',
				data: updatedScore,
			};
		} catch (error) {
			console.error('Error subtracting score:', error);
			throw new HttpException(
				{ success: false, message: 'Failed to subtract score' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// ค้นหาคะแนนของเเต่ละบ้าน
	async findOne(name: string) {
		const score = await this.scoreRepository.findOne({ where: { name } });

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
		const scores = await this.scoreRepository.find();
		return {
			success: true,
			message: 'All scores fetched successfully',
			data: scores,
		};
	}

	// ค้นหาคะแนนทั้งหมดและจัดเรียงตามคำสั่ง ASC DESC
	async findAllSorted(order: 'ASC' | 'DESC') {
		const scores = await this.scoreRepository.find({
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
		const score = await this.scoreRepository.findOne({ where: { name } });

		if (!score) {
			console.log(`Score not found for ${name} group`);
			throw new HttpException(
				{ success: false, message: 'Score not found' },
				HttpStatus.NOT_FOUND,
			);
		}

		await this.scoreRepository.remove(score);
		console.log(`Score removed for ${name} group`);
		return { success: true, message: 'Score removed successfully' };
	}

	async update(name: string, value: number) {
		try {
			const score = await this.scoreRepository.findOne({
				where: { name },
			});
			if (!score)
				throw new HttpException(
					{ success: false, message: 'Score not found' },
					HttpStatus.NOT_FOUND,
				);

			score.value = value;
			await this.scoreRepository.save(score);
			return {
				success: true,
				message: 'Score updated successfully',
				score,
			};
		} catch (error) {
			throw new HttpException(
				{ success: false, message: 'Failed to update score' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

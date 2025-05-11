import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { UserService } from '../user/user.service';

@Injectable()
export class CSVService {
	constructor(private readonly userService: UserService) {}

	// อ่านไฟล์ CSV และแปลงเป็น array ของ object
	async parseCSVFile(filePath: string): Promise<any[]> {
		const results = [];
		return new Promise((resolve, reject) => {
			fs.createReadStream(filePath)
				.pipe(csvParser())
				.on('data', (data) => results.push(data))
				.on('end', () => resolve(results))
				.on('error', (error) => reject(error));
		});
	}

	// แปลงข้อมูล CSV เป็นข้อมูล user ที่พร้อมใช้
	async convertToUserAccounts(csvData: any[]): Promise<any[]> {
		return csvData.map((row) => ({
			name: row.name,
			email: `${row.studentId}@example.com`,
			house: row.house,
			// สามารถเพิ่ม password random ได้ เช่น:
			// password: Math.random().toString(36).slice(-8)
		}));
	}

	// อ่านจากไฟล์ แล้วสร้าง users ทีละคน
	async createUsersFromCSV(filePath: string): Promise<any[]> {
		const csvData = await this.parseCSVFile(filePath);
		const userAccounts = await this.convertToUserAccounts(csvData);

		const createdUsers = [];
		for (const user of userAccounts) {
			try {
				const created = await this.userService.create(user);
				createdUsers.push(created);
			} catch (error) {
				console.error(
					`Error creating user ${user.email}:`,
					error.message,
				);
				// จะข้ามคนที่สร้างไม่สำเร็จ แล้วไปสร้างคนต่อไป
			}
		}
		return createdUsers;
	}
}

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { UserService } from '../user/user.service';
import * as iconv from 'iconv-lite';

@Injectable()
export class CSVService {
	constructor(private readonly userService: UserService) {}

	async parseCSVFile(filePath: string): Promise<any[]> {
		const results = [];
		return new Promise((resolve, reject) => {
			fs.createReadStream(filePath)
				.pipe(iconv.decodeStream('win874')) // รองรับภาษาไทยจาก Excel
				.pipe(csvParser())
				.on('data', (data) => results.push(data))
				.on('end', () => resolve(results))
				.on('error', (error) => reject(error));
		});
	}

	async convertToUserAccounts(csvData: any[]): Promise<any[]> {
		return csvData.map((row) => ({
			name: row.name,
			email: `${row.studentId}@example.com`,
			house: row.house,
			role: row.role,
		}));
	}

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
			}
		}
		return createdUsers;
	}
}

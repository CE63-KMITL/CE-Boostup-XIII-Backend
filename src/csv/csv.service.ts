import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import * as iconv from 'iconv-lite';
import * as xlsx from 'xlsx';
import { UserService } from '../user/user.service';
import { Role } from 'src/shared/enum/role.enum';

@Injectable()
export class CSVService {
	constructor(private readonly userService: UserService) {}

	private parseCSV(filePath: string): Promise<any[]> {
		const results = [];
		return new Promise((resolve, reject) => {
			fs.createReadStream(filePath)
				.pipe(iconv.decodeStream('win874')) // รองรับภาษาไทย
				.pipe(csvParser())
				.on('data', (data) => results.push(data))
				.on('end', () => resolve(results))
				.on('error', (err) => reject(err));
		});
	}

	private parseXLSX(filePath: string): any[] {
		const workbook = xlsx.readFile(filePath);
		const allData: any[] = [];

		for (const sheetName of workbook.SheetNames) {
			const worksheet = workbook.Sheets[sheetName];
			const sheetData =
				xlsx.utils.sheet_to_json<Record<string, any>>(worksheet);

			const withHouse = sheetData.map((row) => ({
				...row,
				house: sheetName.toLowerCase(),
			}));

			allData.push(...withHouse);
		}

		return allData;
	}

	private async parseFile(filePath: string): Promise<any[]> {
		const ext = path.extname(filePath).toLowerCase();
		if (ext === '.csv') {
			return this.parseCSV(filePath);
		} else if (ext === '.xlsx') {
			return this.parseXLSX(filePath);
		} else {
			throw new Error('Unsupported file format');
		}
	}

	private convertToUserAccounts_senior(data: any[]): any[] {
		return data.map((row) => ({
			name: row['ชื่อเล่น'],
			email: `${row['เลขนศ']}@senior1.com`,
			house: row.house,
			role: 'staff',
		}));
	}

	async createUsersFromFile(filePath: string): Promise<any[]> {
		const rawData = await this.parseFile(filePath);
		const userAccounts = this.convertToUserAccounts_senior(rawData);

		const createdUsers = [];
		for (const user of userAccounts) {
			try {
				const created = await this.userService.create(user);
				createdUsers.push(created);
			} catch (error) {
				console.error(`Error creating user ${user.email}:`);
			}
		}
		return createdUsers;
	}

	async createJuniorMembersFromXLSX(filePath: string): Promise<any[]> {
		const workbook = xlsx.readFile(filePath);
		const sheet = workbook.Sheets['Register1'];

		if (!sheet) {
			throw new Error('Sheet "Register1" not found in file.');
		}

		const sheetData =
			xlsx.utils.sheet_to_json<Record<string, any>>(sheet);
		const users = sheetData.map((row) => ({
			name: row['ชื่อเล่น'] || row['name'],
			email: row['Email'],
			role: Role.MEMBER,
		}));

		const created = [];
		for (const user of users) {
			try {
				const createdUser = await this.userService.create(user);
				created.push(createdUser);
			} catch (error) {
				console.error(
					`Failed to create ${user.email}:`,
					error.message,
				);
			}
		}
		return created;
	}
}

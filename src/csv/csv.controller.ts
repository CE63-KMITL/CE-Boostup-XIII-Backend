import {
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CSVService } from './csv.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class CSVController {
	constructor(private readonly csvService: CSVService) {}

	@Post('senior')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix =
						Date.now() +
						'-' +
						Math.round(Math.random() * 1e9);
					cb(
						null,
						`${uniqueSuffix}${extname(file.originalname)}`,
					);
				},
			}),
		}),
	)
	async uploadCSV_older(@UploadedFile() file: Express.Multer.File) {
		return this.csvService.createUsersFromFile(file.path);
	}

	@Post('junior')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const uniqueSuffix =
						Date.now() +
						'-' +
						Math.round(Math.random() * 1e9);
					cb(
						null,
						`${uniqueSuffix}${extname(file.originalname)}`,
					);
				},
			}),
		}),
	)
	async uploadCSV_younger(@UploadedFile() file: Express.Multer.File) {
		return this.csvService.createJuniorMembersFromXLSX(file.path);
	}
}

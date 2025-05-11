import { Module } from '@nestjs/common';
import { CSVService } from './csv.service';
import { CSVController } from './csv.controller';
import { UserModule } from '../user/user.module'; // ต้อง import เพื่อใช้ UserService

@Module({
	imports: [UserModule],
	controllers: [CSVController],
	providers: [CSVService],
})
export class CSVModule {}

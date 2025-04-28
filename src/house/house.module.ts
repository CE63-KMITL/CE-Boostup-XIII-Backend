import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { HouseController } from './house.controller';
import { HouseService } from './house.service';

@Module({
	imports: [UserModule],
	controllers: [HouseController],
	providers: [HouseService],
	exports: [HouseService],
})
export class HouseModule {}

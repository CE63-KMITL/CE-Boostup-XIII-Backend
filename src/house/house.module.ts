import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module"; // Import UserModule
import { HouseController } from "./house.controller";
import { HouseService } from "./house.service";

@Module({
	imports: [UserModule], // Add UserModule here
	controllers: [HouseController],
	providers: [HouseService],
	exports: [HouseService],
})
export class HouseModule {}

import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	Home_Page(): string {
		return "คุณไม่ควรมาอยู่ตรงนี้นะ";
	}
}

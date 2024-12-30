declare module "Data" {
	/**
	 * ข้อมูลของ User แต่ละคน ไม่ว่าจะเป็น Member(คนทั่วไป), Admin หรือ Dev
	 */
	export type User = {
		ID: string;

		Name: string;
		Role: "Member" | "Admin" | "Dev";

		Email: string;
		Password: string;
	};

	/**
	 * โจทย์
	 * @ Published (เผยแผร่แล้ว)
	 * @ Needs Review (ต้องการการตรวจสอบ)
	 * @ Rejected (ไม่อนุมัติไป ทำใหม่ / แก้ไข)
	 */
	export type Problem = {
		ID: string;

		Title: string;
		Author: User;
		Description?: string;

		Default_Code?: string;
		Difficulty: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
		Tags?: string[];

		Status?: "Done" | "In Progress";
		Dev_Status?: "Published" | "Needs Review" | "Rejected";
	};
}

declare module "Data/Server" {
	import { Problem, User } from "Data";

	export type Users = User[];
	export type Problems = Problem[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { House } from 'src/shared/enum/house.enum';
import { Role } from '../../shared/enum/role.enum';
import { User } from '../user.entity';
import { PaginatedResponseDto } from 'src/shared/pagination/dto/paginated-response.dto';
import { Filter } from 'src/shared/dto.extension';

export class UserResponseDto {
	@ApiProperty({
		example: 'f789f66d-8e8e-4df0-9d12-c6aeaf930ce6',
		description: 'User uuid',
		type: String,
	})
	id: string;

	@ApiProperty({
		example: 'john_doe',
		description: 'name',
		type: String,
	})
	name: string;

	@ApiProperty({
		example: 'example@gmail.com',
		description: 'Email',
		type: String,
	})
	email: string;

	@ApiProperty({
		example: House.BARBARIAN,
		description: 'User house',
		enum: House,
	})
	house: House;

	@ApiProperty({
		example: Role.MEMBER,
		description: 'User role',
		enum: Role,
	})
	role: Role;

	@ApiProperty({
		example: 0,
		description: 'User score',
		type: Number,
	})
	score: number;

	@ApiPropertyOptional({
		example: '67011501',
		description: 'student id',
		type: String,
	})
	studentId?: string;

	@ApiPropertyOptional({
		example: '/9j/4AAQSkZJRgABAQEASABIAA',
		description: 'icon as base64',
		type: String,
	})
	icon?: string;

	@ApiProperty({
		example: '2021-09-29T13:43:18.000Z',
		description: 'User creation date',
		type: Date,
	})
	createdAt: Date;

	@ApiProperty({
		example: '2021-09-29T13:43:18.000Z',
		description: 'User update date',
		type: Date,
	})
	updatedAt: Date;

	constructor(user: User) {
		this.id = user.id;
		this.name = user.name;
		this.email = user.email;
		this.house = user.house;
		this.role = user.role;
		this.score = user.score;
		this.studentId = user.studentId;
		this.icon = user.icon;
		this.createdAt = user.createdAt;
		this.updatedAt = user.updatedAt;
	}
}

export class UserPaginatedDto extends PaginatedResponseDto(UserResponseDto) {
	constructor(
		users: User[],
		totalItem: number,
		page: number,
		limit: number,
	) {
		const usersResponse = users.map((user) => new UserResponseDto(user));
		super(usersResponse, totalItem, page, limit);
	}
}

//-------------------------------------------------------
// User Front Data Response DTO (Filtered Basic Data)
//-------------------------------------------------------
export class UserFrontDataResponseDto extends Filter(UserResponseDto, [
	'id',
	'role',
	'icon',
	'name',
	'studentId',
	'house',
]) {}

//-------------------------------------------------------
// User Score Data Response DTO (Includes Rank and House Info)
//-------------------------------------------------------
export class UserScoreDataResponseDto extends Filter(UserResponseDto, [
	'id',
	'role',
	'icon',
	'name',
	'studentId',
	'house',
	'score',
	'email',
]) {
	@ApiProperty({ description: 'User rank among all users' })
	rank: number;

	@ApiProperty({ description: "Rank of the user's house based on score" })
	houseRank: number;

	@ApiProperty({ description: "Total score of the user's house" })
	houseScore: number;

	constructor(data: {
		user: User;
		rank: number;
		houseRank: number;
		houseScore: number;
	}) {
		super(data.user);
		this.rank = data.rank;
		this.houseRank = data.houseRank;
		this.houseScore = data.houseScore;
	}
}

export class UserSmallResponseDto extends Filter(UserResponseDto, [
	'name',
	'icon',
]) {}

export class UserMediumResponseDto extends Filter(UserResponseDto, [
	'id',
	'name',
	'icon',
]) {}

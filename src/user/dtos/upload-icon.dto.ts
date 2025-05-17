//-------------------------------------------------------
// Upload Icon DTO
//-------------------------------------------------------
import { IsString, MaxLength } from 'class-validator';

export class UploadIconDto {
	@IsString()
	@MaxLength(50000)
	iconBase64: string;
}

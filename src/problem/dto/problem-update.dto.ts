import { CreateProblemDto } from './problem-create.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateProblemDto extends OmitType(CreateProblemDto, [
	'testCases',
]) {}

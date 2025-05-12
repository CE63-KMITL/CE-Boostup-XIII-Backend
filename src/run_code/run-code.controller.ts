import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	RunCodeRequestDto,
	RunCodeTestCasesRequestDto,
} from './dtos/run-code-request.dto';
import { RunCodeService } from './run-code.service';
import { RunCodeResponseDto } from './dtos/run-code-response.dto';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_RUNCODE } from 'src/shared/configs/throttle.config';

@Controller('run-code')
@ApiTags('Run Code')
export class RunCodeController {
	constructor(private readonly runCodeService: RunCodeService) {}

	@Post()
	@ApiOperation({ summary: 'Run code with input' })
	@ApiResponse({
		status: 200,
		description: 'Code executed successfully',
		type: RunCodeResponseDto,
	})
	@AllowRole(Role.MEMBER)
	@Throttle({
		THROTTLE_RUNCODE,
	})
	runCode(@Body() body: RunCodeRequestDto): Promise<RunCodeResponseDto> {
		return this.runCodeService.runCode(body);
	}

	@Post('/test-cases')
	@ApiOperation({ summary: 'Run code with input' })
	@ApiResponse({
		status: 200,
		description: 'Code executed successfully',
		type: RunCodeResponseDto,
		isArray: true,
	})
	@AllowRole(Role.STAFF)
	@Throttle({
		THROTTLE_RUNCODE,
	})
	runCodeTestCases(
		@Body() body: RunCodeTestCasesRequestDto,
	): Promise<RunCodeResponseDto[]> {
		return this.runCodeService.runCodeMultipleInputs(body);
	}
}

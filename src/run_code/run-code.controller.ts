import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RunCodeRequestDto } from './dtos/run-code-request.dto';
import { RunCodeService } from './run-code.service';
import { RunCodeResponseDto } from './dtos/run-code-response.dto';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';

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
	runCode(@Body() body: RunCodeRequestDto): Promise<RunCodeResponseDto> {
		console.log(body);
		return this.runCodeService.runCode(
			body.input,
			body.code,
			body.timeout,
		);
	}
}

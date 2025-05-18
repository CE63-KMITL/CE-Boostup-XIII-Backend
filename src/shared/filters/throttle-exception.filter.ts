import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottleExceptionFilter implements ExceptionFilter {
	catch(exception: ThrottlerException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		response.status(HttpStatus.TOO_MANY_REQUESTS).json({
			statusCode: HttpStatus.TOO_MANY_REQUESTS,
			message: exception.message,
			error: 'Too Many Requests',
		});
	}
}

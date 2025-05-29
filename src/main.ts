import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import { ThrottleExceptionFilter } from './shared/filters/throttle-exception.filter';

async function bootstrap() {
	const configService = new ConfigService();

	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	if (!process.env.FRONT_HOST || process.env.FRONT_HOST == '')
		process.env.FRONT_HOST =
			'http://localhost:3001 http://localhost:3003';

	console.log('Allowed', process.env.FRONT_HOST);

	app.enableCors({
		origin: process.env.FRONT_HOST.split(' ').filter(
			(origin) => origin.length > 0,
		),
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		allowedHeaders: 'Content-Type, Accept, Authorization',
		credentials: true,
	});

	app.set('trust proxy', true);

	const config = new DocumentBuilder()
		.setTitle('CE-Boostup-XIII-Backend (API)')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				in: 'header',
			},
			'access-token',
		)
		.build();

	//-------------------------------------------------------
	// Swagger Docs Authentication Middleware
	//-------------------------------------------------------
	const swaggerAuthMiddleware = (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
		const ADMIN_PASS = process.env.ADMIN_PASS;

		if (!ADMIN_EMAIL || !ADMIN_PASS) {
			console.error(
				'Error: ADMIN_EMAIL or ADMIN_PASS not set in environment variables for /docs route.',
			);
			return;
		}

		const authHeader = req.headers.authorization;
		const [authType, encodedCredentials] = authHeader.split(' ');

		let decodedCredentials;
		try {
			decodedCredentials = Buffer.from(
				encodedCredentials,
				'base64',
			).toString();
		} catch (error) {
			console.error(
				'Error decoding base64 credentials for /docs:',
				error,
			);
			res.status(404).send('Not Found');
			return;
		}

		const [username, password] = decodedCredentials.split(':', 2);

		if (username === ADMIN_EMAIL && password === ADMIN_PASS) {
			next();
		} else {
			res.status(404).send('Not Found');
		}
	};

	app.use(['/docs', '/docs-json', '/docs-yaml'], swaggerAuthMiddleware);

	const documentFactory = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, documentFactory);

	app.useGlobalPipes(
		new ValidationPipe({
			disableErrorMessages: !configService.getOrThrow<boolean>(
				GLOBAL_CONFIG.IS_DEVELOPMENT,
			),
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	app.useGlobalFilters(new ThrottleExceptionFilter());
	await app.listen(configService.get<string>(GLOBAL_CONFIG.PORT) ?? 3000);
}
bootstrap();

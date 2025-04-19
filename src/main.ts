import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { GLOBAL_CONFIG } from "./shared/constants/global-config.constant";

async function bootstrap() {
	const configService = new ConfigService();

	const app = await NestFactory.create(AppModule);

	if (process.env.FRONT_HOST == "") process.env.FRONT_HOST = "http://localhost:3001 http://localhost:3003";

	console.log(process.env.FRONT_HOST);

	app.enableCors({
		origin: process.env.FRONT_HOST.split(" ").filter((origin) => origin.length > 0),
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		allowedHeaders: "Content-Type, Accept, Authorization",
		credentials: true,
	});

	const config = new DocumentBuilder()
		.setTitle("boost up api")
		.setDescription("This is the api for the boost up app")
		.setVersion("1.0")
		.build();

	const documentFactory = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, documentFactory);
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(configService.get<string>(GLOBAL_CONFIG.PORT) ?? 3000);
}
bootstrap();

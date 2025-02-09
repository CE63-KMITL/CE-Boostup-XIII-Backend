import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
   const configService = new ConfigService();

   const app = await NestFactory.create(AppModule);

   const config = new DocumentBuilder()
      .setTitle('boost up api')
      .setDescription('This is the api for the boost up app')
      .setVersion('1.0')
      .build();
   const documentFactory = SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('docs', app, documentFactory);
   await app.listen(configService.get<string>(GLOBAL_CONFIG.PORT) ?? 3000);
}
bootstrap();

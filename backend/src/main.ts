import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/common/filters/all-exceptions.filter';
import { setupSwagger } from './shared/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Shutdown hooks
  app.enableShutdownHooks();

  // Swagger Setup (Must be after global prefix/pipes/filters)
  setupSwagger(app, configService);

  const port = configService.get<number>('PORT') || 3001;
  const env = configService.get<string>('NODE_ENV') || 'development';
  
  await app.listen(port);
  
  Logger.log(`====================================================`);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  Logger.log(`🌱 Environment: ${env}`);
  Logger.log(`====================================================`);
}
bootstrap();

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/common/filters/all-exceptions.filter';
import { setupSwagger } from './shared/config/swagger.config';
import { AppConfig } from './shared/config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<AppConfig, true>);

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
  app.useGlobalFilters(new AllExceptionsFilter(configService as unknown as ConfigService));

  // CORS — never use bare '*' with credentials; reflect request origin instead
  const env = configService.get('env', { infer: true }) || 'development';
  const rawOrigin = configService.get('cors.origin', { infer: true }) || '*';

  if (env === 'production' && rawOrigin === '*') {
    Logger.warn(
      'CORS_ORIGIN=* in production is unsafe with credentials. Set an explicit origin list.',
    );
  }

  app.enableCors({
    origin: rawOrigin === '*' ? true : rawOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Shutdown hooks
  app.enableShutdownHooks();

  // Swagger Setup (after global prefix/pipes/filters)
  setupSwagger(app, configService);

  const port = configService.get('port', { infer: true }) || 3000;

  await app.listen(port);

  Logger.log(`====================================================`);
  Logger.log(`Application is running on: http://localhost:${port}/api`);
  Logger.log(`Environment: ${env}`);
  Logger.log(`====================================================`);
}
bootstrap();

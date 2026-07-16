import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './configuration';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService<AppConfig, true>,
): void {
  const env = configService.get('env', { infer: true }) || 'development';
  const swaggerEnabled = configService.get('swagger.enabled', { infer: true }) !== false;

  // Only enable Swagger in development or when explicitly allowed via ENABLE_SWAGGER
  if (env !== 'development' && !swaggerEnabled) {
    return;
  }

  if (env === 'development' && process.env.ENABLE_SWAGGER === 'false') {
    return;
  }

  const options = new DocumentBuilder()
    .setTitle('LiquidNetwork API')
    .setDescription('Backend API for LiquidNetwork')
    .setVersion('1.0')
    .setContact('LiquidNetwork Team', 'https://liquidnetwork.app', 'support@liquidnetwork.app')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'LiquidNetwork API Documentation',
  });
}

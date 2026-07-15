import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
  const env = configService.get<string>('NODE_ENV') || 'development';
  const enableSwagger = configService.get<string>('ENABLE_SWAGGER') === 'true';

  // Only enable Swagger in development environment or when explicitly allowed
  if (env !== 'development' && !enableSwagger) {
    return;
  }

  const options = new DocumentBuilder()
    .setTitle('DrunkSocial API')
    .setDescription('Backend API for DrunkSocial - Vietnamese Drinking Social Super App')
    .setVersion('1.0')
    .setContact('DrunkSocial Team', 'https://drunksocial.com', 'support@drunksocial.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth' // Use this name in @ApiBearerAuth('JWT-auth')
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'DrunkSocial API Documentation',
  });
}

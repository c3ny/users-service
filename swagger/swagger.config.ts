import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Sangue Solidário - Users Service API')
    .setDescription(
      `
      ## Users Service API Documentation
      
      This microservice handles user management, authentication, and profiles for the Sangue Solidário platform.
      
      ### Features
      - User registration (donors and companies)
      - JWT authentication
      - Profile management
      - Avatar upload
      - Password management
      
      ### User Types
      - **DONOR**: Individual blood donors with CPF, blood type, and birth date
      - **COMPANY**: Healthcare institutions with CNPJ, institution name, and CNES
      
      ### Authentication
      All protected endpoints require a JWT token in the Authorization header:
      \`\`\`
      Authorization: Bearer <your-jwt-token>
      \`\`\`
      
      ### Base URL
      \`http://localhost:3002\`
    `,
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management and profiles')
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
    .addServer('http://localhost:3002', 'Development Server')
    .addServer('https://api.sanguesolidario.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Sangue Solidário - Users Service API',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #e74c3c; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    `,
  });

  return document;
}

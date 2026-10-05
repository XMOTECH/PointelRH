import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // trustProxy : l'app tourne derrière le reverse proxy (Caddy) → vraie IP client via X-Forwarded-For
    new FastifyAdapter({ trustProxy: true }),
  );

  // Arrêt propre sur SIGTERM (docker stop / redéploiement) : fermeture des connexions Prisma
  app.enableShutdownHooks();
  
  // Set global API prefix to match legacy microservices structure
  app.setGlobalPrefix('api');

  // Enable CORS with strict allowed origins
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Pattern autorisant localhost, 127.0.0.1 et n'importe quelle adresse IP directe (ex: http://20.215.48.31)
  const ipOrLocalhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|(?:[0-9]{1,3}\.){3}[0-9]{1,3})(?::[0-9]+)?$/;

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
      // Requêtes sans Origin (ex: curl, mobile, appels internes)
      if (!origin) {
        return callback(null, true);
      }

      // Origines explicitement déclarées dans ALLOWED_ORIGINS (ou wildcard *)
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Origines directes par IP ou localhost
      if (ipOrLocalhostPattern.test(origin)) {
        return callback(null, true);
      }

      // Rejet propre sans lever d'exception 500
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation pipe using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Configure Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('LuminaRH API')
    .setDescription('Documentation officielle de l\'API unifiée de LuminaRH (Monolithe Modulaire)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token d\'accès Keycloak JWT',
        in: 'header',
      },
      'keycloak-token',
    )
    .build();
    
  // Swagger : actif en dev, désactivé en production sauf SWAGGER_ENABLED=true
  const swaggerEnabled = !isProduction || process.env.SWAGGER_ENABLED === 'true';
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`LuminaRH Monolith is running on port ${port} (Fastify)`);
  if (swaggerEnabled) {
    logger.log(`Swagger documentation is available at http://localhost:${port}/docs`);
  }
}
bootstrap();

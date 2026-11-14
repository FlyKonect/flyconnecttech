import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Only the website may call the backend from a browser.
  app.enableCors({ origin: config.get('FRONTEND_URL'), credentials: true });
  app.enableShutdownHooks();

  // API docs for developers. Not shown on the live site.
  if (config.get('NODE_ENV') !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('FlyConnect Tech API')
        .setDescription(
          'Backend for the website, client portal and team panel.',
        )
        .setVersion('0.1.0')
        .build(),
    );
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(config.get('PORT'));
}
await bootstrap();

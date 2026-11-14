import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  configureApp(app);

  const config = app.get<ConfigService<Env, true>>(ConfigService);

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

  // Keep idle connections open longer than the web server in front of the
  // app (and browsers) do, so a reused connection is never cut mid-request.
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
}
await bootstrap();

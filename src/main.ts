import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './presentation/filters/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe: whitelist incoming payloads and transform types
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global exception filter to standardize error envelope
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response interceptor to envelope successful responses as { data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Dark API')
    .setDescription('API Dark, studying NestJS + TypeORM + SOLID principles')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Wrap all response schemas under a top-level `data` property so the
  // Swagger UI matches the runtime envelope used by the API responses.
  const wrapResponsesWithData = (doc: any) => {
    if (!doc || !doc.paths) return;

    for (const pathKey of Object.keys(doc.paths)) {
      const pathItem = doc.paths[pathKey] as Record<string, any>;
      for (const method of Object.keys(pathItem)) {
        const operation = pathItem[method] as any;
        if (!operation || !operation.responses) continue;

        for (const [status, resp] of Object.entries(operation.responses)) {
          // Leave 204 No Content alone
          if (status === '204') continue;

          const responseObj = resp as any;
          if (!responseObj || !responseObj.content) continue;
          const jsonContent = responseObj.content['application/json'];
          if (!jsonContent || !jsonContent.schema) continue;

          const originalSchema = jsonContent.schema;

          // Replace schema with envelope { data: <original> }
          responseObj.content['application/json'].schema = {
            type: 'object',
            properties: {
              data: originalSchema,
            },
            required: ['data'],
          };
        }
      }
    }

    // Also handle reusable component responses if present
    if (doc.components && doc.components.responses) {
      for (const [key, resp] of Object.entries(doc.components.responses)) {
        const responseObj = resp as any;
        if (!responseObj || !responseObj.content) continue;
        const jsonContent = responseObj.content['application/json'];
        if (!jsonContent || !jsonContent.schema) continue;

        const originalSchema = jsonContent.schema;
        responseObj.content['application/json'].schema = {
          type: 'object',
          properties: {
            data: originalSchema,
          },
          required: ['data'],
        };
      }
    }
  };

  wrapResponsesWithData(document);
  SwaggerModule.setup('api', app, document);

  const preferredPort = Number(process.env.PORT ?? 3000);

  const startWithRetries = async (port: number, attemptsLeft = 5): Promise<void> => {
    try {
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}`);
    } catch (err) {
      const code = (err as any)?.code;
      if (code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use.`);
        if (attemptsLeft > 0) {
          const nextPort = port + 1;
          console.log(`Trying next port: ${nextPort} (${attemptsLeft - 1} attempts left)`);
          return startWithRetries(nextPort, attemptsLeft - 1);
        }
        console.error('No available ports found after multiple attempts. Exiting.');
        process.exit(1);
      }
      // unknown error, rethrow
      throw err;
    }
  };

  await startWithRetries(preferredPort, 5);
}

bootstrap();

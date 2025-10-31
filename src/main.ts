import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./presentation/filters/all-exceptions.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ResponseInterceptor } from "./presentation/filters/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies so we can accept tokens via cookies when needed.
  // Try to require cookie-parser if it's installed; if not, continue without failing.
  // If you want cookie support, install with: npm install cookie-parser
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const cookieParser = require("cookie-parser");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(cookieParser());
  } catch {
    console.warn(
      "cookie-parser not installed; cookie-based token extraction will be disabled. To enable it run: npm install cookie-parser",
    );
  }

  // Global validation pipe: whitelist incoming payloads and transform types
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global exception filter to standardize error envelope
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const loggerService = app.get("LoggerService");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));

  // Global response interceptor to envelope successful responses as { data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Dark API")
    .setDescription(
      "API demonstrando Clean Architecture com NestJS, Prisma e RBAC completo",
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    // Tags ordenadas (ordem de exibição no Swagger)
    .addTag("Health", "Health checks e métricas da aplicação")
    .addTag("Authentication", "Autenticação e autorização JWT")
    .addTag("Users", "Gerenciamento de usuários")
    .addTag("Roles", "Gerenciamento de papéis e permissões")
    .addTag("Environment Permissions", "Permissões por ambiente")
    .addTag("Role Assignments", "Atribuições de papéis e permissões")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Wrap all response schemas under a top-level `data` property so the
  // Swagger UI matches the runtime envelope used by the API responses.

  const wrapResponsesWithData = (doc: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!doc || !doc.paths) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    for (const pathKey of Object.keys(doc.paths)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const pathItem = doc.paths[pathKey] as Record<string, any>;
      for (const method of Object.keys(pathItem)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const operation = pathItem[method];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!operation || !operation.responses) continue;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        for (const [status, resp] of Object.entries(operation.responses)) {
          // Leave 204 No Content alone
          if (status === "204") continue;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const responseObj = resp as any;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!responseObj || !responseObj.content) continue;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const jsonContent = responseObj.content["application/json"];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!jsonContent || !jsonContent.schema) continue;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const originalSchema = jsonContent.schema;

          // Replace schema with envelope { data: <original> }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          responseObj.content["application/json"].schema = {
            type: "object",
            properties: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data: originalSchema,
            },
            required: ["data"],
          };
        }
      }
    }

    // Also handle reusable component responses if present
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (doc.components && doc.components.responses) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      for (const [, resp] of Object.entries(doc.components.responses)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseObj = resp as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!responseObj || !responseObj.content) continue;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const jsonContent = responseObj.content["application/json"];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!jsonContent || !jsonContent.schema) continue;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const originalSchema = jsonContent.schema;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        responseObj.content["application/json"].schema = {
          type: "object",
          properties: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: originalSchema,
          },
          required: ["data"],
        };
      }
    }
  };

  wrapResponsesWithData(document);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "method",
    },
  });

  const preferredPort = Number(process.env.PORT ?? 3000);

  const startWithRetries = async (
    port: number,
    attemptsLeft = 5,
  ): Promise<void> => {
    try {
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const code = err?.code;
      if (code === "EADDRINUSE") {
        console.warn(`Port ${port} is in use.`);
        if (attemptsLeft > 0) {
          const nextPort = port + 1;
          console.log(
            `Trying next port: ${nextPort} (${attemptsLeft - 1} attempts left)`,
          );
          return startWithRetries(nextPort, attemptsLeft - 1);
        }
        console.error(
          "No available ports found after multiple attempts. Exiting.",
        );
        process.exit(1);
      }
      // unknown error, rethrow
      throw err;
    }
  };

  void startWithRetries(preferredPort, 5);
}

void bootstrap();

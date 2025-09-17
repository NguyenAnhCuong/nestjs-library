import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const reflector = app.get('Reflector');
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public')); //js,css

  const port = configService.get<string>('PORT') || 8888;
  await app.listen(port);
}
bootstrap();

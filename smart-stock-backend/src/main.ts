import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); 
  
  app.enableCors(); 

  const config = new DocumentBuilder()
    .setTitle('Smart Stock API')
    .setDescription('API Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const orm = app.get(MikroORM);
  await orm.schema.updateSchema();

  await app.listen(3000);
}
bootstrap();

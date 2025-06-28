import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Result-list de e-commerce')
    .setDescription(
      `
      E-commerce API that deals with products (Create, Edit, Update, Remove) and users (Create, Edit, Update, Remove).
      
      The product's table is relationed with users' table based on 'ownerid' tag, which applies user's id to his products.

      The user can access his procuts searching for his id in products' table. 
      The user can, also, access public products based on other users' ids.
      `,
    )
    .setVersion('1.0')
    .addTag('e-commerce')
    .build();
    
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import 'reflect-metadata';
import helmet from 'helmet';
import * as expressEjsLayouts from 'express-ejs-layouts';
import * as session from 'express-session';
import * as methodOverride from 'method-override';
import passport from 'passport';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const flash = require('connect-flash');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.use(
    session({
      secret: process.env.SESSION_KEY, //express session by default store in memory so it will cause memory leaks, so for best practice in production see the documentation
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // you should learn redis
    }),
  );
  app.use(flash());
  app.use(methodOverride('_method'));
  app.setViewEngine('ejs');
  app.use(expressEjsLayouts);

  // app.use(passport.initialize());
  // app.use(passport.session());

  await app.listen(3000);
}
bootstrap();

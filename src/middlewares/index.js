import express from 'express';
import session from 'express-session';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
dotenv.config();
const applyMiddleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      },
    })
  );
  app.use(methodOverride('_method'));
};

export default applyMiddleware;

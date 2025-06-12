import express from 'express';
import path from 'path';

const setupStaticFiles = (app, dirname) => {
  app.use(express.static(path.join(dirname, 'public')));
};

export default setupStaticFiles;

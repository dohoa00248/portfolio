import path from 'path';

const setupViewEngine = (app, dirname) => {
  app.set('views', path.join(dirname, 'views'));
  app.set('view engine', 'ejs');
};

export default setupViewEngine;

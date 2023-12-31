import * as express from 'express';

export const matchRouter = express.Router();

matchRouter.get('/', (req, res) => {
  res.send('Hello world');
});

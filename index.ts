import * as express from 'express';
import { createServer } from 'http';
import * as mongoose from 'mongoose';
import { userRouter, questionRouter, matchRouter, smallNoteRouter } from './routes';
import { createSocket } from './sockets/game-socket';
import * as passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import * as jwt from 'jsonwebtoken';
import * as cors from 'cors';

export const app: express.Application = express();
const server = createServer(app);
createSocket(server);

interface JwtPayloadUsername extends jwt.JwtPayload {
  username: string;
}
export const jwtSecret = process.env.JWTSECRET;
passport.use(
  new BearerStrategy((token, done) => {
    jwt.verify(token, jwtSecret, (err, decoded: JwtPayloadUsername) => {
      if (err) {
        done(null, false);
        return;
      }
      const user = { username: decoded.username };
      done(null, user);
    });
  }),
);

// MONGODB Server Connection
const mongoUser = process.env.MONGOUSER;
const mongoPass = process.env.MONGOPASS;
const uri =
  `mongodb+srv://${mongoUser}:${mongoPass}@triviagame.grizrzt.mongodb.net/?retryWrites=true&w=majority`;
mongoose
  .connect(uri)
  .then(() => {
    console.warn('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(express.json());
app.use(express.static('public'));
app.use(cors({credentials: true, origin: true, }))
app.use('/user', userRouter);
app.use('/question', questionRouter);
app.use('/games', matchRouter);
app.use('/notes', smallNoteRouter);

app.get('/', async (req, res) => {
  res.send('GAMEON');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.warn(`Server listening on port ${port}`);
});

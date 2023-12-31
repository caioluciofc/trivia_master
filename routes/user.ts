import * as express from 'express';
import { UserProvider } from '../providers';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { secret } from '..';
import * as passport from 'passport';

export const userRouter = express.Router();

/**
 * @route POST /signin
 * @description Sign in with a username and password
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {object} Response with a message and a JWT token on successful login
 */
userRouter.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserProvider.getUser(username);

    if (!user) {
      res.status(401).json({ message: 'Invalid username or password' });
      return;
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (isMatch) {
      const jwtTok = jwt.sign({ userId: user._id }, secret);
      res.status(200).json({ message: 'Login successful', token: jwtTok });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

/**
 * @route POST /signup
 * @description Sign up with a new username and password
 * @param {string} username - The new username
 * @param {string} password - The new password
 * @returns {object} Response with a message on successful user creation
 */
userRouter.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserProvider.getUser(username);

    if (user) {
      res.status(401).json({ message: 'This username is already taken' });
      return;
    }

    await UserProvider.create(username, password);
    res.status(200).json({ message: 'User successfully created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'There was an error while creating your user' });
  }
});

/**
 * @route GET /ranking
 * @description Get the user ranking (requires authentication)
 * @authentication Bearer Token
 * @returns {object} Response with a message and the user ranking on successful retrieval
 */
userRouter.get(
  '/ranking',
  passport.authenticate('bearer', { session: false }),
  async (req, res) => {
    try {
      const ranking = await UserProvider.getRanking();
      res.status(200).json({ message: 'Ranking retrieved', ranking });
    } catch (error) {
      res.status(500).json({ message: 'There was an error while creating your user' });
    }
  },
);

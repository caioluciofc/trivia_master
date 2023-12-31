import * as express from 'express';
import { QuestionProvider } from '../providers';
import { OpenTrivia } from '../services';
import * as he from 'he';
export const questionRouter = express.Router();

/**
 * @route GET /populateDB
 * @description Update the questions database fetching data from the Open Trivia API 
 */
questionRouter.get('/populateDB', async (req, res) => {
  const openTrivia = new OpenTrivia();
  const token = await openTrivia.retrieveToken();

  function sleep(delay: number) {
    const start = new Date().getTime();
    while (new Date().getTime() < start + delay) {
      /* empty */
    }
  }

  if (typeof token === 'string') {
    for (let i = 0; i < 200; i++) {
      const questions = await openTrivia.fetchQuestions(50, token);
      const mongoStrucQuestions = questions.map((question) => {
        return {
          question: he.decode(question.question),
          correctAnswer: he.decode(question.correct_answer),
          wrongAnswers: question.incorrect_answers.map((incorrect_answer) =>
            he.decode(incorrect_answer),
          ),
        };
      });
      QuestionProvider.createBatch(mongoStrucQuestions);
      sleep(2000);
    }
  }
  res.send('Done populating the DB');
});

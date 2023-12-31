import { QuestionModel, type Question } from '../models';

export class QuestionProvider {
  static create(question: string, correctAnswer: string, wrongAnswers: string[]) {
    const newQuestion = new QuestionModel({
      question,
      correctAnswer,
      wrongAnswers,
    });
    newQuestion.save();
  }

  static async createBatch(questions: Question[]) {
    await QuestionModel.insertMany(questions);
  }

  static async getQuestion(question: string): Promise<Question | null> {
    const query = QuestionModel.where({ question });
    const questionModel = await query.findOne();
    return questionModel;
  }

  static async getRandomQuestions(amount: number) {
    const aggregate = await QuestionModel.aggregate([{ $sample: { size: amount } }]).exec();
    return aggregate;
  }

  static async updateQuestion(
    questionId: string,
    question: string,
    correctAnswer: string,
    wrongAnswers: string[],
  ) {
    // The return here on the user returns a query with the data before being updated
    await QuestionModel.findByIdAndUpdate(questionId, {
      question,
      correctAnswer,
      wrongAnswers,
    });
  }

  static async delete(question: string) {
    const questionModel = await this.getQuestion(question);
    const result = questionModel
      ? await QuestionModel.findByIdAndDelete(questionModel._id)
      : 'Question not found';
    return result;
  }
}

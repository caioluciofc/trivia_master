import * as mongoose from 'mongoose';

export interface Question {
  _id?: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

const questionSchema = new mongoose.Schema({
  question: String,
  correctAnswer: String,
  wrongAnswers: [String],
});

export const QuestionModel = mongoose.model<Question>('Question', questionSchema);

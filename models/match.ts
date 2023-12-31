import * as mongoose from 'mongoose';

export interface Match {
  _id: string;
  players: string[];
  winner: string;
  time: number;
}

const matchSchema = new mongoose.Schema({
  _id: String,
  players: [String],
  winner: String,
  time: Number,
});

export const MatchModel = mongoose.model<Match>('Matches', matchSchema);

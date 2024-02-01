import * as mongoose from 'mongoose';

export interface SmallNote {
  _id: Number;
  text: string;
  time: number;
}

const smallNoteSchema = new mongoose.Schema({
  _id: Number,
  text: String,
  time: Number,
});

export const SmallNoteModel = mongoose.model<SmallNote>('SmallNote', smallNoteSchema);

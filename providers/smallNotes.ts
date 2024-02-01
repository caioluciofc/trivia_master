import { SmallNoteModel, type SmallNote } from '../models';

export class SmallNoteProvider {
  static create(id: Number, text: string) {
    const newNote = new SmallNoteModel({
      _id: id,
      text,
      time: Date.now(),
    });
    newNote.save();
  }

  static async getNote(id: Number): Promise<SmallNote | null> {
    const query = SmallNoteModel.where({ id });
    const questionModel = await query.findOne();
    return questionModel;
  }

  static async updateNote(
    noteId: Number,
    text: string,
  ) {
    // The return here on the user returns a query with the data before being updated
    await SmallNoteModel.findByIdAndUpdate(noteId, {
        text,
        time: Date.now()});
  }

  static async delete(noteId: Number) {
    const result = await SmallNoteModel.findByIdAndDelete(noteId) ? 'Note deleted successfully'
      : 'Note not found';
    return result;
  }
}

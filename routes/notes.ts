import * as express from 'express';
import { SmallNoteProvider } from '../providers';
import * as he from 'he';
export const smallNoteRouter = express.Router();

/**
 * @route GET /get_note/:note_id
 */
smallNoteRouter.get('/get_note/:note_id', async (req, res) => {
    const note = await SmallNoteProvider.getNote(Number(req.params.note_id));
    if (note) {
        res.send(note);
    } else {
        res.send('Note not found');
    }
});

smallNoteRouter.post('/update_note', async (req, res) => {
    const note = await SmallNoteProvider.updateNote(
        req.body.note_id,
        req.body.text,
    );
    res.send(note);
});

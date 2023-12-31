import { MatchModel, type Match } from '../models';

export class MatchProvider {
  static create(matchId, players: string[]) {
    const newMatch = new MatchModel({
      _id: matchId,
      players,
      time: Date.now(),
    });
    newMatch.save();
  }

  static async getMatch(matchId: string): Promise<Match | null> {
    const matchModel = await MatchModel.findById(matchId);
    return matchModel;
  }

  static async setWinner(matchId: string, winner: string) {
    // The return here on the user returns a query with the data before being updated
    await MatchModel.findByIdAndUpdate(matchId, { winner });
  }

  static async delete(matchId: string) {
    const result = await MatchModel.findByIdAndDelete(matchId);
    return result;
  }
}

import { MatchProvider } from '../providers';
import { Game } from '../models/game';

export class GameController {
  rooms: Map<string, Game>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(username: string, socketId: string): Game {
    const newGame = new Game();
    newGame.addPlayer(username, socketId);
    this.rooms.set(newGame.roomId, newGame);
    return newGame;
  }

  getCurrentQuestion(roomId: string) {
    const room = this.getRoom(roomId);
    return room?.currentQuestion;
  }

  getRoomPlayers(roomId: string) {
    const room = this.getRoom(roomId);
    return Array.from(room?.players.keys());
  }

  getJoinableRooms() {
    const joinableGames = [];
    for (const [_, game] of this.rooms.entries()) {
      if (game.players.size === 1) {
        const [firstPlayer] = game.players.keys();
        joinableGames.push({ roomId: game.roomId, player: firstPlayer });
      }
    }
    return joinableGames;
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    return room;
  }

  async playerDisconnect(roomId: string) {
    const room = this.getRoom(roomId);
    if (room?.started) {
      await room.setResult();
      return room.checkResult();
    } else if (room?.players.size === 0 || !room) {
      this.rooms.delete(roomId);
      return 'DELETED';
    }
  }

  async joinRoom(roomId: string, username: string, socketId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      if (room.players.size > 1) {
        return false;
      } else {
        await room.fetchQuestions();
        room.addPlayer(username, socketId);
        room.startGame();
        MatchProvider.create(roomId, Array.from(room.players.keys()));
        return true;
      }
    }
  }

  answerQuestion(roomId: string, username: string, answer: string) {
    const room = this.getRoom(roomId);
    room?.answerQuestion(username, answer);
    const status = room?.updateRound();
    return status;
  }

  checkResult(roomId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      return room.checkResult();
    }
    return 'ERROR';
  }

  getScore(roomId : string) {
    const room = this.getRoom(roomId);
    return room.getScore()
  }

  async waitAndDeleteGame(roomId: string) {
    const room = this.getRoom(roomId);
    if (!room?.markedToDelete) {
      // In updating it here to make sure it'll run only once
      await MatchProvider.setWinner(roomId, room.winner ? room.winner : 'DRAW');
      room.markedToDelete = true;
      const delay = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));
      await delay(10000);
      this.rooms.delete(roomId);
    }
  }
}

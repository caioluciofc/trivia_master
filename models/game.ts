import { QuestionProvider, UserProvider } from '../providers';
import type { Question } from './questions';
import { v4 as uuid } from 'uuid';

interface Player {
  username: string;
  score: number;
  round: number;
  socketId: string;
  disconnected: boolean;
}

export class Game {
  roomId!: string;
  round!: number;
  players!: Map<string, Player>;
  roundTime!: number;
  questions!: Question[];
  winner!: string;
  draw!: boolean;
  started!: boolean;
  finished!: boolean;
  maxRounds!: number;
  currentQuestion!: Question;
  markedToDelete!: boolean;

  constructor() {
    this.roomId = uuid();
    this.round = 0;
    this.roundTime = 30;
    this.started = false;
    this.finished = false;
    this.players = new Map();
    this.maxRounds = 5;
  }

  async addPlayer(username: string, socketId: string) {
    this.players.set(username, { username, score: 0, round: 1, socketId, disconnected: false });
  }

  async fetchQuestions() {
    this.questions = await QuestionProvider.getRandomQuestions(this.maxRounds);
  }

  getPlayer(username: string) {
    return this.players.get(username);
  }

  getScore() {
    const playerScores = {}
    for (const [username, player] of this.players.entries()) {
      playerScores[username] = player.score
    }
    return playerScores
  }

  startGame() {
    this.started = true;
    this.round = 1;
    this.currentQuestion = this.questions[this.round - 1];
  }

  answerQuestion(username: string, answer: string) {
    const player = this.getPlayer(username);
    if (player) {
      if (this.currentQuestion.correctAnswer === answer) {
        player.score += 1;
      }
      player.round += 1;
    }
  }

  removePlayer(socketId: string) {
    for (const [key, player] of this.players.entries()) {
      if (player.socketId === socketId) {
        this.players.delete(key);
      }
    }
  }

  updateRound() {
    const playerRounds = [];
    for (const [_, player] of this.players.entries()) {
      playerRounds.push(player.round);
    }
    if (playerRounds.every((val, i, arr) => val === arr[0])) {
      this.round += 1;
      if (this.round > this.maxRounds) {
        this.setResult();
        return 'FINISHED';
      }
      this.currentQuestion = this.questions[this.round - 1];
      return 'NEXTQUESTION';
    }
    return 'WAITINGFORPLAYER';
  }

  async setWinner(username: string) {
    this.winner = username;
    this.draw = false;
    await UserProvider.addWin(this.winner);
  }

  checkResult() {
    if (this.finished) {
      if (this.draw) {
        return 'DRAW';
      }
      return this.winner;
    }
    return 'INPROGRESS';
  }

  async setResult() {
    if (this.finished) {
      return this.checkResult();
    }

    this.finished = true;
    let result = '';
    let maxScore = 0;
    for (const [_, player] of this.players.entries()) {
      if (player.score > maxScore) {
        result = player.username;
        maxScore = player.score;
      } else if (maxScore > 0 && player.score === maxScore) {
        result = 'DRAW';
        this.draw = true;
      }
    }
    if (result !== 'DRAW') {
      await this.setWinner(result);
    }
  }
}

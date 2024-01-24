import { type Socket } from 'socket.io';
import { type GameController } from '../../controllers';

interface Data {
  roomId: string;
  username: string;
}

type Dictionary = Record<string, any>;

interface Props {
  socket: Socket;
  gameController: GameController;
  _data: Data;
  callback: (_value: Dictionary) => void;
}

export async function onGetQuestion({ socket, gameController, _data, callback }: Props) {
  const rooms = socket.rooms;
  const roomsArr = Array.from(rooms);
  const roomId = roomsArr[1];
  const players = gameController.getRoomPlayers(roomId);
  const actualQuestion = gameController.getCurrentQuestion(roomId);
  const score = gameController.getScore(roomId);
  callback({
    question: actualQuestion,
    players,
    score
  });
}

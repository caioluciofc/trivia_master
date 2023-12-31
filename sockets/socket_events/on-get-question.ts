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
  const actualQuestion = gameController.getCurrentQuestion(roomsArr[1]);
  callback({
    question: actualQuestion,
  });
}

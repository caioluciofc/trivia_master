import { type Socket } from 'socket.io';
import { type GameController } from '../../controllers';

type Dictionary = Record<string, any>;

interface Data {
  roomId: string;
  username: string;
  answer: string;
}

interface Props {
  socket: Socket;
  gameController: GameController;
  data: Data;
  callback: (_value: Dictionary) => void;
}

export async function onGetResult({ socket, gameController, data, callback }: Props) {
  const rooms = socket.rooms;
  const roomsArr = Array.from(rooms);
  const roomId = roomsArr[1];
  const result = gameController.checkResult(roomId);
  let response;
  if (data.username === result) {
    response = `Congratulations ${data.username}, you won!`;
  } else if (result === 'DRAW') {
    response = 'It was a DRAW! You gave your best!';
  } else {
    response = `Too bad ${data.username}, you lost! Better luck next time!`;
  }
  gameController.waitAndDeleteGame(roomId);
  socket.leave(roomId);
  callback({
    result,
    message: response,
  });
}

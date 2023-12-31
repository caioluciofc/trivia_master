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

export async function onPlayerAnswer({ socket, gameController, data, callback }: Props) {
  const rooms = socket.rooms;
  const roomsArr = Array.from(rooms);
  const roomId = roomsArr[1];
  const roundStatus = gameController.answerQuestion(roomId, data.username, data.answer);
  const result = gameController.checkResult(roomId);
  // This is here to avoid the next-round being emmited before the client is waiting for it
  function emitNextRound() {
    socket.to(roomId).emit('next-round', { roundStatus });
  }
  callback({
    roundStatus,
    result,
  });
  setTimeout(emitNextRound, 150);
}

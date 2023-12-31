import { type Socket } from 'socket.io';
import { type GameController } from '../../controllers';

type Dictionary = Record<string, string>;

interface Props {
  socket: Socket;
  gameController: GameController;
  callback: (_value: Dictionary) => void;
  data: Dictionary;
}

export async function onEnterQueue({ socket, gameController, data, callback }: Props) {
  const availableGames = gameController.getJoinableRooms();
  if (availableGames.length > 0) {
    const roomId = availableGames[0].roomId;
    await gameController.joinRoom(roomId, data.username, socket.id);
    const roomPlayers = gameController.getRoomPlayers(roomId);
    const startMessage = `It's on! ${roomPlayers[0]} VS ${roomPlayers[1]}`;
    socket.join(roomId);
    socket.to(roomId).emit('start-game', { message: startMessage });
    callback({
      message: startMessage,
      code: 'JOINED',
      roomId,
    });
  } else {
    const newGame = gameController.createRoom(data.username, socket.id);
    socket.join(newGame.roomId);
    callback({
      message: 'A game has been created, please wait for another player to join.',
      code: 'CREATED',
      roomId: newGame.roomId,
    });
  }
}

import { type Socket } from 'socket.io';
import { type GameController } from '../../controllers';

export async function onDisconnect(socket: Socket, gameController: GameController) {
  const rooms = socket.rooms;
  const roomsArr = Array.from(rooms);
  if (rooms.size > 1) {
    const roomId = roomsArr[1];
    const roomResult = await gameController.playerDisconnect(roomId);
    if (roomResult !== 'DELETED') {
      socket.to(roomId).emit('next-round', { roundStatus: 'FINISHED' });
    }
  }
}

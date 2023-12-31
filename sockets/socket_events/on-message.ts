import { type Socket } from 'socket.io';

interface Data {
  message: string;
}

export function onMessage(socket: Socket, data: Data) {
  socket.broadcast.emit('message', data);
}

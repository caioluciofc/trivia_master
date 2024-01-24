import { Server as SocketServer, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { GameController } from '../controllers';
import * as _event from './socket_events';
import {
  type ClientToServerEvents,
  type InterServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from './interfaces';
import { jwtSecret } from '..';
import * as jwt from 'jsonwebtoken';

export function createSocket(server: HttpServer) {
  const io = new SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors : {
      origin: true,
      credentials: true
    }
  });
  io.use((socket: Socket, next) => {
    const token = socket.handshake.query.token as string;

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        next(new Error('Authentication failed'));
        return;
      }
      (socket as any).user = decoded;
      next();
    });
  });

  const gameController = new GameController();
  io.on('connection', (socket: Socket) => {
    // Client asks to join the Queue, is there an available room ? join room : create room and wait for another player
    socket.on('enter-queue', async (data, callback) => {
      await _event.onEnterQueue({ socket, gameController, data, callback });
    });

    // Client asks for the next question to be displayed to the player
    socket.on('get-question', async (data, callback) => {
      await _event.onGetQuestion({ socket, gameController, _data: data, callback });
    });

    // Client sends the answer for a question, if there are no more questions it returns the status FINISHED, which
    // makes the client stop triggering this call
    socket.on('player-answer', async (data, callback) => {
      await _event.onPlayerAnswer({ socket, gameController, data, callback });
    });

    // Client asks for the result of a match
    socket.on('get-result', async (data, callback) => {
      await _event.onGetResult({ socket, gameController, data, callback });
    });

    // This action is called before the 'disconnect' action, with it we can check in which room the player was when
    // they disconnect, triggering the end of the match
    socket.on('disconnecting', async () => {
      await _event.onDisconnect(socket, gameController);
    });
  });
}

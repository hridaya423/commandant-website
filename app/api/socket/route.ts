import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

const rooms = new Map<string, Set<WebSocket>>();
const userSessions = new Map<WebSocket, { roomId: string; username: string; cursor?: number }>();

interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'code_change' | 'cursor_change' | 'user_list';
  roomId?: string;
  username?: string;
  code?: string;
  cursor?: number;
  users?: Array<{ username: string; cursor?: number }>;
} 

function broadcastToRoom(roomId: string, message: WebSocketMessage, excludeClient?: WebSocket

) {
  const roomClients = rooms.get(roomId);
  if (roomClients) {
    roomClients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

function getRoomUsers(roomId: string): Array<{ username: string; cursor?: number }> {
  const roomClients = rooms.get(roomId);
  const users: Array<{ username: string; cursor?: number }> = [];
  
  if (roomClients) {
    roomClients.forEach(client => {
      const session = userSessions.get(client);
      if (session) {
        users.push({ username: session.username, cursor: session.cursor });
      }
    });
  }
  
  return users;
}

export async function GET(request: NextRequest) {
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          
          switch (message.type) {
            case 'join_room':
              if (message.roomId && message.username) {
                const prevSession = userSessions.get(ws);
                if (prevSession) {
                  const prevRoom = rooms.get(prevSession.roomId);
                  if (prevRoom) {
                    prevRoom.delete(ws);
                    broadcastToRoom(prevSession.roomId, {
                      type: 'user_list',
                      users: getRoomUsers(prevSession.roomId)
                    });
                  }
                }

                if (!rooms.has(message.roomId)) {
                  rooms.set(message.roomId, new Set());
                }
                
                const room = rooms.get(message.roomId)!;
                room.add(ws);
                
                userSessions.set(ws, {
                  roomId: message.roomId,
                  username: message.username
                });

                const users = getRoomUsers(message.roomId);
                broadcastToRoom(message.roomId, {
                  type: 'user_list',
                  users: users
                });
              }
              break;

            case 'code_change':
              const session = userSessions.get(ws);
              if (session && message.code !== undefined) {
                broadcastToRoom(session.roomId, {
                  type: 'code_change',
                  code: message.code,
                  username: session.username
                }, ws);
              }
              break;

            case 'cursor_change':
              const cursorSession = userSessions.get(ws);
              if (cursorSession && message.cursor !== undefined) {
                cursorSession.cursor = message.cursor;
                
                broadcastToRoom(cursorSession.roomId, {
                  type: 'cursor_change',
                  cursor: message.cursor,
                  username: cursorSession.username
                }, ws);
              }
              break;
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        const session = userSessions.get(ws);
        if (session) {
          const room = rooms.get(session.roomId);
          if (room) {
            room.delete(ws);
            
            if (room.size === 0) {
              rooms.delete(session.roomId);
            } else {
              broadcastToRoom(session.roomId, {
                type: 'user_list',
                users: getRoomUsers(session.roomId)
              });
            }
          }
          userSessions.delete(ws);
        }
      });
    });
  }

  return new Response('WebSocket server initialized', { status: 200 });
}

export const runtime = 'nodejs';
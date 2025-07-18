import { useState, useEffect, useRef, useCallback } from 'react';

interface User {
  username: string;
  cursor?: number;
}

interface CollaborationState {
  isConnected: boolean;
  isInRoom: boolean;
  roomId: string | null;
  users: User[];
  isTyping: { [username: string]: boolean };
}

interface UseCollaborationReturn extends CollaborationState {
  connect: () => void;
  disconnect: () => void;
  createRoom: (username: string) => void;
  joinRoom: (roomId: string, username: string) => void;
  leaveRoom: () => void;
  sendCodeChange: (code: string, version?: number) => void;
  sendCursorChange: (position: number) => void;
  startTyping: () => void;
  stopTyping: () => void;
  onCodeChange: (callback: (code: string, username: string, version?: number) => void) => void;
  onCursorChange: (callback: (username: string, position: number) => void) => void;
}

const WEBSOCKET_URL = 'https://commandant-server.onrender.com/';

export function useCollaboration(): UseCollaborationReturn {
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    isInRoom: false,
    roomId: null,
    users: [],
    isTyping: {}
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pendingUsernameRef = useRef<string | null>(null);

  const onCodeChangeRef = useRef<((code: string, username: string, version: number) => void) | undefined>(undefined);
  const onCursorChangeRef = useRef<((username: string, position: number) => void) | undefined>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        console.log('Connected to collaboration server');
        setState(prev => ({ ...prev, isConnected: true }));
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Disconnected from collaboration server:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isInRoom: false,
          roomId: null,
          users: []
        }));

        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'connected':
        console.log('Server connection confirmed');
        break;

      case 'room_created':
        console.log('Room created:', message.roomId);
        setState(prev => ({ ...prev, roomId: message.roomId }));
        
        if (pendingUsernameRef.current && message.roomId) {
          sendMessage({
            type: 'join_room',
            roomId: message.roomId,
            username: pendingUsernameRef.current
          });
        }
        break;

      case 'joined_room':
        console.log('Joined room:', message.roomId);
        setState(prev => ({
          ...prev,
          isInRoom: true,
          roomId: message.roomId,
          users: message.users || []
        }));
        break;

      case 'user_joined':
        console.log('User joined:', message.username);
        setState(prev => ({ ...prev, users: message.users || [] }));
        break;

      case 'user_left':
        console.log('User left');
        setState(prev => ({ ...prev, users: message.users || [] }));
        break;

      case 'code_updated':
        console.log('Code updated by:', message.username);
        if (onCodeChangeRef.current) {
          onCodeChangeRef.current(message.code, message.username, message.version);
        }
        break;

      case 'code_conflict':
        console.log('Code conflict detected, server version:', message.serverVersion);
        if (onCodeChangeRef.current) {
          onCodeChangeRef.current(message.serverCode, 'server', message.serverVersion);
        }
        break;

      case 'cursor_updated':
        console.log('Cursor updated by:', message.username);
        if (onCursorChangeRef.current) {
          onCursorChangeRef.current(message.username, message.cursor);
        }
        break;

      case 'user_typing':
        setState(prev => ({
          ...prev,
          isTyping: {
            ...prev.isTyping,
            [message.username]: message.isTyping
          }
        }));
        break;

      case 'error':
        console.error('Server error:', message.message);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const createRoom = useCallback((username: string) => {
    pendingUsernameRef.current = username;
    sendMessage({ type: 'create_room' });
  }, [sendMessage]);

  const joinRoom = useCallback((roomId: string, username: string) => {
    sendMessage({
      type: 'join_room',
      roomId,
      username
    });
  }, [sendMessage]);

  const leaveRoom = useCallback(() => {
    sendMessage({ type: 'leave_room' });
    setState(prev => ({
      ...prev,
      isInRoom: false,
      roomId: null,
      users: [],
      isTyping: {}
    }));
  }, [sendMessage]);

  const sendCodeChange = useCallback((code: string, version?: number) => {
    sendMessage({
      type: 'code_change',
      code,
      version
    });
  }, [sendMessage]);

  const sendCursorChange = useCallback((position: number) => {
    sendMessage({
      type: 'cursor_change',
      cursor: position
    });
  }, [sendMessage]);

  const startTyping = useCallback(() => {
    sendMessage({ type: 'typing_start' });
  }, [sendMessage]);

  const stopTyping = useCallback(() => {
    sendMessage({ type: 'typing_stop' });
  }, [sendMessage]);

  const onCodeChange = useCallback((callback: (code: string, username: string, version?: number) => void) => {
    onCodeChangeRef.current = callback;
  }, []);

  const onCursorChange = useCallback((callback: (username: string, position: number) => void) => {
    onCursorChangeRef.current = callback;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    leaveRoom,
    sendCodeChange,
    sendCursorChange,
    startTyping,
    stopTyping,
    onCodeChange,
    onCursorChange
  };
}
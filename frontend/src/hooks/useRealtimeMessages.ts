import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { registerIncoming } from '@/features/messages/messagesSlice';
import { apiSlice } from '@/services/apiSlice';
import type { MessageEnvelope } from '@/types/api';

const buildSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = import.meta.env.VITE_WS_HOST ?? window.location.host;
  const path = import.meta.env.VITE_WS_PATH ?? '/socket';
  return `${protocol}://${host}${path}`;
};

export const useRealtimeMessages = () => {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const dispatch = useAppDispatch();

  const socketUrl = useMemo(() => (authenticated ? buildSocketUrl() : null), [authenticated]);

  useEffect(() => {
    if (!socketUrl) {
      return;
    }
    const ws = new WebSocket(socketUrl);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as MessageEnvelope | MessageEnvelope[];
        const messages = Array.isArray(payload) ? payload : [payload];
        dispatch(registerIncoming(messages));
        dispatch(apiSlice.util.invalidateTags(['Messages']));
      } catch (error) {
        console.error('Failed to parse websocket payload', error);
      }
    };
    return () => ws.close();
  }, [dispatch, socketUrl]);
};


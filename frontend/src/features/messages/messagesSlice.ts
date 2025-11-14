import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MessageEnvelope } from '@/types/api';
import { apiSlice } from '@/services/apiSlice';
import type { ConversationParams } from '@/services/apiSlice';

export type MessagesState = {
  activeProfileId?: number;
  unread: Record<number, number>;
  lastMessage?: MessageEnvelope;
};

const initialState: MessagesState = {
  unread: {},
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<number | undefined>) {
      state.activeProfileId = action.payload;
      if (action.payload) {
        state.unread[action.payload] = 0;
      }
    },
    registerIncoming(state, action: PayloadAction<MessageEnvelope[]>) {
      action.payload.forEach((message) => {
        state.lastMessage = message;
        const from = message.fromProfileId;
        if (from === state.activeProfileId) {
          return;
        }
        state.unread[from] = (state.unread[from] ?? 0) + 1;
      });
    },
    resetMessages: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(apiSlice.endpoints.getConversation.matchFulfilled, (state, action) => {
        const metaArg = action.meta?.arg as
          | { originalArgs?: ConversationParams }
          | ConversationParams
          | undefined;
        let profileId: number | undefined;
        if (metaArg && 'originalArgs' in metaArg) {
          profileId = metaArg.originalArgs?.profileId;
        } else {
          profileId = (metaArg as ConversationParams | undefined)?.profileId;
        }
        if (profileId) {
          state.activeProfileId = profileId;
          state.unread[profileId] = 0;
        }
        const last = action.payload.at(-1);
        if (last) {
          state.lastMessage = last;
        }
      })
      .addMatcher(apiSlice.endpoints.sendMessage.matchFulfilled, (state, action) => {
        const last = action.payload.at(-1);
        if (last) {
          state.lastMessage = last;
        }
      })
      .addMatcher(apiSlice.endpoints.logout.matchFulfilled, () => initialState);
  },
});

export const { setActiveConversation, registerIncoming, resetMessages } = messagesSlice.actions;
export default messagesSlice.reducer;


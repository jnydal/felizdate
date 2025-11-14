import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from '@/services/apiSlice';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationWindow } from '@/components/messages/ConversationWindow';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setActiveConversation } from '@/features/messages/messagesSlice';

export const MessagesPage = () => {
  const { data: conversations } = useGetMessagesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const activeProfileId = useAppSelector((state) => state.messages.activeProfileId);
  const currentUserId = useAppSelector((state) => state.session.profile?.id);
  const [sendMessage, sendState] = useSendMessageMutation();

  const requestedProfileId = Number(searchParams.get('profileId')) || undefined;

  useEffect(() => {
    if (requestedProfileId && requestedProfileId !== activeProfileId) {
      dispatch(setActiveConversation(requestedProfileId));
    }
  }, [requestedProfileId, activeProfileId, dispatch]);

  const conversationResult = useGetConversationQuery(
    activeProfileId ? { profileId: activeProfileId } : skipToken,
  );

  const handleSelectConversation = (profileId: number) => {
    dispatch(setActiveConversation(profileId));
    setSearchParams({ profileId: String(profileId) });
  };

  const handleSend = async (message: string) => {
    if (!activeProfileId) {
      return;
    }
    await sendMessage({ toProfileId: activeProfileId, message }).unwrap();
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '1.5rem',
        minHeight: '70vh',
      }}
    >
      <ConversationList
        conversations={conversations}
        activeProfileId={activeProfileId}
        onSelect={handleSelectConversation}
      />
      <ConversationWindow
        messages={conversationResult.data}
        partnerName={
          conversations?.find((c) => c.fromProfileId === activeProfileId)?.fromProfileName
        }
        onSend={handleSend}
        sending={sendState.isLoading}
        currentUserId={currentUserId}
      />
    </div>
  );
};


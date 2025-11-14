import { useState } from 'react';
import type { FormEvent } from 'react';
import type { MessageEnvelope } from '@/types/api';
import { Button } from '@/components/common/Button';

type ConversationWindowProps = {
  messages?: MessageEnvelope[];
  partnerName?: string;
  onSend?: (message: string) => Promise<void> | void;
  sending?: boolean;
  currentUserId?: number;
};

export const ConversationWindow = ({
  messages,
  partnerName,
  onSend,
  sending,
  currentUserId,
}: ConversationWindowProps) => {
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || !onSend) {
      return;
    }
    await onSend(message.trim());
    setMessage('');
  };

  return (
    <div className="fd-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{partnerName ?? 'Conversation'}</h2>
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>
          {messages?.length ? `${messages.length} messages` : 'Say hello to start the chat.'}
        </p>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          paddingRight: '0.5rem',
        }}
      >
        {messages?.length ? (
          messages.map((msg) => {
            const isSelf = currentUserId === msg.fromProfileId;
            return (
              <div
                key={msg.timestamp}
                style={{
                  alignSelf: isSelf ? 'flex-end' : 'flex-start',
                  background: isSelf ? 'rgba(236,72,153,0.15)' : 'rgba(79,70,229,0.1)',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '0.85rem',
                  maxWidth: '75%',
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>{msg.fromProfileName}</p>
                <p style={{ margin: 0 }}>{msg.text}</p>
              </div>
            );
          })
        ) : (
          <p style={{ color: 'var(--fd-text-secondary)' }}>No messages yet.</p>
        )}
      </div>
      <form onSubmit={submit} style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message"
          style={{
            flex: 1,
            borderRadius: '999px',
            border: '1px solid var(--fd-muted)',
            padding: '0.65rem 1rem',
          }}
        />
        <Button type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  );
};


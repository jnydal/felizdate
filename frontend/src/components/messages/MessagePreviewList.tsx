import type { MessageEnvelope } from '@/types/api';

type MessagePreviewListProps = {
  messages?: MessageEnvelope[];
  onOpenConversation?: (profileId: number) => void;
};

export const MessagePreviewList = ({ messages, onOpenConversation }: MessagePreviewListProps) => (
  <section className="fd-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: '0 0 1rem' }}>Latest messages</h2>
      <span style={{ color: 'var(--fd-text-secondary)' }}>
        {messages?.length ? `${messages.length} active chats` : null}
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {messages?.length ? (
        messages.map((message) => (
          <button
            key={`${message.fromProfileId}-${message.timestamp}`}
            onClick={() => onOpenConversation?.(message.fromProfileId)}
            style={{
              border: '1px solid var(--fd-muted)',
              borderRadius: '0.85rem',
              padding: '0.75rem 1rem',
              textAlign: 'left',
              background: 'transparent',
            }}
          >
            <strong>{message.fromProfileName}</strong>
            <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>{message.text}</p>
          </button>
        ))
      ) : (
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>
          No conversations yet. Say hi to someone new!
        </p>
      )}
    </div>
  </section>
);


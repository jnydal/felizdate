import type { MessageEnvelope } from '@/types/api';

type ConversationListProps = {
  conversations?: MessageEnvelope[];
  activeProfileId?: number;
  onSelect?: (profileId: number) => void;
};

export const ConversationList = ({
  conversations,
  activeProfileId,
  onSelect,
}: ConversationListProps) => (
  <div
    className="fd-card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      height: '100%',
    }}
  >
    <h2 style={{ margin: 0 }}>Conversations</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {conversations?.length ? (
        conversations.map((conversation) => {
          const profileId = conversation.fromProfileId;
          const isActive = profileId === activeProfileId;
          return (
            <button
              key={`${profileId}-${conversation.timestamp}`}
              onClick={() => onSelect?.(profileId)}
              style={{
                borderRadius: '0.85rem',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: '1px solid ' + (isActive ? 'var(--fd-accent)' : 'var(--fd-muted)'),
                background: isActive ? 'rgba(236,72,153,0.08)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <strong>{conversation.fromProfileName}</strong>
              <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>{conversation.text}</p>
            </button>
          );
        })
      ) : (
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>No conversations yet.</p>
      )}
    </div>
  </div>
);


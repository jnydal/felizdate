import type { ProfileSummary } from '@/types/api';
import { MatchCard } from './MatchCard';

type MatchGridProps = {
  title: string;
  profiles?: ProfileSummary[];
  onOpenProfile?: (profile: ProfileSummary) => void;
  emptyState?: string;
};

export const MatchGrid = ({
  title,
  profiles,
  onOpenProfile,
  emptyState = 'No matches yet.',
}: MatchGridProps) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <span style={{ color: 'var(--fd-text-secondary)' }}>
        {profiles?.length ? `${profiles.length} profiles` : null}
      </span>
    </div>
    {profiles?.length ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {profiles.map((profile) => (
          <MatchCard key={profile.id} profile={profile} onOpen={onOpenProfile} />
        ))}
      </div>
    ) : (
      <div className="fd-card">
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>{emptyState}</p>
      </div>
    )}
  </section>
);


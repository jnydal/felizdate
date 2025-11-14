import type { ProfileSummary } from '@/types/api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';

type MatchCardProps = {
  profile: ProfileSummary;
  onOpen?: (profile: ProfileSummary) => void;
};

export const MatchCard = ({ profile, onOpen }: MatchCardProps) => {
  const cityName =
    typeof profile.city === 'string'
      ? profile.city
      : profile.city?.name ?? 'Somewhere romantic';

  return (
    <div
      className="fd-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Avatar src={profile.image} alt={profile.text} size={64} />
        <div style={{ flex: 1 }}>
          <strong>{profile.text}</strong>
          <p style={{ margin: 0, color: 'var(--fd-text-secondary)', fontSize: '0.9rem' }}>
            {cityName}
          </p>
        </div>
        <StatusBadge status={profile.status} />
      </div>
      <p style={{ flex: 1, margin: 0, color: 'var(--fd-text-secondary)' }}>
        {profile.description || 'Ready to meet new people nearby.'}
      </p>
      <Button onClick={() => onOpen?.(profile)}>Say hi 👋</Button>
    </div>
  );
};


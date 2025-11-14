import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useLogoutMutation, useSetStatusMutation } from '@/services/apiSlice';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';

const STATUS_OPTIONS = [
  { label: 'Geo-Online', value: 0 },
  { label: 'Online', value: 1 },
  { label: 'Away', value: 2 },
  { label: 'Invisible', value: 3 },
];

export const TopNav = () => {
  const { profile, email } = useAppSelector((state) => state.session);
  const [logout, logoutState] = useLogoutMutation();
  const [setStatus] = useSetStatusMutation();

  const displayName = useMemo(() => {
    if (profile?.text) {
      return profile.text;
    }
    if (profile?.profileName) {
      return profile.profileName as string;
    }
    return email ?? 'Explorer';
  }, [email, profile]);

  const currentStatus = profile?.status ?? 1;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--fd-muted)',
        background: 'var(--fd-surface)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fd-text-secondary)' }}>
          FelizDate
        </p>
        <h1 style={{ margin: 0 }}>Matchboard</h1>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <StatusBadge status={currentStatus} />
        <select
          value={currentStatus}
          onChange={(event) => setStatus({ status: Number(event.target.value) })}
          style={{
            borderRadius: '999px',
            padding: '0.4rem 0.8rem',
            border: '1px solid var(--fd-muted)',
            background: 'var(--fd-surface)',
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Avatar src={profile?.image ?? profile?.microImageUrl} alt={displayName} size={48} />
          <div>
            <strong>{displayName}</strong>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fd-text-secondary)' }}>
              {email}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => logout()} disabled={logoutState.isLoading}>
          Log out
        </Button>
      </div>
    </header>
  );
};


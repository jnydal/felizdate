import { NavLink } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useGetCloseByProfilesQuery } from '@/services/apiSlice';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '🏡' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/search', label: 'Search', icon: '🔍' },
  { to: '/profile', label: 'Profile', icon: '🧬' },
];

export const Sidebar = () => {
  const { data: closeByProfiles } = useGetCloseByProfilesQuery();

  return (
    <aside
      className="fd-sidebar"
      style={{
        width: 260,
        background: 'var(--fd-surface)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        border: '1px solid var(--fd-muted)',
        height: 'fit-content',
        position: 'sticky',
        top: '1.5rem',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'fd-sidebar__link fd-sidebar__link--active' : 'fd-sidebar__link'
            }
            end={link.to === '/'}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: '2rem' }}>
        <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>Nearby matches</p>
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)', fontSize: '0.9rem' }}>
          {closeByProfiles?.length
            ? `${closeByProfiles.length} people within 10km`
            : 'Share your location to unlock geo matches.'}
        </p>
      </div>
      <Button style={{ width: '100%', marginTop: '1.25rem' }}>Boost profile</Button>
    </aside>
  );
};


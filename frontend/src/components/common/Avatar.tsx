type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
};

export const Avatar = ({ src, alt = 'Profile image', size = 48 }: AvatarProps) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      border: '2px solid var(--fd-muted)',
      background: '#e2e8f0',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      color: 'var(--fd-text-secondary)',
      textTransform: 'uppercase',
    }}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      alt.charAt(0)
    )}
  </div>
);


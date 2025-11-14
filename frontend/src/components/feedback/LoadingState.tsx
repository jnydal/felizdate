type LoadingStateProps = {
  message?: string;
  details?: string;
  showSpinner?: boolean;
};

export const LoadingState = ({
  message = 'Loading…',
  details,
  showSpinner = true,
}: LoadingStateProps) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
    }}
  >
    <div className="fd-card" style={{ textAlign: 'center', maxWidth: 420 }}>
      {showSpinner ? (
        <div
          style={{
            width: 48,
            height: 48,
            margin: '0 auto 1rem',
            borderRadius: '50%',
            border: '4px solid #e2e8f0',
            borderTopColor: 'var(--fd-accent)',
            animation: 'fd-spin 1s linear infinite',
          }}
        />
      ) : null}
      <h2 style={{ margin: '0 0 0.5rem' }}>{message}</h2>
      {details ? (
        <p style={{ margin: 0, color: 'var(--fd-text-secondary)' }}>{details}</p>
      ) : null}
    </div>
  </div>
);


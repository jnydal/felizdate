type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  action,
}: ErrorStateProps) => (
  <div className="fd-card" style={{ borderColor: '#fecdd3' }}>
    <h3 style={{ marginTop: 0, color: '#be123c' }}>{title}</h3>
    <p style={{ marginBottom: '1rem', color: 'var(--fd-text-secondary)' }}>
      {description}
    </p>
    {action}
  </div>
);


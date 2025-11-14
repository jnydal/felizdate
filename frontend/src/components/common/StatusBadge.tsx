import clsx from 'clsx';

const STATUS_LABELS: Record<number, string> = {
  0: 'Geo-Online',
  1: 'Online',
  2: 'Away',
  3: 'Invisible',
};

export const StatusBadge = ({ status }: { status?: number }) => {
  const label = STATUS_LABELS[status ?? 1] ?? 'Online';

  return (
    <span
      className={clsx('fd-status', status === 2 && 'fd-status--away', status === 3 && 'fd-status--offline')}
    >
      <span className="fd-status__dot" />
      {label}
    </span>
  );
};


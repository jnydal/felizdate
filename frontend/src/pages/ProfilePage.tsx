import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/common/Button';
import { useReportIssueMutation, useSetPositionMutation } from '@/services/apiSlice';

export const ProfilePage = () => {
  const profile = useAppSelector((state) => state.session.profile);
  const [reportIssue, reportState] = useReportIssueMutation();
  const [setPosition, positionState] = useSetPositionMutation();
  const [issueType, setIssueType] = useState('feature');
  const [issueDescription, setIssueDescription] = useState('');

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await setPosition({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        });
      },
      () => alert('We could not read your location. Please try again.'),
    );
  };

  const handleReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!issueDescription.trim()) {
      return;
    }
    await reportIssue({ type: issueType, description: issueDescription }).unwrap();
    setIssueDescription('');
    alert('Thanks! We received your report.');
  };

  return (
    <div className="fd-grid" style={{ gap: '1.5rem' }}>
      <section className="fd-card">
        <h2 style={{ marginTop: 0 }}>Your profile</h2>
        {profile ? (
          <>
            <p>
              <strong>Name:</strong> {profile.text}
            </p>
            <p>
              <strong>Gender:</strong> {profile.gender}
            </p>
            <p>
              <strong>Location:</strong>{' '}
              {typeof profile.city === 'string'
                ? profile.city
                : profile.city?.name ?? 'Unknown'}
            </p>
            <p>
              <strong>Bio:</strong> {profile.description || 'Add a short introduction.'}
            </p>
            <Button onClick={handleShareLocation} disabled={positionState.isLoading}>
              {positionState.isLoading ? 'Sharing location…' : 'Share current location'}
            </Button>
          </>
        ) : (
          <p>Complete your profile to unlock matchmaking.</p>
        )}
      </section>

      <section className="fd-card">
        <h2 style={{ marginTop: 0 }}>Report an issue</h2>
        <form
          onSubmit={handleReport}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
        >
          <label>
            Type
            <select
              value={issueType}
              onChange={(event) => setIssueType(event.target.value)}
              style={{
                width: '100%',
                borderRadius: '0.85rem',
                border: '1px solid var(--fd-muted)',
                padding: '0.65rem',
              }}
            >
              <option value="feature">Feature request</option>
              <option value="bug">Bug</option>
              <option value="safety">Safety issue</option>
            </select>
          </label>
          <label>
            Description
            <textarea
              value={issueDescription}
              onChange={(event) => setIssueDescription(event.target.value)}
              rows={4}
              style={{
                width: '100%',
                borderRadius: '0.85rem',
                border: '1px solid var(--fd-muted)',
                padding: '0.75rem',
                fontFamily: 'inherit',
              }}
            />
          </label>
          <Button type="submit" disabled={reportState.isLoading}>
            {reportState.isLoading ? 'Sending…' : 'Submit report'}
          </Button>
        </form>
      </section>
    </div>
  );
};


import { useNavigate } from 'react-router-dom';
import { useGetBestMatchesQuery, useGetLatestMessagesQuery } from '@/services/apiSlice';
import { MatchGrid } from '@/components/matches/MatchGrid';
import { MessagePreviewList } from '@/components/messages/MessagePreviewList';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: matches, isLoading: matchesLoading } = useGetBestMatchesQuery();
  const { data: latestMessages } = useGetLatestMessagesQuery();

  const handleOpenConversation = (profileId: number) => {
    navigate(`/messages?profileId=${profileId}`);
  };

  return (
    <div className="fd-grid" style={{ gap: '1.5rem' }}>
      <MatchGrid
        title="Best matches for you"
        profiles={matches?.profiles}
        emptyState={matchesLoading ? 'Loading matches…' : 'Complete your profile to unlock matches.'}
        onOpenProfile={(profile) => handleOpenConversation(profile.id)}
      />
      <MessagePreviewList messages={latestMessages} onOpenConversation={handleOpenConversation} />
    </div>
  );
};


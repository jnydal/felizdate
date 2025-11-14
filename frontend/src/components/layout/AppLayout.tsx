import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

export const AppLayout = () => {
  useRealtimeMessages();

  return (
    <div className="fd-shell">
      <TopNav />
      <div className="fd-shell__body">
        <Sidebar />
        <main className="fd-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


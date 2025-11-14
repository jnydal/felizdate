import { RouterProvider } from 'react-router-dom';
import { appRouter } from './app/router';
import { useAppInit } from './hooks/useAppInit';
import { LoadingState } from './components/feedback/LoadingState';

const App = () => {
  const { bootstrapping, error } = useAppInit();

  if (bootstrapping) {
    return (
      <LoadingState
        message="Spinning up FelizDate…"
        details="Fetching your session and profile data"
      />
    );
  }

  if (error) {
    return (
      <LoadingState
        message="We hit a snag loading FelizDate"
        details={error}
        showSpinner={false}
      />
    );
  }

  return <RouterProvider router={appRouter} />;
};

export default App;


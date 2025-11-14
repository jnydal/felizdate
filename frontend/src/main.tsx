import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProviders } from './app/providers';
import './styles/global.css';

const container = document.getElementById('app');

if (!container) {
  throw new Error('Missing #app root element');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);


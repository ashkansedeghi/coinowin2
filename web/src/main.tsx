import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { initI18n } from '@lib/i18n';
import { UIProvider } from '@context/UIContext';

initI18n();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);

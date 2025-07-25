import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css'; // Ensure global app styles are applied.
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

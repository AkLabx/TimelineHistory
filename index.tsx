import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Identify the root element in the HTML
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create the React root and render the App component wrapped in StrictMode
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

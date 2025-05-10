import React, { useState, useEffect } from 'react';
import ItemList from './components/ItemList';
import './styles/App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>List Manager</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          <span className="theme-toggle-icon">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </header>
      <main>
        <ItemList />
      </main>
    </div>
  );
}

export default App; 
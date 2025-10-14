
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../types';
import { SettingsIcon } from './icons/Icons';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const { history, loadChatFromHistory } = useChat();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const handleHistoryClick = (id: string) => {
    loadChatFromHistory(id);
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-light-content dark:bg-dark-content z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-light-text dark:text-dark-text">History</h2>
          <div className="flex-grow overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-light-text-secondary dark:text-dark-text-secondary">No history yet.</p>
            ) : (
              <ul>
                {history.map(chat => (
                  <li key={chat.id}>
                    <button
                      onClick={() => handleHistoryClick(chat.id)}
                      className="w-full text-left p-2 rounded-md hover:bg-light-background dark:hover:bg-dark-background text-light-text dark:text-dark-text truncate"
                    >
                      {chat.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            {isSettingsVisible ? (
              <ThemeSettings onBack={() => setIsSettingsVisible(false)} />
            ) : (
              <button onClick={() => setIsSettingsVisible(true)} className="flex items-center w-full p-2 rounded-md text-light-text dark:text-dark-text hover:bg-light-background dark:hover:bg-dark-background">
                <SettingsIcon />
                <span className="ml-3">Settings</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const ThemeSettings: React.FC<{onBack: () => void}> = ({onBack}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="p-1 mr-2 text-light-icon dark:text-dark-icon">&larr;</button>
        <h3 className="font-bold text-light-text dark:text-dark-text">Theme</h3>
      </div>
      {(['Light', 'Dark', 'System'] as const).map(t => {
        const value = t.toLowerCase() as Theme;
        return (
          <label key={t} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-light-background dark:hover:bg-dark-background">
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
              className="mr-3"
            />
            <span className="text-light-text dark:text-dark-text">{t}</span>
          </label>
        );
      })}
    </div>
  );
}


export default HistoryPanel;


import React from 'react';
import { useChat } from '../context/ChatContext';
import { MenuIcon, IncognitoIcon, SettingsCogIcon, NewChatIcon, BookmarkIcon, BroomIcon } from './icons/Icons';
import HomeIcon from './HomeIcon';

interface TopAppBarProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onTempChatClick: () => void;
  isTempChatActive: boolean;
  onShowSaveToast: () => void;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ onMenuClick, onSettingsClick, onTempChatClick, isTempChatActive, onShowSaveToast }) => {
  const { tokenCount, clearCurrentChat, saveCurrentChat } = useChat();

  const handleSave = () => {
    saveCurrentChat();
    onShowSaveToast();
  };

  return (
    <header className="flex-shrink-0 h-14 bg-light-background dark:bg-dark-background px-4 flex items-center justify-between border-b border-light-border dark:border-dark-border">
      <div className="flex items-center">
        <a href="https://www.focus-du.xyz/" title="Home" className="p-2 text-light-icon dark:text-dark-icon">
          <HomeIcon />
        </a>
        <button onClick={onMenuClick} className="p-2 text-light-icon dark:text-dark-icon">
          <MenuIcon />
        </button>
      </div>

      <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {tokenCount > 0 && `${tokenCount.toLocaleString()} tokens`}
      </div>

      <div className="flex items-center space-x-1">
        <button onClick={clearCurrentChat} title="New Chat" className="p-2 text-light-icon dark:text-dark-icon">
          <NewChatIcon />
        </button>
        <button onClick={handleSave} title="Save Chat" className="p-2 text-light-icon dark:text-dark-icon">
          <BookmarkIcon />
        </button>
        <button onClick={clearCurrentChat} title="Clear Chat" className="p-2 text-light-icon dark:text-dark-icon">
          <BroomIcon />
        </button>
        <button onClick={onTempChatClick} title="Temporary Chat" className={`p-2 rounded-full transition-colors ${isTempChatActive ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
           <IncognitoIcon className={`transition-colors ${isTempChatActive ? 'text-blue-600 dark:text-blue-400' : 'text-light-icon dark:text-dark-icon'}`} />
        </button>
        <button onClick={onSettingsClick} title="Model Settings" className="p-2 text-light-icon dark:text-dark-icon">
          <SettingsCogIcon />
        </button>
      </div>
    </header>
  );
};

export default TopAppBar;

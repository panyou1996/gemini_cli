
import React, { useState } from 'react';
import TopAppBar from './components/TopAppBar';
import ChatView from './components/ChatView';
import InputBar from './components/InputBar';
import HistoryPanel from './components/HistoryPanel';
import ModelSettingsPanel from './components/ModelSettingsPanel';

const App: React.FC = () => {
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [showTempChatToast, setShowTempChatToast] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isTempChatActive, setIsTempChatActive] = useState(false);

  const handleTempChatClick = () => {
    const newStatus = !isTempChatActive;
    setIsTempChatActive(newStatus);
    if (newStatus) {
      setShowTempChatToast(true);
      setTimeout(() => {
        setShowTempChatToast(false);
      }, 3000);
    }
  };
  
  const handleShowSaveToast = () => {
    setShowSaveToast(true);
    setTimeout(() => {
      setShowSaveToast(false);
    }, 3000);
  };

  return (
    <div className="h-screen w-screen max-w-md mx-auto flex flex-col font-sans bg-light-background dark:bg-dark-background relative overflow-hidden">
      <TopAppBar
        onMenuClick={() => setIsHistoryPanelOpen(true)}
        onSettingsClick={() => setIsSettingsPanelOpen(true)}
        onTempChatClick={handleTempChatClick}
        isTempChatActive={isTempChatActive}
        onShowSaveToast={handleShowSaveToast}
      />
      <ChatView />
      <InputBar />

      <HistoryPanel isOpen={isHistoryPanelOpen} onClose={() => setIsHistoryPanelOpen(false)} />
      <ModelSettingsPanel isOpen={isSettingsPanelOpen} onClose={() => setIsSettingsPanelOpen(false)} />

      {showSaveToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm rounded-full px-4 py-2 shadow-lg transition-opacity duration-300">
          Chat saved to history.
        </div>
      )}

      {showTempChatToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm rounded-full px-4 py-2 shadow-lg transition-opacity duration-300">
          Temporary chat: your conversations will not be saved...
        </div>
      )}
    </div>
  );
};

export default App;

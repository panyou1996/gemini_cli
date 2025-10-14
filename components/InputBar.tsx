
import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { AddIcon, SendIcon, CameraIcon, FileIcon, CloseIcon } from './icons/Icons';

const InputBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const { sendMessage, isLoading } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((prompt.trim() || image) && !isLoading) {
      sendMessage(prompt, image || undefined);
      setPrompt('');
      setImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowAttachmentMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-shrink-0 p-2 border-t border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background">
      {image && (
        <div className="p-2 relative w-24 h-24">
          <img src={image} alt="Preview" className="rounded-lg w-full h-full object-cover"/>
          <button
            onClick={() => setImage(null)}
            className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full p-0.5"
          >
            <CloseIcon />
          </button>
        </div>
      )}
      <div className="flex items-center bg-light-content dark:bg-dark-content rounded-full p-1">
        <div className="relative">
          <button 
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-2 text-light-icon dark:text-dark-icon bg-light-user-bubble dark:bg-dark-user-bubble rounded-full"
          >
            <AddIcon />
          </button>
          {showAttachmentMenu && (
            <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden w-48">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center w-full px-4 py-2 text-left text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                <FileIcon /><span className="ml-3">Select from files</span>
              </button>
              <button className="flex items-center w-full px-4 py-2 text-left text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                <CameraIcon /><span className="ml-3">Take a photo</span>
              </button>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Start typing a prompt"
          className="flex-grow bg-transparent px-4 py-2 text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={(!prompt.trim() && !image) || isLoading}
          className="p-2 rounded-full disabled:opacity-50 enabled:bg-light-user-bubble enabled:dark:bg-dark-user-bubble"
        >
          <SendIcon className={`w-6 h-6 ${(!prompt.trim() && !image) || isLoading ? 'text-light-text-secondary dark:text-dark-text-secondary' : 'text-light-icon dark:text-dark-icon'}`} />
        </button>
      </div>
    </div>
  );
};

export default InputBar;

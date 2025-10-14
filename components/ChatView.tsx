import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Message } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

const ChatView: React.FC = () => {
  const { currentChat, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat]);

  if (currentChat.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <h1 className="text-3xl font-bold text-light-text-secondary dark:text-dark-text-secondary">
          Google AI Studio
        </h1>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-2 space-y-4">
      {currentChat.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {/* This loading indicator is for streaming text, it appears while the last message is being filled */}
      {isLoading && currentChat.length > 0 && currentChat[currentChat.length - 1].role === 'model' && currentChat[currentChat.length - 1].content === '' && !currentChat[currentChat.length - 1].status && <LoadingIndicator />}
    </div>
  );
};

const GeneratingImageIndicator: React.FC<{ message: Message }> = ({ message }) => (
  <div className="flex justify-start">
    <div className="bg-light-model-bubble dark:bg-dark-model-bubble rounded-2xl p-4 flex flex-col items-start space-y-2">
      <p className="text-light-text dark:text-dark-text">{message.content}</p>
      <div className="flex items-center space-x-1.5 self-center">
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  </div>
);


const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  if (message.role === 'model' && message.status === 'generating') {
    return <GeneratingImageIndicator message={message} />;
  }
  
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 text-base ${
          isUser
            ? 'bg-light-user-bubble dark:bg-dark-user-bubble text-light-text dark:text-dark-text'
            : 'bg-light-model-bubble dark:bg-dark-model-bubble text-light-text dark:text-dark-text'
        }`}
      >
        {message.image && <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto" />}
        <MarkdownRenderer content={message.content} />
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-light-model-bubble dark:bg-dark-model-bubble rounded-2xl p-4 flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-light-text-secondary dark:bg-dark-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  </div>
);


export default ChatView;
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Message, Chat, ModelSettings } from '../types';
import { generateContentStream, generateImage, editImage } from '../services/geminiService';

interface ChatContextType {
  history: Chat[];
  currentChat: Message[];
  isLoading: boolean;
  modelSettings: ModelSettings;
  tokenCount: number;
  sendMessage: (prompt: string, image?: string) => Promise<void>;
  clearCurrentChat: () => void;
  loadChatFromHistory: (chatId: string) => void;
  updateModelSettings: (settings: Partial<ModelSettings>) => void;
  saveCurrentChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialModelSettings: ModelSettings = {
  model: 'gemini-2.5-pro',
  systemInstruction: '',
  temperature: 0.7,
  aspectRatio: '1:1',
  outputLength: 1024,
  topP: 0.95,
  topK: 40,
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelSettings, setModelSettings] = useState<ModelSettings>(initialModelSettings);
  const [tokenCount, setTokenCount] = useState(0);

  const updateModelSettings = (settings: Partial<ModelSettings>) => {
    setModelSettings(prev => ({ ...prev, ...settings }));
  };

  const clearCurrentChat = () => {
    setCurrentChat([]);
    setTokenCount(0);
  };

  const loadChatFromHistory = (chatId: string) => {
    const chat = history.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat.messages);
    }
  };
  
  const saveCurrentChat = useCallback(() => {
    if (currentChat.length === 0) {
      return; 
    }
    const newChat: Chat = {
      id: Date.now().toString(),
      title: currentChat.find(m => m.role === 'user')?.content.substring(0, 40) || 'New Chat',
      messages: [...currentChat],
    };
    setHistory(prev => [newChat, ...prev]);
  }, [currentChat]);


  const sendMessage = useCallback(async (prompt: string, image?: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      image,
    };
    
    setIsLoading(true);
    const placeholderMessageId = (Date.now() + 1).toString();

    try {
      if (modelSettings.model === 'imagen-4.0-generate-001') {
        const placeholder: Message = {
          id: placeholderMessageId,
          role: 'model',
          content: 'Generating image, please wait...',
          status: 'generating',
        };
        setCurrentChat(prev => [...prev, userMessage, placeholder]);

        const modelMessage = await generateImage(prompt, modelSettings);
        setCurrentChat(prev =>
          prev.map(msg =>
            msg.id === placeholderMessageId ? { ...modelMessage, id: placeholderMessageId } : msg
          )
        );
        setTokenCount(prev => prev + prompt.length); // Rough estimation

      } else if (modelSettings.model === 'gemini-2.5-flash-image') {
        if (!image) {
          const errorMessage: Message = {
            id: placeholderMessageId,
            role: 'model',
            content: 'The `gemini-2.5-flash-image` model requires an input image for editing. Please attach an image.',
          };
          setCurrentChat(prev => [...prev, userMessage, errorMessage]);
          setIsLoading(false);
          return;
        }
        const placeholder: Message = {
          id: placeholderMessageId,
          role: 'model',
          content: 'Editing image, please wait...',
          status: 'generating',
        };
        setCurrentChat(prev => [...prev, userMessage, placeholder]);

        const modelMessage = await editImage(prompt, modelSettings, image);
        setCurrentChat(prev =>
          prev.map(msg =>
            msg.id === placeholderMessageId ? { ...modelMessage, id: placeholderMessageId } : msg
          )
        );
        setTokenCount(prev => prev + prompt.length + (modelMessage.content?.length || 0));

      } else {
        const modelMessage: Message = {
          id: placeholderMessageId,
          role: 'model',
          content: '',
        };
        setCurrentChat(prev => [...prev, userMessage, modelMessage]);

        const stream = await generateContentStream(prompt, modelSettings, image);
        let fullResponse = '';
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          fullResponse += chunkText;
          setCurrentChat(prev =>
            prev.map(msg =>
              msg.id === modelMessage.id ? { ...msg, content: fullResponse } : msg
            )
          );
        }
        setTokenCount(prev => prev + prompt.length + fullResponse.length);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: Message = {
        id: placeholderMessageId,
        role: 'model',
        content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`,
      };
       setCurrentChat(prev =>
        prev.map(msg => (msg.id === placeholderMessageId ? errorMessage : msg))
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, modelSettings]);

  return (
    <ChatContext.Provider
      value={{
        history,
        currentChat,
        isLoading,
        modelSettings,
        tokenCount,
        sendMessage,
        clearCurrentChat,
        loadChatFromHistory,
        updateModelSettings,
        saveCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

interface ModelSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelSettingsPanel: React.FC<ModelSettingsPanelProps> = ({ isOpen, onClose }) => {
  const { modelSettings, updateModelSettings } = useChat();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
     <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-light-content dark:bg-dark-content z-50 transform transition-transform duration-300 ease-in-out p-4 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <h2 className="text-xl font-bold mb-6 text-light-text dark:text-dark-text">Model Settings</h2>
        
        <div className="space-y-6 text-light-text dark:text-dark-text">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Model</label>
            <select
              value={modelSettings.model}
              onChange={(e) => updateModelSettings({ model: e.target.value as any })}
              className="mt-1 block w-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gemini-2.5-pro">gemini-2.5-pro</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-flash-image">gemini-2.5-flash-image</option>
              <option value="imagen-4.0-generate-001">imagen-4.0-generate-001</option>
            </select>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Choose the model for your task. 'Pro' and 'Flash' are for text/vision, 'Flash-Image' edits images, and 'Imagen' creates new ones.
            </p>
          </div>

          {/* System Instructions */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">System instructions</label>
            <textarea
              rows={4}
              value={modelSettings.systemInstruction}
              onChange={(e) => updateModelSettings({ systemInstruction: e.target.value })}
              className="mt-1 block w-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Provide instructions for the model to follow, like setting a persona or a specific response format.
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Temperature</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={modelSettings.temperature}
                onChange={(e) => updateModelSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm">{modelSettings.temperature.toFixed(1)}</span>
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              Controls randomness. Lower values are more deterministic, while higher values encourage more creative responses.
            </p>
          </div>
          
           {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Aspect ratio</label>
            <select
              value={modelSettings.aspectRatio}
              onChange={(e) => updateModelSettings({ aspectRatio: e.target.value as any })}
              className="mt-1 block w-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1:1">1:1</option>
              <option value="3:4">3:4</option>
              <option value="4:3">4:3</option>
              <option value="9:16">9:16</option>
              <option value="16:9">16:9</option>
            </select>
             <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              (Image models only) Sets the width-to-height ratio for the generated image.
            </p>
          </div>

          {/* Advanced Settings */}
          <div>
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex justify-between items-center w-full font-medium">
              <span>Advanced settings</span>
              <span>{showAdvanced ? '−' : '+'}</span>
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-6 border-t border-light-border dark:border-dark-border pt-4">
                {/* Output Length */}
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Output length</label>
                  <input
                    type="number"
                    value={modelSettings.outputLength}
                    onChange={(e) => updateModelSettings({ outputLength: parseInt(e.target.value, 10) })}
                    className="mt-1 block w-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Maximum number of tokens for the response. A higher limit allows for longer answers.
                  </p>
                </div>
                {/* Top P */}
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Top P</label>
                  <div className="flex items-center space-x-3">
                    <input type="range" min="0" max="1" step="0.05" value={modelSettings.topP} onChange={(e) => updateModelSettings({ topP: parseFloat(e.target.value) })} className="w-full" />
                    <span className="text-sm">{modelSettings.topP.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Controls diversity by sampling from tokens that make up the top % of probability mass.
                  </p>
                </div>
                {/* Top K */}
                <div>
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Top K</label>
                  <div className="flex items-center space-x-3">
                    <input type="range" min="1" max="100" step="1" value={modelSettings.topK} onChange={(e) => updateModelSettings({ topK: parseInt(e.target.value, 10) })} className="w-full" />
                    <span className="text-sm">{modelSettings.topK}</span>
                  </div>
                   <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Controls diversity by limiting sampling to the K most likely next tokens.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModelSettingsPanel;

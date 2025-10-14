import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons/Icons';

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group bg-gray-900 dark:bg-black rounded-lg my-2">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={isCopied ? 'Copied' : 'Copy code'}
      >
        {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
      </button>
      <pre className="p-4 overflow-x-auto text-sm text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    if (!content) return null;

    const elements: React.ReactNode[] = [];
    const lines = content.split('\n');
    
    let inCodeBlock = false;
    let codeBlockContent = '';
    
    let listType: 'ul' | 'ol' | null = null;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
        } else if (listType === 'ol') {
          elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2">{listItems}</ol>);
        }
        listItems = [];
        listType = null;
      }
    };
    
    const processLine = (text: string) => text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          elements.push(<CodeBlock key={`code-${elements.length}`} code={codeBlockContent} />);
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          // Start of code block
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
        continue;
      }
      
      // Regular content processing
      
      // Unordered list: * or •
      if (line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(<li key={`li-${i}`}>{processLine(line.trim().substring(2))}</li>);
        continue;
      }
      
      // Ordered list: 1.
      const olMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (olMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(<li key={`li-${i}`}>{processLine(olMatch[2])}</li>);
        continue;
      }

      // Image: ![alt](src)
      const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
          flushList();
          elements.push(<img key={`img-${i}`} src={imgMatch[2]} alt={imgMatch[1]} className="rounded-lg my-2 max-w-full h-auto" />);
          continue;
      }
      
      flushList();
      elements.push(<p key={`p-${i}`} className="whitespace-pre-wrap">{processLine(line)}</p>);
    }

    flushList(); // Flush any remaining list items

    return elements;
  };

  return <>{renderContent()}</>;
};

export default MarkdownRenderer;
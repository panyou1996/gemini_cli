import React from 'react';
import {
  FiMenu,
  FiShieldOff,
  FiSettings,
  FiPlus,
  FiSend,
  FiCamera,
  FiPaperclip,
  FiX,
  FiFilePlus,
  FiBookmark,
  FiTrash2,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';

// This file now acts as a centralized module for all app icons, using the consistent Feather icon set.
// Each icon is wrapped in a React component to maintain the original interface, allowing props like `className` to be passed.

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiMenu {...props} />;
export const IncognitoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiShieldOff {...props} />;
export const SettingsCogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiSettings {...props} />;
export const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiPlus {...props} />;
export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiSend {...props} />;
export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiSettings {...props} />;
export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiCamera {...props} />;
export const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiPaperclip {...props} />;
export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiX {...props} />;
export const NewChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiFilePlus {...props} />;
export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiBookmark {...props} />;
export const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiTrash2 {...props} />;
export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiCopy {...props} />;
export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FiCheck {...props} />;

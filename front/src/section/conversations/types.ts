export interface ConversationAvatar {
  type: 'initials' | 'icon' | 'image';
  value: string; // initials, icon name, or image URL
  gradient: string; // Tailwind gradient classes
}

export interface Conversation {
  id: string;
  name: string;
  avatar: ConversationAvatar;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  isGroup: boolean;
  userId?: string; // ID du voisin pour les conversations privées
}

export interface ConversationItemProps {
  conversation: Conversation;
  animationDelay: number;
  onClick: () => void;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: string;
    pseudo: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    pseudo: string;
    avatar?: string;
  };
}

export interface ChatProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

export interface User {
  id: string;
  pseudo: string;
  tag: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  rue?: string;
  ville?: string;
  cp?: string;
  isOnline?: boolean;
  createdAt?: string;
}

export interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  currentUserId: string;
}

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUserId: string;
  onSendMessage: (userId: string) => void;
  onAddFriend: (userId: string) => void;
}
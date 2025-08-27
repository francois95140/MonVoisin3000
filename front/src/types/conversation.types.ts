export interface MessageInConversation {
  _id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ConversationData {
  _id: string;
  participant_ids: string[];
  type: 'private' | 'group';
  messages: MessageInConversation[];
  name?: string;
  description?: string;
  avatar?: string;
  adminIds?: string[];
  eventId?: string;
  eventIcon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages {
  conversation: {
    _id: string;
    participant_ids: string[];
    type: 'private' | 'group';
    name?: string;
    description?: string;
    avatar?: string;
    adminIds?: string[];
    createdAt: string;
    updatedAt: string;
  };
  messages: MessageInConversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ConversationListItem {
  conversations: ConversationData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UnreadCount {
  conversationId: string;
  unreadCount: number;
  lastMessage?: MessageInConversation;
}
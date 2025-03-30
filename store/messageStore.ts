import { create } from 'zustand';

// Define message store types
interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

interface Conversation {
  userId: number;
  name: string;
  avatar: string;
  unreadCount: number;
  messages: Message[];
}

interface MessageStore {
  conversations: Conversation[];
  addMessage: (userId: number, message: Omit<Message, 'id'>) => void;
  markAsRead: (userId: number) => void;
}

// Create message store with initial data
export const useMessageStore = create<MessageStore>((set) => ({
  conversations: [
    {
      userId: 2,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
      unreadCount: 2,
      messages: [
        {
          id: 1,
          senderId: 2,
          text: 'Hi there! I saw you\'re traveling to Boston next week.',
          timestamp: '2025-06-10T09:30:00Z',
        },
        {
          id: 2,
          senderId: 1,
          text: 'Yes, I\'m planning to leave on the 15th. Are you interested in joining?',
          timestamp: '2025-06-10T09:35:00Z',
        },
        {
          id: 3,
          senderId: 2,
          text: 'Definitely! I need to be in Boston for a conference. What time are you leaving?',
          timestamp: '2025-06-10T09:40:00Z',
        },
        {
          id: 4,
          senderId: 2,
          text: 'Also, would it be okay if I bring a small suitcase?',
          timestamp: '2025-06-10T09:41:00Z',
        },
      ],
    },
    {
      userId: 3,
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
      unreadCount: 0,
      messages: [
        {
          id: 1,
          senderId: 1,
          text: 'Hey Michael, I\'m interested in your trip to LA. Is there still room?',
          timestamp: '2025-06-08T14:20:00Z',
        },
        {
          id: 2,
          senderId: 3,
          text: 'Hi Alex! Yes, there\'s still room. I\'m taking the coastal train, it\'s quite scenic.',
          timestamp: '2025-06-08T14:25:00Z',
        },
        {
          id: 3,
          senderId: 1,
          text: 'Sounds perfect! I\'d love to join. Should we meet at the station?',
          timestamp: '2025-06-08T14:30:00Z',
        },
        {
          id: 4,
          senderId: 3,
          text: 'Yes, let\'s meet at San Francisco station around 10:00, the train leaves at 10:30.',
          timestamp: '2025-06-08T14:35:00Z',
        },
      ],
    },
  ],
  addMessage: (userId, message) => 
    set((state) => {
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.userId === userId
      );
      
      if (conversationIndex === -1) {
        // Create new conversation if it doesn't exist
        return state;
      }
      
      const updatedConversations = [...state.conversations];
      const conversation = updatedConversations[conversationIndex];
      
      const newMessage = {
        ...message,
        id: conversation.messages.length + 1,
      };
      
      updatedConversations[conversationIndex] = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        unreadCount: message.senderId !== 1 ? conversation.unreadCount + 1 : conversation.unreadCount,
      };
      
      return { conversations: updatedConversations };
    }),
  markAsRead: (userId) =>
    set((state) => {
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.userId === userId
      );
      
      if (conversationIndex === -1) return state;
      
      const updatedConversations = [...state.conversations];
      updatedConversations[conversationIndex] = {
        ...updatedConversations[conversationIndex],
        unreadCount: 0,
      };
      
      return { conversations: updatedConversations };
    }),
}));
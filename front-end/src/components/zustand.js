import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      setNotifications: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),

        // state to red dot to unread messages
      hasUnreadMessages: false,
      setHasUnreadMessages: (value) =>
        set(() => ({
          hasUnreadMessages: value,
        })),
        
        newMessagesArr: [],
        setNewMessagesArr: (messages) =>
        set((state) => ({
          newMessagesArr: [...state.newMessagesArr, messages],
        })),
        // remove id from newMessagesArr
      removeIDNewMessageArr: (id) =>
        set((state) => ({
          newMessagesArr: state.newMessagesArr.filter((messageId) => messageId !== id),
        })),

      clearNotifications: () =>
        set(() => ({
          notifications: [], // Clear all notifications
        })),

      searchedPosts : [],
      setSearchedPosts: (posts) =>
      set(() => ({
        searchedPosts: posts,
      })),

      activeId: null,
      setActiveId: (id) =>
        set(() => ({
          activeId: id,
        })),

      onlineUsers: [],
      setOnlineUsers: (users) =>
        set(() => ({
          onlineUsers: users,
        })),
    }),
    {
      name: 'app-storage', // Key for localStorage
    //   storage: typeof window !== 'undefined' ? localStorage : undefined, // Use localStorage only if available
    }
  )
);

export default useNotificationStore;
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect, useState } from "react";
import type { NotificationBehavior } from "expo-notifications";

export interface NotificationReminder {
  id: string;
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
  days: number[]; // 0-6 (0 = Sunday)
  message: string;
}

interface NotificationContextType {
  reminders: NotificationReminder[];
  isLoading: boolean;
  addReminder: (reminder: Omit<NotificationReminder, "id">) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<NotificationReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const REMINDERS_KEY = "expense_tracker_reminders";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<NotificationReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // Load reminders on mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const data = await AsyncStorage.getItem(REMINDERS_KEY);
        if (data) {
          setReminders(JSON.parse(data));
        }
        // Check permission status
        const permission = await Notifications.getPermissionsAsync();
        setHasPermission(permission.granted);
      } catch (error) {
        console.error("Error loading reminders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReminders();
  }, []);

  // Schedule notifications when reminders change
  useEffect(() => {
    const scheduleNotifications = async () => {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule new notifications
      for (const reminder of reminders) {
        if (!reminder.enabled) continue;

        for (const day of reminder.days) {
          const trigger: any = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: day + 1, // Convert 0-6 to 1-7 (1 = Sunday in Expo)
            hour: reminder.hour,
            minute: reminder.minute,
            repeats: true,
          };

          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Expense Tracker",
                body: reminder.message,
                sound: true,
              },
              trigger,
            });
          } catch (error) {
            console.error("Error scheduling notification:", error);
          }
        }
      }
    };

    if (hasPermission) {
      scheduleNotifications();
    }
  }, [reminders, hasPermission]);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      setHasPermission(permission.granted);
      return permission.granted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const addReminder = async (reminder: Omit<NotificationReminder, "id">) => {
    const newReminder: NotificationReminder = {
      ...reminder,
      id: Date.now().toString(),
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  };

  const updateReminder = async (id: string, updates: Partial<NotificationReminder>) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setReminders(updated);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  };

  const deleteReminder = async (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  };

  return (
    <NotificationContext.Provider
      value={{
        reminders,
        isLoading,
        addReminder,
        updateReminder,
        deleteReminder,
        requestPermissions,
        hasPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

import { AppData, ItineraryItem, ExpenseItem, ChecklistItem } from '../types';

const STORAGE_KEY = 'industrial_travel_app_v1';

const DEFAULT_DATA: AppData = {
  itinerary: [
    { id: '1', date: '2023-11-15', time: '10:00', title: '抵達東京成田', location: 'Narita Airport', type: 'transport' },
    { id: '2', date: '2023-11-15', time: '13:00', title: 'Check-in 飯店', location: 'Shinjuku Hotel', type: 'other' },
    { id: '3', date: '2023-11-15', time: '18:00', title: '燒肉晚餐', location: 'Rokkasen', type: 'food' },
    { id: '4', date: '2023-11-16', time: '09:00', title: '迪士尼樂園', location: 'Tokyo Disneyland', type: 'sightseeing' },
  ],
  expenses: [
    { id: '1', amountJPY: 1500, amountTWD: 315, note: '便利商店', category: 'food', date: new Date().toISOString() },
  ],
  checklist: [
    { id: '1', text: '護照', checked: false, category: 'luggage' },
    { id: '2', text: '日幣現金', checked: true, category: 'luggage' },
    { id: '3', text: '東京香蕉', checked: false, category: 'souvenir' },
  ],
  dayLabels: {
    '2023-11-15': 'Arrival Day',
    '2023-11-16': 'Disney Land'
  }
};

// NOTE: In a real implementation, replace these functions with Firebase Firestore calls.
// Example: db.collection('trips').doc(tripId).set(data);

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    // Backward compatibility for existing data without dayLabels
    if (!data.dayLabels) {
        data.dayLabels = {};
    }
    return data;
  }
  return DEFAULT_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
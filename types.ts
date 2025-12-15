export type ViewState = 'HOME' | 'ITINERARY' | 'EXPENSES' | 'LUGGAGE' | 'SOUVENIRS';

export interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  link?: string;
  type: 'food' | 'sightseeing' | 'transport' | 'shopping' | 'other';
}

export interface ExpenseItem {
  id: string;
  amountJPY: number;
  amountTWD: number;
  note: string;
  category: 'food' | 'shopping' | 'transport' | 'other';
  date: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: 'luggage' | 'souvenir';
}

export interface AppData {
  itinerary: ItineraryItem[];
  expenses: ExpenseItem[];
  checklist: ChecklistItem[];
  dayLabels?: Record<string, string>; // Maps "YYYY-MM-DD" to "Day Name"
}
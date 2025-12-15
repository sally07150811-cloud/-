import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, 
  ShoppingBag, 
  Briefcase, 
  Calculator as CalcIcon, 
  Home as HomeIcon, 
  Trash2, 
  CheckSquare, 
  Square,
  Plane,
  XCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Card, Button, FloatingButton } from './components/UI';
import { Calculator } from './components/Calculator';
import { loadData, saveData, generateId } from './services/storageService';
import { AppData, ViewState, ItineraryItem, ExpenseItem, ChecklistItem } from './types';

// --- Components ---

const Navbar: React.FC<{ 
  currentView: ViewState; 
  onNavigate: (view: ViewState) => void;
  title: string;
}> = ({ currentView, onNavigate, title }) => (
  <div className="sticky top-0 z-40 bg-marble/90 backdrop-blur-md border-b-2 border-black px-4 py-3 flex items-center justify-between">
    {currentView === 'HOME' ? (
      <h1 className="font-display text-2xl tracking-tighter">TRIP<span className="text-ind-orange">.OS</span></h1>
    ) : (
      <div className="flex items-center gap-3">
        <Button variant="icon" onClick={() => onNavigate('HOME')}>
          <HomeIcon size={20} />
        </Button>
        <h1 className="font-display text-xl uppercase">{title}</h1>
      </div>
    )}
    <div className="w-8"></div> {/* Spacer for balance */}
  </div>
);

const HomeView: React.FC<{
  data: AppData;
  onNavigate: (view: ViewState) => void;
}> = ({ data, onNavigate }) => {
  const dateRange = useMemo(() => {
    if (data.itinerary.length === 0) return 'PLAN YOUR TRIP';
    
    // Sort dates to find start and end
    const dates = data.itinerary.map(i => i.date).sort();
    const startStr = dates[0];
    const endStr = dates[dates.length - 1];

    // Helper to format YYYY-MM-DD to MMM DD without timezone issues
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    };

    if (startStr === endStr) return formatDate(startStr);
    return `${formatDate(startStr)} - ${formatDate(endStr)}`;
  }, [data.itinerary]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4 pb-24">
      <Card 
        colSpan={2} 
        title="Current Plan" 
        onClick={() => onNavigate('ITINERARY')}
        highlight
        className="h-48"
      >
        <div className="flex flex-col justify-center h-full">
          <div>
            <div className="text-4xl font-display mb-1">TOKYO</div>
            <div className="text-sm font-bold opacity-80">{dateRange}</div>
          </div>
        </div>
      </Card>

      <Card title="Wallet" onClick={() => onNavigate('EXPENSES')} className="h-40">
        <div className="flex items-center justify-center flex-1">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <div className="text-right font-bold text-xl mt-2">
          ${data.expenses.reduce((acc, curr) => acc + curr.amountTWD, 0).toLocaleString()}
        </div>
      </Card>

      <Card title="Luggage" onClick={() => onNavigate('LUGGAGE')} className="h-40">
         <div className="flex items-center justify-center flex-1">
          <Briefcase size={48} strokeWidth={1.5} />
        </div>
        <div className="text-right font-bold text-sm mt-2">
          {data.checklist.filter(i => i.category === 'luggage' && i.checked).length} / {data.checklist.filter(i => i.category === 'luggage').length}
        </div>
      </Card>

      <Card colSpan={2} title="Souvenirs" onClick={() => onNavigate('SOUVENIRS')} className="h-40">
         <div className="flex items-center justify-center flex-1">
          <Map size={48} strokeWidth={1.5} />
        </div>
      </Card>
    </div>
  );
};

const ItineraryView: React.FC<{
  items: ItineraryItem[];
  dayLabels: Record<string, string>;
  onAdd: (date: string) => void;
  onAddDay: () => void;
  onDeleteDay: (date: string) => void;
  onUpdateLabel: (date: string, label: string) => void;
  onUpdateDate: (oldDate: string, newDate: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: 'title' | 'time' | 'location' | 'link', value: string) => void;
}> = ({ items, dayLabels, onAdd, onAddDay, onDeleteDay, onUpdateLabel, onUpdateDate, onDeleteItem, onUpdateItem }) => {
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(items.map(i => i.date))).sort();
    return dates.length > 0 ? dates : [new Date().toISOString().split('T')[0]];
  }, [items]);

  const [selectedDate, setSelectedDate] = useState(uniqueDates[0]);

  // Ensure selectedDate is valid
  useEffect(() => {
    if (!uniqueDates.includes(selectedDate) && uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  const filteredItems = items
    .filter(i => i.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate && newDate !== selectedDate) {
      onUpdateDate(selectedDate, newDate);
      setSelectedDate(newDate); // Update local state immediately to prevent jumping
    }
  };

  return (
    <div className="p-4 flex flex-col h-full pb-24">
      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-2">
        {uniqueDates.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`
              px-4 py-2 border-2 border-black whitespace-nowrap font-bold shadow-hard-sm transition-all
              ${selectedDate === date ? 'bg-ind-orange text-white -translate-y-1' : 'bg-white text-black'}
            `}
          >
            {date.slice(5)}
          </button>
        ))}
        <button onClick={onAddDay} className="bg-ind-black text-white px-3 border-2 border-black font-bold hover:bg-gray-800 active:scale-95 transition-transform">+</button>
      </div>

      {/* Day Settings / Header */}
      {selectedDate && (
        <div className="flex flex-col gap-3 mb-6 border-b-2 border-black pb-4">
            {/* Top Row: Date Input and Delete */}
            <div className="flex justify-between items-center gap-2">
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="bg-transparent font-bold text-lg focus:outline-none border-b border-transparent focus:border-ind-orange"
                />
                 {uniqueDates.length > 1 && (
                    <Button variant="danger" onClick={() => {
                        if(window.confirm('Delete this entire day and all its events?')) {
                            onDeleteDay(selectedDate);
                        }
                    }}>
                        <Trash2 size={20} />
                    </Button>
                )}
            </div>
            
            {/* Bottom Row: Day Label */}
            <div className="w-full">
                <input 
                    type="text" 
                    value={dayLabels[selectedDate] || ''}
                    placeholder="E.G. DISNEY DAY"
                    onChange={(e) => onUpdateLabel(selectedDate, e.target.value)}
                    className="w-full bg-transparent font-display text-2xl uppercase focus:outline-none placeholder-gray-300 border-b border-gray-200 focus:border-ind-orange"
                />
            </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 space-y-4 relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-black/20"></div>
          {filteredItems.map(item => (
              <div key={item.id} className="flex gap-4 relative group">
                  {/* Custom Time - Shifted right with pl-8 to avoid dot overlap */}
                  <div className="w-24 pl-8 pt-2 text-right">
                       <input 
                          type="text" 
                          value={item.time}
                          placeholder="00:00"
                          onChange={(e) => onUpdateItem(item.id, 'time', e.target.value)}
                          className="w-full text-right text-xs font-bold text-gray-500 font-mono bg-transparent focus:outline-none border-b border-transparent focus:border-ind-orange"
                       />
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[23px] top-3 w-2.5 h-2.5 bg-ind-orange border-2 border-black rounded-full z-10"></div>
                  
                  {/* Content Card */}
                  <div className="flex-1">
                       <Card className="p-3 mb-1 group-hover:shadow-hard-lg transition-shadow">
                          <div className="flex justify-between items-start gap-2">
                              <input 
                                value={item.title}
                                onChange={(e) => onUpdateItem(item.id, 'title', e.target.value)}
                                className="font-bold text-lg leading-tight w-full bg-transparent focus:outline-none focus:border-b-2 focus:border-ind-orange"
                              />
                              <button 
                                onClick={() => onDeleteItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <XCircle size={20} />
                              </button>
                          </div>
                          
                          {/* Location Input */}
                          <div className="mt-2 flex items-center gap-1.5 text-gray-500">
                              <Map size={14} className="shrink-0" /> 
                              <input 
                                value={item.location}
                                placeholder="Add location"
                                onChange={(e) => onUpdateItem(item.id, 'location', e.target.value)}
                                className="text-sm w-full bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-300"
                              />
                          </div>

                          {/* Google Maps Link Input */}
                          <div className="mt-1 flex items-center gap-1.5 text-gray-500">
                              <LinkIcon size={14} className="shrink-0" />
                              <input 
                                value={item.link || ''}
                                placeholder="Paste Google Maps Link"
                                onChange={(e) => onUpdateItem(item.id, 'link', e.target.value)}
                                className="text-sm w-full bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-300 text-ind-orange/80"
                              />
                          </div>
                       </Card>
                  </div>
              </div>
          ))}
          
          <div className="mt-8">
              <Button fullWidth onClick={() => onAdd(selectedDate)}>+ ADD EVENT</Button>
          </div>
      </div>
    </div>
  );
};

const ExpensesView: React.FC<{
  expenses: ExpenseItem[];
  onAdd: (jpy: number, twd: number) => void;
  onDelete: (id: string) => void;
}> = ({ expenses, onAdd, onDelete }) => (
  <div className="p-4 pb-24">
      {/* Top Calculator */}
      <div className="mb-6">
          <Calculator mode="embedded" onSave={onAdd} />
      </div>

      {/* List */}
      <div className="space-y-3">
          <h3 className="font-display text-xl uppercase border-b-2 border-black pb-2 mb-4">History</h3>
          {expenses.map(expense => (
              <div key={expense.id} className="bg-white border-2 border-black p-3 shadow-hard-sm flex justify-between items-center">
                  <div>
                      <div className="font-bold text-lg">{expense.note}</div>
                      <div className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-bold text-ind-orange text-xl">NT$ {expense.amountTWD}</div>
                      <div className="text-xs text-gray-400">¥ {expense.amountJPY}</div>
                  </div>
                  <button onClick={() => onDelete(expense.id)} className="ml-2 text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                  </button>
              </div>
          ))}
      </div>
  </div>
);

const ChecklistView: React.FC<{
  items: ChecklistItem[];
  category: 'luggage' | 'souvenir';
  onToggle: (id: string) => void;
}> = ({ items, category, onToggle }) => (
  <div className="p-4 pb-24">
      <div className="space-y-3">
           {items
              .filter(item => item.category === category)
              .map(item => (
              <div 
                  key={item.id} 
                  onClick={() => onToggle(item.id)}
                  className={`
                      border-2 border-black p-4 flex items-center gap-4 cursor-pointer transition-all
                      ${item.checked ? 'bg-ind-gray opacity-60 shadow-none' : 'bg-white shadow-hard hover:-translate-y-1'}
                  `}
              >
                  {item.checked ? <CheckSquare size={24} className="text-ind-orange" /> : <Square size={24} />}
                  <span className={`font-bold text-lg ${item.checked ? 'line-through decoration-2' : ''}`}>
                      {item.text}
                  </span>
              </div>
           ))}
      </div>
      
      <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto">
           <Button fullWidth>+ ADD ITEM</Button>
      </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [showGlobalCalc, setShowGlobalCalc] = useState(false);
  const [data, setData] = useState<AppData>(loadData());

  // Save on change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // --- Actions ---
  const addItineraryItem = (date: string) => {
    const newItem: ItineraryItem = {
      id: generateId(),
      date,
      time: '12:00',
      title: 'New Activity',
      location: 'TBD',
      type: 'other'
    };
    setData(prev => ({ ...prev, itinerary: [...prev.itinerary, newItem] }));
  };

  const addDay = () => {
    const dates = data.itinerary.map(i => i.date).sort();
    const lastDateStr = dates.length > 0 ? dates[dates.length - 1] : new Date().toISOString().split('T')[0];
    const dateObj = new Date(lastDateStr);
    dateObj.setDate(dateObj.getDate() + 1);
    const newDateStr = dateObj.toISOString().split('T')[0];
    
    // Create a default item for the new day
     const newItem: ItineraryItem = {
      id: generateId(),
      date: newDateStr,
      time: '09:00',
      title: 'Day Start',
      location: '',
      type: 'other'
    };
    setData(prev => ({ ...prev, itinerary: [...prev.itinerary, newItem] }));
  };

  const deleteDay = (date: string) => {
      setData(prev => {
          // Remove all items with this date
          const newItinerary = prev.itinerary.filter(item => item.date !== date);
          
          // Remove label
          const newLabels = { ...prev.dayLabels };
          delete newLabels[date];

          return {
              ...prev,
              itinerary: newItinerary,
              dayLabels: newLabels
          };
      });
  };

  const updateDayLabel = (date: string, label: string) => {
      setData(prev => ({
          ...prev,
          dayLabels: {
              ...prev.dayLabels,
              [date]: label
          }
      }));
  };

  const updateDate = (oldDate: string, newDate: string) => {
      setData(prev => {
          // Update all items for this date
          const newItinerary = prev.itinerary.map(item => 
              item.date === oldDate ? { ...item, date: newDate } : item
          );
          
          // Move the label
          const newLabels = { ...prev.dayLabels };
          if (newLabels[oldDate]) {
              newLabels[newDate] = newLabels[oldDate];
              delete newLabels[oldDate];
          }

          return {
              ...prev,
              itinerary: newItinerary,
              dayLabels: newLabels
          };
      });
  };

  const deleteItineraryItem = (id: string) => {
      setData(prev => ({
          ...prev,
          itinerary: prev.itinerary.filter(i => i.id !== id)
      }));
  };

  const updateItineraryItem = (id: string, field: keyof ItineraryItem, value: string) => {
      setData(prev => ({
          ...prev,
          itinerary: prev.itinerary.map(i => i.id === id ? { ...i, [field]: value } : i)
      }));
  };

  const addExpense = (amountJPY: number, amountTWD: number) => {
    setData(prev => ({
      ...prev,
      expenses: [{
        id: generateId(),
        amountJPY,
        amountTWD,
        category: 'shopping',
        note: '快速記帳',
        date: new Date().toISOString()
      }, ...prev.expenses]
    }));
  };

  const toggleChecklist = (id: string) => {
    setData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    }));
  };

  const deleteExpense = (id: string) => {
      setData(prev => ({...prev, expenses: prev.expenses.filter(e => e.id !== id)}));
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen max-w-md mx-auto bg-marble relative flex flex-col shadow-2xl border-x-2 border-black">
      <Navbar 
        currentView={view} 
        onNavigate={setView} 
        title={view} 
      />

      <div className="flex-1 overflow-y-auto">
        {view === 'HOME' && (
          <HomeView data={data} onNavigate={setView} />
        )}
        {view === 'ITINERARY' && (
          <ItineraryView 
            items={data.itinerary} 
            dayLabels={data.dayLabels || {}}
            onAdd={addItineraryItem} 
            onAddDay={addDay} 
            onDeleteDay={deleteDay}
            onUpdateLabel={updateDayLabel}
            onUpdateDate={updateDate}
            onDeleteItem={deleteItineraryItem}
            onUpdateItem={updateItineraryItem}
          />
        )}
        {view === 'EXPENSES' && (
          <ExpensesView expenses={data.expenses} onAdd={addExpense} onDelete={deleteExpense} />
        )}
        {view === 'LUGGAGE' && (
          <ChecklistView items={data.checklist} category="luggage" onToggle={toggleChecklist} />
        )}
        {view === 'SOUVENIRS' && (
          <ChecklistView items={data.checklist} category="souvenir" onToggle={toggleChecklist} />
        )}
      </div>

      {/* Global Floating Calculator Action */}
      <FloatingButton 
        onClick={() => setShowGlobalCalc(true)} 
        icon={<CalcIcon size={24} className="text-black" />} 
      />

      {/* Global Calculator Overlay */}
      {showGlobalCalc && (
        <Calculator 
            mode="global" 
            onClose={() => setShowGlobalCalc(false)} 
        />
      )}
    </div>
  );
}
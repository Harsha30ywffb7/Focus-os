import React from 'react';
import { FocusProvider, useFocus } from './context/FocusContext';
import { AppWindow } from './components/AppWindow';
import { TodayView } from './views/TodayView';
import { GoalsView } from './views/GoalsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

const ViewRouter = () => {
  const { state } = useFocus();

  switch (state.activeView) {
    case 'today':
      return <TodayView />;
    case 'goals':
      return <GoalsView />;
    case 'vision':
      return <GoalsView />; // Shared view with tab preset in GoalsView
    case 'calendar':
      return <CalendarView />;
    case 'analytics':
      return <AnalyticsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <TodayView />;
  }
};

function App() {
  return (
    <FocusProvider>
      <AppWindow>
        <ViewRouter />
      </AppWindow>
    </FocusProvider>
  );
}

export default App;

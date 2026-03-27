import { Outlet } from 'react-router-dom';
import BottomTab from '../components/ui/BottomTab';
import Headers from '../components/ui/Header';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Header */}
      <Headers />
      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <Outlet />
      </main>
      {/* Bottom Tab */}
      <BottomTab />
    </div>
  );
}
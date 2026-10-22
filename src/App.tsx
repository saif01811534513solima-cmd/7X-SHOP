import React from 'react';
import { useRouter } from './utils/router';
import { UserPanelPage } from './pages/UserPanelPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

export default function App() {
  const { isAdminRoute } = useRouter();

  if (isAdminRoute) {
    return <AdminPanelPage />;
  }

  return <UserPanelPage />;
}

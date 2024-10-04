import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages';
import OrdersPage from './pages/orders';

export default function App() {
  return (
    <Routes>
      <Route path="/" Component={DashboardPage} />
      <Route path="/orders" Component={OrdersPage} />
    </Routes>
  );
}

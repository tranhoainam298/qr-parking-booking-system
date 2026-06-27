import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ParkingSlotManagement from './pages/admin/ParkingSlotManagement'
import AdminParkingHistory from './pages/admin/AdminParkingHistory'
import AdminRechargeHistory from './pages/admin/AdminRechargeHistory'
import FeedbackManagement from './pages/admin/FeedbackManagement'
import HandlerDashboard from './pages/handler/HandlerDashboard'
import ScanQRPage from './pages/handler/ScanQRPage'
import OnsiteBookingPage from './pages/handler/OnsiteBookingPage'
import RechargeWalletPage from './pages/handler/RechargeWalletPage'
import ActiveSessionsPage from './pages/handler/ActiveSessionsPage'
import HandlerHistoryPage from './pages/handler/HandlerHistoryPage'
import UserHomePage from './pages/user/UserHomePage'
import SearchParkingPage from './pages/user/SearchParkingPage'
import SlotSelectionPage from './pages/user/SlotSelectionPage'
import BookingPage from './pages/user/BookingPage'
import QRTicketPage from './pages/user/QRTicketPage'
import WalletPage from './pages/user/WalletPage'
import UserParkingHistoryPage from './pages/user/UserParkingHistoryPage'
import UserRechargeHistoryPage from './pages/user/UserRechargeHistoryPage'
import UserFeedbackPage from './pages/user/UserFeedbackPage'
import MyBookingsPage from './pages/user/MyBookingsPage'
import LoginPage from './pages/auth/LoginPage'
import ProfilePage from './pages/auth/ProfilePage'
import RegisterPage from './pages/auth/RegisterPage'

function PlaceholderPage({ title }) {
  return (
    <section>
      <div className="mb-6"><p className="mb-1 text-sm font-medium text-slate-500">QR Parking Booking System</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h2 className="text-lg font-semibold text-primary">{title}</h2><p className="mt-2 text-slate-500">This page is ready for implementation.</p></div>
    </section>
  )
}

const adminRoutes = [['', 'Dashboard'], ['users', 'User Management'], ['parking-slots', 'Parking Slot Management'], ['parking-history', 'Parking History'], ['recharge-history', 'Recharge History'], ['feedback', 'Feedback'], ['settings', 'Settings']]
const handlerRoutes = [['', 'Dashboard'], ['scan', 'Scan QR Entry/Exit'], ['scan-qr', 'Scan QR Entry/Exit'], ['onsite-booking', 'Onsite Booking'], ['recharge-wallet', 'Recharge User Wallet'], ['active-sessions', 'Active Sessions'], ['parking-history', 'Parking History'], ['recharge-history', 'Recharge History'], ['profile', 'Profile']]
const userRoutes = [['', 'Home'], ['search', 'Search Parking'], ['search-parking', 'Search Parking'], ['slots', 'Slot Selection'], ['slot-selection', 'Slot Selection'], ['book', 'Confirm Booking'], ['booking', 'Confirm Booking'], ['bookings', 'My Bookings'], ['qr-ticket', 'QR Ticket'], ['wallet', 'Wallet & Recharge'], ['parking-history', 'Parking History'], ['recharge-history', 'Recharge History'], ['profile', 'Profile'], ['feedback', 'Feedback']]

function roleRoute(prefix, pages) {
  return (
    <Route path={prefix}>
      {pages.map(([path, title]) => {
        const element = prefix === 'admin' && !path
          ? <AdminDashboard />
          : prefix === 'admin' && path === 'users'
            ? <UserManagement />
            : prefix === 'admin' && path === 'parking-slots'
              ? <ParkingSlotManagement />
              : prefix === 'admin' && path === 'parking-history'
                ? <AdminParkingHistory />
                : prefix === 'admin' && path === 'recharge-history'
                  ? <AdminRechargeHistory />
                  : prefix === 'admin' && path === 'feedback'
                    ? <FeedbackManagement />
                    : prefix === 'handler' && !path
                      ? <HandlerDashboard />
                      : prefix === 'handler' && ['scan', 'scan-qr'].includes(path)
                        ? <ScanQRPage />
                        : prefix === 'handler' && path === 'onsite-booking'
                          ? <OnsiteBookingPage />
                          : prefix === 'handler' && path === 'recharge-wallet'
                            ? <RechargeWalletPage />
                            : prefix === 'handler' && path === 'active-sessions'
                              ? <ActiveSessionsPage />
                              : prefix === 'handler' && path === 'parking-history'
                                ? <HandlerHistoryPage initialTab="parking" />
                                : prefix === 'handler' && path === 'recharge-history'
                                  ? <HandlerHistoryPage initialTab="recharge" />
                                  : prefix === 'user' && !path
                                    ? <UserHomePage />
                                    : prefix === 'user' && ['search', 'search-parking'].includes(path)
                                      ? <SearchParkingPage />
                                      : prefix === 'user' && ['slots', 'slot-selection'].includes(path)
                                        ? <SlotSelectionPage />
                                        : prefix === 'user' && ['book', 'booking'].includes(path)
                                          ? <BookingPage />
                                          : prefix === 'user' && path === 'bookings'
                                            ? <MyBookingsPage />
                                          : prefix === 'user' && path === 'qr-ticket'
                                            ? <QRTicketPage />
                                            : prefix === 'user' && path === 'wallet'
                                              ? <WalletPage />
                                              : prefix === 'user' && path === 'parking-history'
                                                ? <UserParkingHistoryPage />
                                                : prefix === 'user' && path === 'recharge-history'
                                                  ? <UserRechargeHistoryPage />
                                                  : prefix === 'user' && path === 'feedback'
                                                    ? <UserFeedbackPage />
                        : title === 'Profile' ? <ProfilePage /> : <PlaceholderPage title={title} />
        return path ? <Route key={path} path={path} element={element} /> : <Route key="index" index element={element} />
      })}
      {prefix === 'admin' && <Route path="profile" element={<ProfilePage />} />}
    </Route>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<DashboardLayout />}>
        {roleRoute('admin', adminRoutes)}
        {roleRoute('handler', handlerRoutes)}
        {roleRoute('user', userRoutes)}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

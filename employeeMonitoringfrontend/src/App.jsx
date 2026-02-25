import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { TimeTracking } from './pages/TimeTracking';
import { ActivityMonitoring } from './pages/ActivityMonitoring';
import { ScreenshotMonitoring } from './pages/ScreenshotMonitoring';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { Settings } from './pages/Settings';
import { Attendance } from './pages/Attendance';
import { LocationTracking } from './pages/LocationTracking';
import { TasksProjects } from './pages/TasksProjects';
import { Reports } from './pages/Reports';
import { Payroll } from './pages/Payroll';
import { Alerts } from './pages/Alerts';
import { Compliance } from './pages/Compliance';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { RealTimeProvider } from './hooks/RealTimeContext';

function App() {
    return (
        <RealTimeProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />

                    {/* Protected Dashboard Routes */}
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/time-tracking" element={<TimeTracking />} />
                                    <Route path="/attendance" element={<Attendance />} />
                                    <Route path="/activity" element={<ActivityMonitoring />} />
                                    <Route path="/screenshots" element={<ScreenshotMonitoring />} />
                                    <Route path="/location" element={<LocationTracking />} />
                                    <Route path="/tasks" element={<TasksProjects />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/payroll" element={<Payroll />} />
                                    <Route path="/alerts" element={<Alerts />} />
                                    <Route path="/employees" element={<EmployeeManagement />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/compliance" element={<Compliance />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </RealTimeProvider>
    );
}

export default App;

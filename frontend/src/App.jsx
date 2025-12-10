import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import {
    OwnerDashboard,
    StaffDashboard,
    CustomerDashboard,
    ProductListPage,
    OrderListPage
} from './pages/dashboard/Dashboards';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Owner Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['OWNER']}><AppLayout><OwnerDashboard /></AppLayout></ProtectedRoute>}>
                        <Route path="/owner" />
                    </Route>

                    {/* Staff Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['STAFF']}><AppLayout><StaffDashboard /></AppLayout></ProtectedRoute>}>
                        <Route path="/staff" />
                    </Route>

                    {/* Customer Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AppLayout><CustomerDashboard /></AppLayout></ProtectedRoute>}>
                        <Route path="/customer" />
                    </Route>

                    {/* Shared Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['OWNER', 'STAFF', 'CUSTOMER']}><AppLayout /></ProtectedRoute>}>
                        {/* Note: The above wrapper won't render children automatically if we don't nest Routes properly 
                 or use Outlet in AppLayout (which we validated). 
                 But here we are wrapping specific page components. 
                 Better pattern for shared routes:
             */}
                    </Route>

                    {/* A cleaner way with the current ProtectedRoute implementation: */}

                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER', 'STAFF', 'CUSTOMER']}>
                                <AppLayout>
                                    <ProductListPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute allowedRoles={['OWNER', 'STAFF', 'CUSTOMER']}>
                                <AppLayout>
                                    <OrderListPage />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

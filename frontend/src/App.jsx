import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import {
    OwnerDashboard,
    StaffDashboard,
    CustomerDashboard
} from './pages/dashboard/Dashboards';
import ProductListPage from './pages/products/ProductListPage';
import ProductFormPage from './pages/products/ProductFormPage';
import OrderListPage from './pages/orders/OrderListPage';
import PlaceOrderPage from './pages/orders/PlaceOrderPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Owner Routes */}
                    <Route path="/owner" element={
                        <ProtectedRoute allowedRoles={['OWNER']}>
                            <AppLayout><OwnerDashboard /></AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Staff Routes */}
                    <Route path="/staff" element={
                        <ProtectedRoute allowedRoles={['STAFF']}>
                            <AppLayout><StaffDashboard /></AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Customer Routes */}
                    <Route path="/customer" element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                            <AppLayout><CustomerDashboard /></AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Product Routes */}
                    <Route path="/products" element={
                        <ProtectedRoute allowedRoles={['OWNER', 'STAFF', 'CUSTOMER']}>
                            <AppLayout><ProductListPage /></AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/products/new" element={
                        <ProtectedRoute allowedRoles={['OWNER', 'STAFF']}>
                            <AppLayout><ProductFormPage /></AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/products/:id/edit" element={
                        <ProtectedRoute allowedRoles={['OWNER', 'STAFF']}>
                            <AppLayout><ProductFormPage /></AppLayout>
                        </ProtectedRoute>
                    } />

                    {/* Order Routes */}
                    <Route path="/orders" element={
                        <ProtectedRoute allowedRoles={['OWNER', 'STAFF', 'CUSTOMER']}>
                            <AppLayout><OrderListPage /></AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/orders/new" element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                            <AppLayout><PlaceOrderPage /></AppLayout>
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

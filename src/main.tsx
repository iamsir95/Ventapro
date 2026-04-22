import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ProductDetailsPage from './pages/ProductDetailsPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { AboutPage, ContactPage, PolicyPage } from './pages/StaticPages.tsx';
import './index.css';

// Handle OAuth Popup logic - Close popup window and send success to parent
if (window.opener && window.opener !== window) {
  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
  window.close();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policy" element={<PolicyPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

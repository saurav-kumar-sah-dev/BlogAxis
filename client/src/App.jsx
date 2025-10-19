import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Compose from './pages/Compose';
import Edit from './pages/Edit';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import PostDetails from './pages/PostDetails';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Admin from './pages/Admin';
import Moderation from './pages/Moderation';
import AuditTrail from './pages/AuditTrail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/moderation" element={<AdminRoute><Moderation /></AdminRoute>} />
          <Route path="/audit-trail" element={<AdminRoute><AuditTrail /></AdminRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
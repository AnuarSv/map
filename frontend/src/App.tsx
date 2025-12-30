import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home"
import Navbar from "./components/navbar"
import axios from "axios";
import NotFound from "./components/notfound";
import Dashboard from "./pages/dashboard";
import EditorPage from "./pages/expert/EditorPage";
import ReviewPage from "./pages/admin/ReviewPage";

axios.defaults.withCredentials = true;

type UserRole = 'user' | 'expert' | 'admin';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

function App() {

  const [user, setUser] = useState<User | null>(null);
  const [error] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  // Helper to check if user has required role
  const hasRole = (requiredRoles: UserRole[]) => {
    return user && requiredRoles.includes(user.role);
  };

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route path="/login" element={user ? <Navigate to={"/"} /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to={"/"} /> : <Register setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />

        {/* Expert-only routes */}
        <Route
          path="/editor"
          element={hasRole(['expert', 'admin']) ? <EditorPage /> : <Navigate to="/" replace />}
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={hasRole(['admin']) ? <ReviewPage /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

  )
}

export default App;
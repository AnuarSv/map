import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home"
import Navbar from "./components/navbar"
import axios from "axios";
import NotFound from "./components/notfound";
import Dashboard from "./pages/dashboard";

axios.defaults.withCredentials = true;

function App() {

  const [user, setUser] = useState(null);
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
  return <div>Loading...</div>;
}

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route path="/login" element={user ? <Navigate to={"/"} /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to={"/"} /> : <Register setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>

  )
}

export default App;
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar({ user, setUser }: { user: any; setUser: (user: any) => void }) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      navigate("/");
    }
  };
  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        <Link to={"/"} className="font-bold">
          Water Map Kz
        </Link>
        <div>
          {user ? (
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="font-bold mx-2">
                Login
              </Link>
              <Link to="/register" className="font-bold mx-2">
                Sign up
              </Link>
            </>
          )}
      </div>
      </div>
    </nav>
  );
}
export default Navbar;

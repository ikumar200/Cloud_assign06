import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import GoogleLogin from './components/GoogleLogin';
import LogoutButton from './components/LogoutButton';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Home from "./pages/Home";
import SavedRecipes from './pages/SavedRecipes';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          console.log(token);
          const res = await fetch('http://localhost:3000/store_user_data', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: currentUser.email,
              name: currentUser.displayName || 'Anonymous'
            })
          });

          const data = await res.json();
          console.log('Backend Response:', data);
        } catch (err) {
          console.error('Error sending data to backend:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-md space-y-8">
          <AuthForm />
          <hr className="border-gray-300" />
          <GoogleLogin />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Recipe App</div>
          <div className="space-x-4">
            <Link to="/" className="text-blue-500 hover:underline">Home</Link>
            <Link to="/saved" className="text-blue-500 hover:underline">Saved Recipes</Link>
            <LogoutButton />
          </div>
        </nav>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saved" element={<SavedRecipes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

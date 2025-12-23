import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import AnimeList from './pages/AnimeList';
import MangaList from './pages/MangaList';
import ManhwaList from './pages/ManhwaList';
import DetailPage from './pages/DetailPage';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import People from './pages/People';
import Favorites from './pages/Favorites';
import Preferences from './pages/Preferences';
import Login from './pages/Login';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-dark">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/anime" element={<AnimeList />} />
                <Route path="/manga" element={<MangaList />} />
                <Route path="/manhwa" element={<ManhwaList />} />
                <Route path="/:type/:id" element={<DetailPage />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/people" element={<People />} />
              </Routes>
            </main>
          </div>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

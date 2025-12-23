import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Moon, Sun, Bell, User, Heart, Settings, LogIn, LogOut, Users } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, isLoggedIn, currentUser } = useUser();

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('favoriteGenres');
    localStorage.removeItem('watchList');
    localStorage.removeItem('top10Anime');
    localStorage.removeItem('top10Manga');
    localStorage.removeItem('top10Manhwa');
    localStorage.removeItem('genreAnimeList');
    
    // Navigate and reload
    navigate('/login');
    window.location.reload();
  };

  // Determine active tab from current path
  const getActiveTab = () => {
    if (location.pathname.includes('/anime')) return 'anime';
    if (location.pathname.includes('/manga')) return 'manga';
    if (location.pathname.includes('/manhwa')) return 'manhwa';
    return 'anime';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const tabs = [
    { id: 'anime', label: 'Anime', path: '/anime' },
    { id: 'manga', label: 'Manga', path: '/manga' },
    { id: 'manhwa', label: 'Manhwa', path: '/manhwa' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${activeTab}?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
    setIsOpen(false);
  };

  return (
    <nav className="bg-dark-card/90 border-b border-primary/20 sticky top-0 z-50 backdrop-blur-xl shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform animate-glow">
              <span className="text-white font-black text-2xl font-['Orbitron']">AV</span>
            </div>
            <span className="text-2xl font-black text-gradient hidden md:block font-['Orbitron']">
              AnimeVerse
            </span>
          </Link>

          {/* Tabs - Desktop */}
          <div className="hidden md:flex items-center space-x-2 bg-dark/50 backdrop-blur-xl rounded-2xl p-2 border border-primary/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`px-8 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/50'
                    : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime, manga, manhwa..."
                className="w-full bg-dark-lighter/50 backdrop-blur-xl border border-primary/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </form>

          {/* Right Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/people" 
              className="text-gray-400 hover:text-white transition-all p-3 hover:bg-dark-lighter/50 rounded-xl transform hover:scale-110"
              title="Characters & People"
            >
              <Users className="w-6 h-6" />
            </Link>
            <Link 
              to="/favorites" 
              className="relative text-gray-400 hover:text-white transition-all p-3 hover:bg-dark-lighter/50 rounded-xl transform hover:scale-110"
              title="My Favorites"
            >
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link 
              to="/preferences"
              className="text-gray-400 hover:text-white transition-all p-3 hover:bg-dark-lighter/50 rounded-xl transform hover:scale-110"
              title="Preferences"
            >
              <Settings className="w-6 h-6" />
            </Link>
            <Link 
              to="/chat" 
              className="relative text-gray-400 hover:text-white transition-all p-3 hover:bg-dark-lighter/50 rounded-xl transform hover:scale-110"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full animate-pulse"></span>
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile/me" 
                  className="text-gray-400 hover:text-white transition-all p-3 hover:bg-dark-lighter/50 rounded-xl transform hover:scale-110"
                  title="Profile"
                >
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-all p-3 hover:bg-red-500/10 rounded-xl transform hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105 font-bold"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-dark border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </form>
            
            {/* Mobile Tabs */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            {/* Mobile Menu Links */}
            <Link
              to="/people"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Characters & People
            </Link>
            <Link
              to="/favorites"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </Link>
            <Link
              to="/preferences"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Preferences
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile/me"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg flex items-center gap-2 font-medium"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
            )}
            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-dark rounded-lg"
            >
              Chat
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

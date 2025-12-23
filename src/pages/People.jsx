import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopCharacters, searchCharacters, searchUsers, getUserProfile } from '../services/api';
import { Search, ChevronLeft, ChevronRight, User, Users as UsersIcon, Star, Calendar, X } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const People = () => {
  const [activeTab, setActiveTab] = useState('characters');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: [activeTab, page, searchQuery],
    queryFn: async () => {
      if (activeTab === 'users') {
        if (!isLoggedIn) {
          return { data: [] };
        }
        if (searchQuery) {
          try {
            const users = await searchUsers(searchQuery);
            return { data: users };
          } catch (err) {
            console.error('Error searching users:', err);
            throw err;
          }
        }
        return { data: [] };
      } else {
        // Characters tab
        if (searchQuery) {
          return searchCharacters(searchQuery, page);
        }
        return fetchTopCharacters(page);
      }
    },
    keepPreviousData: true,
    enabled: activeTab === 'characters' || (activeTab === 'users' && isLoggedIn),
    retry: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Characters & People</h1>
        <p className="text-gray-400 mb-6">Explore your favorite anime characters and connect with other users</p>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800 mb-6">
          <button
            onClick={() => handleTabChange('characters')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'characters'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Star className="w-5 h-5" />
            Characters
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Users
          </button>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={activeTab === 'characters' ? 'Search characters...' : 'Search users by username or email...'}
              className="w-full bg-dark-lighter border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Characters Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading {activeTab}...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-400 mb-4">{error.message || 'Something went wrong. Please try again.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Reload Page
          </button>
        </div>
      ) : activeTab === 'users' && !isLoggedIn ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <UsersIcon className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-gray-400 mb-6">You need to be logged in to search for other users</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Login Now
          </button>
        </div>
      ) : activeTab === 'users' && searchQuery === '' ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Search className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Search for Users</h3>
          <p className="text-gray-400">Enter a username or email to find other anime and manga fans</p>
        </div>
      ) : (
        <>
          {activeTab === 'characters' ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {data?.data?.map((character) => (
                  <div
                    key={character.mal_id}
                    className="bg-dark-lighter rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-all transform hover:scale-105 cursor-pointer group"
                  >
                    <div className="relative h-72">
                      <img
                        src={character.images?.jpg?.image_url}
                        alt={character.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {character.favorites && (
                        <div className="absolute top-2 right-2 bg-dark/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-white text-xs font-bold">❤️ {character.favorites.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary transition-colors">
                        {character.name}
                      </h3>
                      {character.nicknames?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {character.nicknames[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination && (
                <div className="flex items-center justify-center gap-4 pt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!data.pagination.has_previous_page}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  <span className="text-white font-medium">
                    Page {data.pagination.current_page} of {data.pagination.last_visible_page || 1}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!data.pagination.has_next_page}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 text-lg">No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                data?.data?.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user.username}`)}
                    className="bg-dark-lighter rounded-xl p-6 border border-gray-800 hover:border-primary transition-all transform hover:scale-105 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg group-hover:text-primary transition-colors truncate">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {user.favorites && user.favorites.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-gray-400">
                                {user.favorites.length} favorites
                              </span>
                            </div>
                          )}
                          
                          {user.top10List && user.top10List.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Star className="w-4 h-4 text-primary" />
                              <span className="text-gray-400">
                                {user.top10List.length} in Top 10
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default People;

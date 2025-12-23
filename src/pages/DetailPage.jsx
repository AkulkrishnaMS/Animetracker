import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAnimeById, fetchMangaById, fetchAnimeCharacters, fetchAnimeRecommendations } from '../services/api';
import { Star, Calendar, Tv, Users, Play, Heart, Plus, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';

const DetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWatchListMenu, setShowWatchListMenu] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);
  const dropdownRef = useRef(null);
  const { isLoggedIn, isFavorite, addToFavorites, removeFromFavorites, addToWatchList, getWatchStatus, watchList } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: [type, id],
    queryFn: () => type === 'anime' ? fetchAnimeById(id) : fetchMangaById(id),
  });

  const item = data?.data;

  // Initialize local status when item loads
  useEffect(() => {
    if (item?.mal_id) {
      const status = getWatchStatus(item.mal_id);
      setLocalStatus(status);
      console.log('Initial status loaded:', status);
    }
  }, [item?.mal_id, getWatchStatus]);

  const { data: charactersData } = useQuery({
    queryKey: [type, id, 'characters'],
    queryFn: () => type === 'anime' ? fetchAnimeCharacters(id) : null,
    enabled: type === 'anime',
  });

  const { data: recommendationsData } = useQuery({
    queryKey: [type, id, 'recommendations'],
    queryFn: () => type === 'anime' ? fetchAnimeRecommendations(id) : null,
    enabled: type === 'anime',
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWatchListMenu(false);
      }
    };

    if (showWatchListMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWatchListMenu]);

  // Debug: Log when watchList or item changes
  useEffect(() => {
    if (item?.mal_id) {
      const status = getWatchStatus(item.mal_id);
      console.log('Watch status for', item.title, ':', status);
      console.log('Current watchList:', watchList);
      // Update local status when context changes
      setLocalStatus(status);
    }
  }, [watchList, item, getWatchStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleAddToList = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setShowWatchListMenu(!showWatchListMenu);
  };

  const handleWatchListCategory = (category) => {
    if (item) {
      console.log('Before update - Adding to watchlist:', category, item.title);
      console.log('Before update - Current status:', getWatchStatus(item.mal_id));
      
      // Update local state immediately for instant UI feedback
      setLocalStatus(category);
      addToWatchList(item, category);
      setShowWatchListMenu(false);
      
      // Force check after state update
      setTimeout(() => {
        console.log('After update - New status:', getWatchStatus(item.mal_id));
        console.log('LocalStorage watchList:', localStorage.getItem('watchList'));
      }, 100);
      
      // If logged in, sync with backend
      if (isLoggedIn) {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/user/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ category, anime: item })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Backend sync successful:', data);
        })
        .catch(err => {
          console.error('Failed to sync with backend:', err);
          alert('Warning: Changes saved locally but failed to sync with server');
        });
      }
    }
  };

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (isFavorite(item.mal_id)) {
      removeFromFavorites(item.mal_id);
    } else {
      addToFavorites(item);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = item?.title || 'Check this out!';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title}`,
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(url);
        }
      }
    } else {
      // Fallback to clipboard
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  const currentStatus = localStatus || (item?.mal_id ? getWatchStatus(item.mal_id) : null);
  
  // Determine if it's anime or manga/manhwa
  const isManga = type === 'manga' || item?.type === 'Manga' || item?.type === 'Manhwa' || item?.type === 'Manhua' || item?.type === 'Novel' || item?.type === 'Light Novel';
  
  // Category labels based on type
  const categoryLabels = {
    watching: isManga ? 'Reading' : 'Watching',
    completed: 'Completed',
    planToWatch: isManga ? 'Plan to Read' : 'Plan to Watch',
    onHold: 'On Hold',
    dropped: 'Dropped'
  };
  
  const getDisplayStatus = (status) => {
    if (!status) return null;
    return categoryLabels[status] || status.replace(/([A-Z])/g, ' $1').trim();
  };
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-2xl overflow-visible">
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-2xl overflow-hidden"
          style={{ backgroundImage: `url(${item?.images?.jpg?.large_image_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
        </div>
        
        <div className="relative h-full container mx-auto px-4 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <img
              src={item?.images?.jpg?.large_image_url}
              alt={item?.title}
              className="w-64 h-96 object-cover rounded-xl shadow-2xl hidden md:block"
            />
            
            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                {item?.title}
              </h1>
              {item?.title_english && (
                <p className="text-xl text-gray-300">{item.title_english}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-dark/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg">{item?.score || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-dark/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                  <Users className="w-5 h-5" />
                  <span>{item?.members?.toLocaleString()} members</span>
                </div>
                
                {item?.episodes && (
                  <div className="flex items-center gap-2 bg-dark/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                    <Tv className="w-5 h-5" />
                    <span>{item.episodes} episodes</span>
                  </div>
                )}
                
                {item?.chapters && (
                  <div className="flex items-center gap-2 bg-dark/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                    <Tv className="w-5 h-5" />
                    <span>{item.chapters} chapters</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 relative">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={handleAddToList}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold ${
                      currentStatus ? 'bg-green-600 text-white' : 'bg-primary text-white'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    {currentStatus ? getDisplayStatus(currentStatus) : (isManga ? 'Add to Reading List' : 'Add to List')}
                  </button>
                  
                  {showWatchListMenu && (
                    <div 
                      className="absolute top-full left-0 mt-2 bg-dark-lighter border border-gray-700 rounded-lg shadow-2xl z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                      style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                    >
                      {['watching', 'completed', 'planToWatch', 'onHold', 'dropped'].map(category => {
                        const isCurrentStatus = currentStatus === category;
                        return (
                          <button
                            key={category}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWatchListCategory(category);
                            }}
                            className={`w-full text-left px-4 py-3 transition-colors first:rounded-t-lg last:rounded-b-lg capitalize block ${
                              isCurrentStatus 
                                ? 'bg-primary text-white font-bold' 
                                : 'text-white hover:bg-primary/20'
                            }`}
                          >
                            {isCurrentStatus && '✓ '}{categoryLabels[category]}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                    isFavorite(item?.mal_id) 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(item?.mal_id) ? 'fill-current' : ''}`} />
                </button>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-lighter text-white rounded-lg hover:bg-dark transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {['overview', 'characters', 'reviews', 'related'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{item?.synopsis}</p>
            </div>
            
            {item?.background && (
              <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-4">Background</h2>
                <p className="text-gray-300 leading-relaxed">{item.background}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2">{item?.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2">{item?.status}</span>
                </div>
                {item?.aired?.string && (
                  <div>
                    <span className="text-gray-400">Aired:</span>
                    <span className="text-white ml-2">{item.aired.string}</span>
                  </div>
                )}
                {item?.published?.string && (
                  <div>
                    <span className="text-gray-400">Published:</span>
                    <span className="text-white ml-2">{item.published.string}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white ml-2">{item?.rating}</span>
                </div>
              </div>
            </div>
            
            {item?.genres?.length > 0 && (
              <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {item.genres.map(genre => (
                    <span key={genre.mal_id} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'characters' && type === 'anime' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {charactersData?.data?.slice(0, 12).map(({ character, role }) => (
            <div key={character.mal_id} className="bg-dark-lighter rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-colors">
              <img
                src={character.images?.jpg?.image_url}
                alt={character.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h4 className="font-semibold text-white text-sm line-clamp-2">{character.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="text-center text-gray-400 py-12">
          <p>Reviews feature coming soon!</p>
        </div>
      )}

      {activeTab === 'related' && type === 'anime' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {recommendationsData?.data?.slice(0, 10).map(({ entry }) => (
            <div key={entry.mal_id} className="bg-dark-lighter rounded-xl overflow-hidden border border-gray-800 hover:border-primary transition-colors">
              <img
                src={entry.images?.jpg?.image_url}
                alt={entry.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-3">
                <h4 className="font-semibold text-white text-sm line-clamp-2">{entry.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailPage;

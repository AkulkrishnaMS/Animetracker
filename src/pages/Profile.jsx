import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Edit, Star, Tv, Book, Clock, CheckCircle, XCircle, Heart, Settings, Trophy, Sparkles, List, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import { useQuery } from '@tanstack/react-query';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, favorites, watchList, favoriteGenres, top10Anime, top10Manga, top10Manhwa, genreAnimeList, getGenreAnimeList } = useUser();
  const [top10Tab, setTop10Tab] = useState('anime');
  const [expandedList, setExpandedList] = useState(null);
  const [listTab, setListTab] = useState('anime');
  
  const isOwnProfile = !username || username === currentUser?.username || username === 'me';

  // Fetch other user's profile if viewing someone else
  const { data: otherUserProfile, isLoading, error } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      console.log('Fetching profile for username:', username);
      
      // Find user by username first
      const users = await fetch(`http://localhost:5000/api/user/search?q=${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => res.json());
      
      console.log('Search results:', users);
      
      const user = users.find(u => u.username === username);
      if (!user) {
        console.log('User not found');
        return null;
      }
      
      console.log('Found user ID:', user._id);
      const profile = await getUserProfile(user._id);
      console.log('Profile data received:', profile);
      
      return profile;
    },
    enabled: !isOwnProfile && !!username && !!currentUser
  });

  // Use own data or fetched user data
  const profileData = isOwnProfile ? {
    user: currentUser,
    favorites,
    watchList,
    top10Anime,
    top10Manga,
    top10Manhwa,
    privacy: currentUser?.privacy || { listsPublic: true, favoritesPublic: true, top10Public: true }
  } : {
    user: otherUserProfile,
    favorites: otherUserProfile?.favorites || [],
    watchList: otherUserProfile?.watchList || { watching: [], completed: [], planToWatch: [], onHold: [], dropped: [] },
    top10Anime: otherUserProfile?.top10List?.filter(item => item.type !== 'Manga' && item.type !== 'Manhwa') || [],
    top10Manga: otherUserProfile?.top10List?.filter(item => item.type === 'Manga') || [],
    top10Manhwa: otherUserProfile?.top10List?.filter(item => item.type === 'Manhwa') || [],
    privacy: otherUserProfile?.privacy || { listsPublic: true, favoritesPublic: true, top10Public: true }
  };

  const { user: displayUser, favorites: displayFavorites, watchList: displayWatchList, privacy } = profileData;

  // Calculate stats from actual data
  const stats = {
    animeWatched: displayWatchList.completed.filter(i => 
      i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special'
    ).length,
    mangaRead: displayWatchList.completed.filter(i => 
      i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel' || i.type === 'One-shot' || i.type === 'Doujinshi'
    ).length,
    manhwaRead: displayWatchList.completed.filter(i => 
      i.type === 'Manhwa' || i.type === 'Manhua'
    ).length,
    favorites: displayFavorites.length,
  };

  // Separate list categories for anime, manga, and manhwa
  const animeCategories = [
    { name: 'Watching', count: displayWatchList.watching.filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').length, icon: Tv, color: 'bg-green-500', key: 'watching', type: 'anime' },
    { name: 'Completed', count: displayWatchList.completed.filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').length, icon: CheckCircle, color: 'bg-blue-500', key: 'completed', type: 'anime' },
    { name: 'Plan to Watch', count: displayWatchList.planToWatch.filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').length, icon: Clock, color: 'bg-yellow-500', key: 'planToWatch', type: 'anime' },
    { name: 'On Hold', count: displayWatchList.onHold.filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').length, icon: Clock, color: 'bg-orange-500', key: 'onHold', type: 'anime' },
    { name: 'Dropped', count: displayWatchList.dropped.filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').length, icon: XCircle, color: 'bg-red-500', key: 'dropped', type: 'anime' },
  ];

  const mangaCategories = [
    { name: 'Reading', count: displayWatchList.watching.filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').length, icon: Book, color: 'bg-green-500', key: 'watching', type: 'manga' },
    { name: 'Completed', count: displayWatchList.completed.filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').length, icon: CheckCircle, color: 'bg-blue-500', key: 'completed', type: 'manga' },
    { name: 'Plan to Read', count: displayWatchList.planToWatch.filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').length, icon: Clock, color: 'bg-yellow-500', key: 'planToWatch', type: 'manga' },
    { name: 'On Hold', count: displayWatchList.onHold.filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').length, icon: Clock, color: 'bg-orange-500', key: 'onHold', type: 'manga' },
    { name: 'Dropped', count: displayWatchList.dropped.filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').length, icon: XCircle, color: 'bg-red-500', key: 'dropped', type: 'manga' },
  ];

  const manhwaCategories = [
    { name: 'Reading', count: displayWatchList.watching.filter(i => i.type === 'Manhwa' || i.type === 'Manhua').length, icon: Book, color: 'bg-green-500', key: 'watching', type: 'manhwa' },
    { name: 'Completed', count: displayWatchList.completed.filter(i => i.type === 'Manhwa' || i.type === 'Manhua').length, icon: CheckCircle, color: 'bg-blue-500', key: 'completed', type: 'manhwa' },
    { name: 'Plan to Read', count: displayWatchList.planToWatch.filter(i => i.type === 'Manhwa' || i.type === 'Manhua').length, icon: Clock, color: 'bg-yellow-500', key: 'planToWatch', type: 'manhwa' },
    { name: 'On Hold', count: displayWatchList.onHold.filter(i => i.type === 'Manhwa' || i.type === 'Manhua').length, icon: Clock, color: 'bg-orange-500', key: 'onHold', type: 'manhwa' },
    { name: 'Dropped', count: displayWatchList.dropped.filter(i => i.type === 'Manhwa' || i.type === 'Manhua').length, icon: XCircle, color: 'bg-red-500', key: 'dropped', type: 'manhwa' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isOwnProfile && !otherUserProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">User Not Found</h3>
          <p className="text-gray-400 mb-6">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/people')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Search Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8">
        <div className="flex items-center gap-6">
          <img
            src={displayUser?.avatar || 'https://i.pravatar.cc/300?img=10'}
            alt={displayUser?.username || 'User'}
            className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{displayUser?.username || 'Guest'}</h1>
              {isOwnProfile && (
                <Link 
                  to="/preferences"
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-white" />
                </Link>
              )}
            </div>
            <p className="text-white/80">Member since {currentUser?.joinedDate || new Date().toLocaleDateString()}</p>
            {favoriteGenres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {favoriteGenres.slice(0, 5).map((genre) => (
                  <span key={genre.mal_id} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => {
            setListTab('anime');
            setExpandedList('completed-anime');
            setTimeout(() => {
              document.getElementById('my-lists')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center hover:border-primary transition-all cursor-pointer group"
        >
          <Tv className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-bold text-white">{stats.animeWatched}</h3>
          <p className="text-gray-400 text-sm">Anime Watched</p>
        </div>
        <div 
          onClick={() => {
            setListTab('manga');
            setExpandedList('completed-manga');
            setTimeout(() => {
              document.getElementById('my-lists')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center hover:border-secondary transition-all cursor-pointer group"
        >
          <Book className="w-8 h-8 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-bold text-white">{stats.mangaRead}</h3>
          <p className="text-gray-400 text-sm">Manga Read</p>
        </div>
        <div 
          onClick={() => {
            setListTab('manhwa');
            setExpandedList('completed-manhwa');
            setTimeout(() => {
              document.getElementById('my-lists')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center hover:border-green-500 transition-all cursor-pointer group"
        >
          <Book className="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-bold text-white">{stats.manhwaRead}</h3>
          <p className="text-gray-400 text-sm">Manhwa Read</p>
        </div>
        <div 
          onClick={() => {
            if (isOwnProfile) {
              navigate('/favorites');
            } else {
              setTimeout(() => {
                document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }}
          className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center hover:border-red-500 transition-all cursor-pointer group"
        >
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-bold text-white">{stats.favorites}</h3>
          <p className="text-gray-400 text-sm">Favorites</p>
        </div>
      </div>

      {/* My Lists Section with Tabs */}
      <div id="my-lists" className="space-y-6">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <List className="w-8 h-8 text-primary" />
          My Lists
        </h2>

        {!isOwnProfile && !privacy?.listsPublic ? (
          <div className="bg-dark-lighter rounded-xl p-12 border border-gray-800 text-center">
            <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Lists are Private</h3>
            <p className="text-gray-400">This user has set their lists to private</p>
          </div>
        ) : (
          <>
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 bg-secondary/30 p-1.5 rounded-lg w-fit">
          <button
            onClick={() => setListTab('anime')}
            className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
              listTab === 'anime'
                ? 'bg-primary text-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              Anime
            </div>
          </button>
          <button
            onClick={() => setListTab('manga')}
            className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
              listTab === 'manga'
                ? 'bg-primary text-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Manga
            </div>
          </button>
          <button
            onClick={() => setListTab('manhwa')}
            className={`px-6 py-2.5 rounded-md font-semibold transition-all ${
              listTab === 'manhwa'
                ? 'bg-primary text-dark'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Manhwa
            </div>
          </button>
        </div>

        {/* Anime Lists */}
        {listTab === 'anime' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animeCategories.map((category) => (
                <div
                  key={category.name + '-anime'}
                  onClick={() => setExpandedList(expandedList === `${category.key}-anime` ? null : `${category.key}-anime`)}
                  className="bg-dark-lighter rounded-xl p-6 border border-gray-800 hover:border-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${category.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{category.count}</h3>
                      <p className="text-gray-400">{category.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Expanded Anime List View */}
            {expandedList && expandedList.includes('-anime') && (
              <div className="mt-6 bg-dark-lighter rounded-xl p-6 border border-primary">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white capitalize">
                    {animeCategories.find(c => `${c.key}-anime` === expandedList)?.name} ({animeCategories.find(c => `${c.key}-anime` === expandedList)?.count})
                  </h3>
                  <button
                    onClick={() => setExpandedList(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {animeCategories.find(c => `${c.key}-anime` === expandedList)?.count === 0 ? (
                  <p className="text-gray-400 text-center py-8">No anime in this list yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {displayWatchList[expandedList.replace('-anime', '')].filter(i => i.type === 'TV' || i.type === 'Movie' || i.type === 'OVA' || i.type === 'ONA' || i.type === 'Special').map((item) => (
                      <div
                        key={item.mal_id}
                        onClick={() => navigate(`/detail/anime/${item.mal_id}`)}
                        className="cursor-pointer group"
                      >
                        <Card item={item} readOnly={!isOwnProfile} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manga Lists */}
        {listTab === 'manga' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mangaCategories.map((category) => (
                <div
                  key={category.name + '-manga'}
                  onClick={() => setExpandedList(expandedList === `${category.key}-manga` ? null : `${category.key}-manga`)}
                  className="bg-dark-lighter rounded-xl p-6 border border-gray-800 hover:border-secondary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${category.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{category.count}</h3>
                      <p className="text-gray-400">{category.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Expanded Manga List View */}
            {expandedList && expandedList.includes('-manga') && (
              <div className="mt-6 bg-dark-lighter rounded-xl p-6 border border-secondary">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white capitalize">
                    {mangaCategories.find(c => `${c.key}-manga` === expandedList)?.name} ({mangaCategories.find(c => `${c.key}-manga` === expandedList)?.count})
                  </h3>
                  <button
                    onClick={() => setExpandedList(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {mangaCategories.find(c => `${c.key}-manga` === expandedList)?.count === 0 ? (
                  <p className="text-gray-400 text-center py-8">No manga in this list yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {displayWatchList[expandedList.replace('-manga', '')].filter(i => i.type === 'Manga' || i.type === 'Novel' || i.type === 'Light Novel').map((item) => (
                      <div
                        key={item.mal_id}
                        onClick={() => navigate(`/detail/manga/${item.mal_id}`)}
                        className="cursor-pointer group"
                      >
                        <Card item={item} readOnly={!isOwnProfile} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manhwa Lists */}
        {listTab === 'manhwa' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {manhwaCategories.map((category) => (
                <div
                  key={category.name + '-manhwa'}
                  onClick={() => setExpandedList(expandedList === `${category.key}-manhwa` ? null : `${category.key}-manhwa`)}
                  className="bg-dark-lighter rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${category.color} rounded-lg group-hover:scale-110 transition-transform`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{category.count}</h3>
                      <p className="text-gray-400">{category.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Expanded Manhwa List View */}
            {expandedList && expandedList.includes('-manhwa') && (
              <div className="mt-6 bg-dark-lighter rounded-xl p-6 border border-green-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white capitalize">
                    {manhwaCategories.find(c => `${c.key}-manhwa` === expandedList)?.name} ({manhwaCategories.find(c => `${c.key}-manhwa` === expandedList)?.count})
                  </h3>
                  <button
                    onClick={() => setExpandedList(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {manhwaCategories.find(c => `${c.key}-manhwa` === expandedList)?.count === 0 ? (
                  <p className="text-gray-400 text-center py-8">No manhwa in this list yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {displayWatchList[expandedList.replace('-manhwa', '')].filter(i => i.type === 'Manhwa' || i.type === 'Manhua').map((item) => (
                      <div
                        key={item.mal_id}
                        onClick={() => navigate(`/detail/manga/${item.mal_id}`)}
                        className="cursor-pointer group"
                      >
                        <Card item={item} readOnly={!isOwnProfile} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Activity / Favorites */}
      <div className="space-y-8">
        {/* Top 10 All-Time Favorites */}
        {!isOwnProfile && !privacy?.top10Public ? (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-12 border-2 border-yellow-500/30 text-center">
            <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Top 10 is Private</h3>
            <p className="text-gray-400">This user has set their top 10 list to private</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border-2 border-yellow-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                My Top 10 All-Time Favorites
              </h3>
              {isOwnProfile && (
                <Link 
                  to="/preferences"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2"
                >
                  Edit List →
                </Link>
              )}
            </div>
          {/* Top 10 Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg">
            <button
              onClick={() => setTop10Tab('anime')}
              className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                top10Tab === 'anime'
                  ? 'bg-yellow-500 text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Anime ({top10Anime.length})
            </button>
            <button
              onClick={() => setTop10Tab('manga')}
              className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                top10Tab === 'manga'
                  ? 'bg-yellow-500 text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Manga ({top10Manga.length})
            </button>
            <button
              onClick={() => setTop10Tab('manhwa')}
              className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                top10Tab === 'manhwa'
                  ? 'bg-yellow-500 text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Manhwa ({top10Manhwa.length})
            </button>
          </div>
          
          {(() => {
            const currentList = top10Tab === 'anime' ? top10Anime : top10Tab === 'manga' ? top10Manga : top10Manhwa;
            
            if (currentList.length === 0) {
              return (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No {top10Tab} in your top 10 yet!</p>
                  {isOwnProfile && (
                    <Link
                      to="/preferences"
                      className="inline-block mt-4 px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition-all font-semibold"
                    >
                      Add to Your Top 10
                    </Link>
                  )}
                </div>
              );
            }
            
            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {currentList.sort((a, b) => a.rank - b.rank).map((item) => (
                <Link
                  key={item.mal_id}
                  to={`/anime/${item.mal_id}`}
                  className="relative group"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-2 left-2 z-10 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-slate-900">
                      {item.rank}
                    </span>
                  </div>
                  
                  {/* Image */}
                  <img
                    src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-lg border-2 border-yellow-500/30 group-hover:border-yellow-500 transition-all"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-4">
                    <h4 className="text-white font-bold text-center mb-2 line-clamp-2">
                      {item.title}
                    </h4>
                    {item.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold">{item.score}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            );
          })()}
          </div>
        )}

        {/* Genre-Specific Favorite Anime */}
        {favoriteGenres.length > 0 && (
          <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Favorite Anime by Genre
              </h3>
              {isOwnProfile && (
                <Link 
                  to="/preferences"
                  className="text-primary hover:text-primary/80 font-semibold"
                >
                  Manage →
                </Link>
              )}
            </div>
            
            <div className="space-y-6">
              {favoriteGenres.map((genre) => {
                const genreList = getGenreAnimeList(genre.mal_id);
                if (genreList.length === 0) return null;
                
                return (
                  <div key={genre.mal_id}>
                    <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      {genre.name}
                      <span className="text-sm text-gray-400 font-normal">
                        ({genreList.length} anime)
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {genreList.slice(0, 6).map((anime) => (
                        <Link
                          key={anime.mal_id}
                          to={`/anime/${anime.mal_id}`}
                          className="relative group"
                        >
                          <img
                            src={anime.images.jpg.large_image_url}
                            alt={anime.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                            <p className="text-white text-sm font-semibold text-center line-clamp-3">
                              {anime.title}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {genreList.length > 6 && (
                      <Link
                        to="/preferences"
                        className="inline-block mt-2 text-primary hover:text-primary/80 text-sm font-semibold"
                      >
                        View all {genreList.length} {genre.name} anime →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Favorite Anime */}
        <div id="favorites-section" className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Favorite Anime & Manga
            </h3>
            {isOwnProfile && (
              <Link 
                to="/favorites"
                className="text-primary hover:text-primary/80 font-semibold"
              >
                View All →
              </Link>
            )}
          </div>
          
          {!isOwnProfile && !privacy?.favoritesPublic ? (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Favorites are Private</h3>
              <p className="text-gray-400">This user has set their favorites to private</p>
            </div>
          ) : displayFavorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No favorites added yet</p>
              {isOwnProfile && (
                <Link
                  to="/anime"
                  className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Anime
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayFavorites.slice(0, 6).map((item) => (
                <Card key={item.mal_id} item={item} type={item.type === 'Manga' ? 'manga' : 'anime'} readOnly={!isOwnProfile} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {watchList.watching.slice(0, 5).map((item) => (
              <div key={item.mal_id} className="flex items-center gap-4 p-3 bg-dark rounded-lg">
                <img 
                  src={item.images?.jpg?.image_url} 
                  alt={item.title} 
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-400">Currently watching</p>
                </div>
              </div>
            ))}
            {watchList.watching.length === 0 && (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

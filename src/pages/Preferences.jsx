import { useQuery } from '@tanstack/react-query';
import { fetchAnimeGenres, searchAnime, fetchTopAnime, fetchTopManga, fetchTopManhwa } from '../services/api';
import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import { Sparkles, Check, TrendingUp, Trophy, Search, X, Plus, Heart, Settings } from 'lucide-react';
import { useState } from 'react';

const Preferences = () => {
  const { 
    favoriteGenres, 
    toggleGenre, 
    isGenreFavorite, 
    top10Anime,
    top10Manga,
    top10Manhwa,
    addToTop10, 
    removeFromTop10,
    addAnimeToGenre,
    removeAnimeFromGenre,
    getGenreAnimeList,
    isAnimeInGenre,
    currentUser,
    updatePrivacySettings
  } = useUser();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState('genres');
  const [top10Tab, setTop10Tab] = useState('anime'); // For top 10 sub-tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGenreForSearch, setSelectedGenreForSearch] = useState(null);
  const [privacy, setPrivacy] = useState({
    listsPublic: currentUser?.privacy?.listsPublic ?? true,
    favoritesPublic: currentUser?.privacy?.favoritesPublic ?? true,
    top10Public: currentUser?.privacy?.top10Public ?? true
  });

  const { data: genresData, isLoading } = useQuery({
    queryKey: ['animeGenres'],
    queryFn: fetchAnimeGenres,
  });

  const { data: topAnimeData } = useQuery({
    queryKey: ['topAnimeSuggestions'],
    queryFn: () => fetchTopAnime(1),
  });

  const { data: topMangaData } = useQuery({
    queryKey: ['topMangaSuggestions'],
    queryFn: () => fetchTopManga(1),
  });

  const { data: topManhwaData } = useQuery({
    queryKey: ['topManhwaSuggestions'],
    queryFn: () => fetchTopManhwa(1),
  });

  const { data: recommendationsData, isLoading: loadingRecs } = useQuery({
    queryKey: ['recommendations', favoriteGenres],
    queryFn: async () => {
      if (favoriteGenres.length === 0) return null;
      const genre = favoriteGenres[0];
      return await searchAnime('', 1, { genres: genre.mal_id, order_by: 'score', sort: 'desc' });
    },
    enabled: showRecommendations && favoriteGenres.length > 0,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() && selectedGenreForSearch) {
      const results = await searchAnime(searchQuery, 1, { 
        genres: selectedGenreForSearch.mal_id 
      });
      setSearchResults(results.data || []);
    }
  };

  const handleAddToGenre = (anime) => {
    if (selectedGenreForSearch) {
      addAnimeToGenre(selectedGenreForSearch.mal_id, anime);
    }
  };

  const handleAddToTop10 = (anime, type = 'anime') => {
    const currentList = type === 'anime' ? top10Anime : type === 'manga' ? top10Manga : top10Manhwa;
    if (currentList.length < 10) {
      const nextRank = currentList.length + 1;
      addToTop10(anime, nextRank, type);
    } else {
      alert(`Your top 10 ${type} list is full! Remove one first.`);
    }
  };

  const handleGenreClick = (genre) => {
    toggleGenre(genre);
  };

  const handlePrivacyChange = async (setting, value) => {
    const newPrivacy = { ...privacy, [setting]: value };
    setPrivacy(newPrivacy);
    await updatePrivacySettings(newPrivacy);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Your Anime Preferences
          </h1>
          <p className="text-slate-300">Customize your anime experience</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('genres')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'genres'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Genre Favorites
          </button>
          <button
            onClick={() => setActiveTab('top10')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'top10'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Top 10 All Time
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Privacy Settings
          </button>
        </div>

        {/* Privacy Settings Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Privacy Settings</h2>
            <p className="text-slate-300 mb-6">Control what other users can see on your profile</p>
            
            <div className="space-y-4">
              {/* Lists Privacy */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-white">My Lists</h3>
                  <p className="text-sm text-slate-400">Show watching, completed, and other lists</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('listsPublic', !privacy.listsPublic)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    privacy.listsPublic
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {privacy.listsPublic ? '🌍 Public' : '🔒 Private'}
                </button>
              </div>

              {/* Favorites Privacy */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-white">Favorites</h3>
                  <p className="text-sm text-slate-400">Show favorite anime and manga</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('favoritesPublic', !privacy.favoritesPublic)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    privacy.favoritesPublic
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {privacy.favoritesPublic ? '🌍 Public' : '🔒 Private'}
                </button>
              </div>

              {/* Top 10 Privacy */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-white">Top 10 All Time</h3>
                  <p className="text-sm text-slate-400">Show your top 10 favorites</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('top10Public', !privacy.top10Public)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    privacy.top10Public
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {privacy.top10Public ? '🌍 Public' : '🔒 Private'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Section */}
        {activeTab === 'top10' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-purple-400" />
                Add Anime to Your Top 10
              </h2>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anime..."
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  Search
                </button>
              </form>
              <p className="text-slate-400 text-sm mt-2">
                {top10Anime.length}/10 anime, {top10Manga.length}/10 manga, {top10Manhwa.length}/10 manhwa
              </p>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Search Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {searchResults.slice(0, 10).map((anime) => {
                    const itemType = anime.type === 'Manga' || anime.type === 'Manhwa' ? (anime.type === 'Manhwa' ? 'manhwa' : 'manga') : 'anime';
                    const currentList = itemType === 'anime' ? top10Anime : itemType === 'manga' ? top10Manga : top10Manhwa;
                    const isInTop10 = currentList.some(item => item.mal_id === anime.mal_id);
                    return (
                      <div key={anime.mal_id} className="relative group">
                        <img
                          src={anime.images.jpg.large_image_url}
                          alt={anime.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          {isInTop10 ? (
                            <div className="text-green-400 font-semibold">
                              <Check className="w-8 h-8 mx-auto mb-1" />
                              In Top 10
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToTop10(anime, itemType)}
                              disabled={currentList.length >= 10}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                        <p className="text-white text-sm mt-2 line-clamp-2">{anime.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Top 10 List with Tabs */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Your Top 10 All-Time Favorites
              </h2>
              
              {/* Top 10 Sub-tabs */}
              <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg">
                <button
                  onClick={() => setTop10Tab('anime')}
                  className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                    top10Tab === 'anime'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Anime ({top10Anime.length}/10)
                </button>
                <button
                  onClick={() => setTop10Tab('manga')}
                  className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                    top10Tab === 'manga'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Manga ({top10Manga.length}/10)
                </button>
                <button
                  onClick={() => setTop10Tab('manhwa')}
                  className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
                    top10Tab === 'manhwa'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Manhwa ({top10Manhwa.length}/10)
                </button>
              </div>

              {/* Top 10 List Content */}
              {(() => {
                const currentList = top10Tab === 'anime' ? top10Anime : top10Tab === 'manga' ? top10Manga : top10Manhwa;
                
                if (currentList.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Your top 10 {top10Tab} list is empty!</p>
                      <p className="text-slate-500 text-sm mt-2">Add {top10Tab} from the browse pages using the trophy icon</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {currentList.sort((a, b) => a.rank - b.rank).map((item) => (
                      <div
                        key={item.mal_id}
                        className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all"
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold text-slate-900">
                            {item.rank}
                          </span>
                        </div>

                        {/* Image */}
                        <img
                          src={item.images.jpg.image_url}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{item.title}</h3>
                          <p className="text-slate-400 text-sm">
                            {item.type} • Score: {item.score || 'N/A'}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromTop10(item.mal_id, top10Tab)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Remove from top 10"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Popular Suggestions */}
            {(() => {
              const currentData = top10Tab === 'anime' ? topAnimeData : top10Tab === 'manga' ? topMangaData : topManhwaData;
              const currentList = top10Tab === 'anime' ? top10Anime : top10Tab === 'manga' ? top10Manga : top10Manhwa;
              
              if (!currentData) return null;
              
              return (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Popular {top10Tab.charAt(0).toUpperCase() + top10Tab.slice(1)} Suggestions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {currentData.data.slice(0, 10).map((item) => {
                      const isInTop10 = currentList.some(i => i.mal_id === item.mal_id);
                      return (
                        <div key={item.mal_id} className="relative group">
                          <img
                            src={item.images.jpg.large_image_url}
                            alt={item.title}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            {isInTop10 ? (
                              <div className="text-green-400 font-semibold">
                                <Check className="w-8 h-8 mx-auto mb-1" />
                                In Top 10
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToTop10(item, top10Tab)}
                                disabled={currentList.length >= 10}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            )}
                          </div>
                          <p className="text-white text-sm mt-2 line-clamp-2">{item.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Genres Section */}
        {activeTab === 'genres' && (
          <div className="space-y-6">
            {/* Genres Grid */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Select Your Favorite Genres</h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {genresData?.data?.map((genre) => {
                    const isSelected = isGenreFavorite(genre.mal_id);
                    return (
                      <button
                        key={genre.mal_id}
                        onClick={() => handleGenreClick(genre)}
                        className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          {isSelected && (
                            <Check className="w-5 h-5 absolute top-2 right-2" />
                          )}
                          <span className="font-semibold text-center">{genre.name}</span>
                          <span className="text-xs opacity-75">{genre.count} anime</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Genre-Specific Anime Lists */}
            {favoriteGenres.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-8 h-8 text-pink-400" />
                  Your Favorite Anime by Genre
                </h2>
                
                {favoriteGenres.map((genre) => {
                  const genreAnimeList = getGenreAnimeList(genre.mal_id);
                  return (
                    <div key={genre.mal_id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
                      {/* Genre Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          {genre.name}
                          <span className="text-sm text-slate-400 font-normal">
                            ({genreAnimeList.length} anime)
                          </span>
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedGenreForSearch(genre);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Anime
                        </button>
                      </div>

                      {/* Anime List */}
                      {genreAnimeList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                          {genreAnimeList.map((anime) => (
                            <div key={anime.mal_id} className="relative group">
                              <img
                                src={anime.images.jpg.large_image_url}
                                alt={anime.title}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeAnimeFromGenre(genre.mal_id, anime.mal_id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-3">
                                <p className="text-white text-sm font-semibold line-clamp-2">{anime.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <p>No anime added yet. Click "Add Anime" to add your favorites!</p>
                        </div>
                      )}

                      {/* Search for this genre */}
                      {selectedGenreForSearch?.mal_id === genre.mal_id && (
                        <div className="mt-4 space-y-4">
                          <form onSubmit={handleSearch} className="flex gap-3">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={`Search ${genre.name} anime...`}
                              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              type="submit"
                              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                            >
                              Search
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGenreForSearch(null);
                                setSearchResults([]);
                                setSearchQuery('');
                              }}
                              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </form>

                          {/* Search Results for this genre */}
                          {searchResults.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {searchResults.slice(0, 12).map((anime) => {
                                const inGenre = isAnimeInGenre(genre.mal_id, anime.mal_id);
                                return (
                                  <div key={anime.mal_id} className="relative group">
                                    <img
                                      src={anime.images.jpg.large_image_url}
                                      alt={anime.title}
                                      className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                      {inGenre ? (
                                        <div className="text-green-400 font-semibold">
                                          <Check className="w-8 h-8 mx-auto mb-1" />
                                          Added
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleAddToGenre(anime)}
                                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2"
                                        >
                                          <Plus className="w-4 h-4" />
                                          Add
                                        </button>
                                      )}
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-2">
                                      <p className="text-white text-xs line-clamp-2">{anime.title}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prompt to select genres if none selected */}
            {favoriteGenres.length === 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/20 text-center">
                <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No Genres Selected</h3>
                <p className="text-slate-400">Select your favorite genres above to start adding your favorite anime for each genre!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Preferences;

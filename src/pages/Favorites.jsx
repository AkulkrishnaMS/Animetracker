import { useUser } from '../contexts/UserContext';
import Card from '../components/common/Card';
import { Heart, Trash2, Filter } from 'lucide-react';
import { useState } from 'react';

const Favorites = () => {
  const { favorites, removeFromFavorites } = useUser();
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');

  const filteredFavorites = favorites.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'anime') return item.type !== 'Manga' && item.type !== 'Manhwa';
    if (filterType === 'manga') return item.type === 'Manga' || item.type === 'Manhwa';
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    if (sortBy === 'addedAt') {
      return new Date(b.addedAt) - new Date(a.addedAt);
    }
    if (sortBy === 'score') {
      return (b.score || 0) - (a.score || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-400">
            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'} added
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-dark-lighter border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">All Types</option>
            <option value="anime">Anime Only</option>
            <option value="manga">Manga/Manhwa Only</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-lighter border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="addedAt">Recently Added</option>
            <option value="score">Highest Score</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-dark-lighter rounded-2xl p-12 border border-gray-800 max-w-2xl mx-auto">
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">No Favorites Yet</h2>
            <p className="text-gray-400 text-lg mb-8">
              Start adding anime and manga to your favorites by clicking the heart icon on any card!
            </p>
            <a
              href="/anime"
              className="inline-block px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Browse Anime
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Favorites Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedFavorites.map((item) => (
              <div key={item.mal_id} className="relative group">
                <Card item={item} type={item.type === 'Manga' ? 'manga' : 'anime'} />
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromFavorites(item.mal_id)}
                  className="absolute top-2 left-2 p-2 bg-red-500/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center">
              <h3 className="text-3xl font-bold text-white">{favorites.length}</h3>
              <p className="text-gray-400 text-sm">Total Favorites</p>
            </div>
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center">
              <h3 className="text-3xl font-bold text-white">
                {favorites.filter(f => f.type !== 'Manga' && f.type !== 'Manhwa').length}
              </h3>
              <p className="text-gray-400 text-sm">Anime</p>
            </div>
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center">
              <h3 className="text-3xl font-bold text-white">
                {favorites.filter(f => f.type === 'Manga' || f.type === 'Manhwa').length}
              </h3>
              <p className="text-gray-400 text-sm">Manga/Manhwa</p>
            </div>
            <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800 text-center">
              <h3 className="text-3xl font-bold text-white">
                {(favorites.reduce((sum, f) => sum + (f.score || 0), 0) / favorites.length).toFixed(1)}
              </h3>
              <p className="text-gray-400 text-sm">Avg Score</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;

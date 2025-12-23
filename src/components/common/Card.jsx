import { Link } from 'react-router-dom';
import { Star, Plus, Heart, Play, Check, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

const Card = ({ item, type = 'anime', readOnly = false }) => {
  const { isFavorite, addToFavorites, removeFromFavorites, addToWatchList, getWatchStatus, isInTop10, addToTop10, top10Anime, top10Manga, top10Manhwa } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [showWatchMenu, setShowWatchMenu] = useState(false);
  
  const itemIsFavorite = !readOnly && isFavorite(item.mal_id);
  const watchStatus = !readOnly && getWatchStatus(item.mal_id);
  
  // Determine the correct type and top10 list
  const itemType = type === 'manhwa' ? 'manhwa' : 
                   (item.type === 'Manga' || item.type === 'Manhwa' || item.type === 'Manhua' || 
                    item.type === 'Novel' || item.type === 'Light Novel' || item.type === 'One-shot' || 
                    item.type === 'Doujinshi') ? 'manga' : 'anime';
  
  const currentTop10List = itemType === 'anime' ? top10Anime : itemType === 'manga' ? top10Manga : top10Manhwa;
  const inTop10 = !readOnly && isInTop10(item.mal_id, itemType);

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/${type}/${item.mal_id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-dark-card border border-primary/20 shadow-lg hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2">
          {/* Image */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
            
            {/* Neon Glow Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
          </div>

          {/* Hover Overlay with Info */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/90 to-transparent p-4 flex flex-col justify-end transition-all duration-300 rounded-2xl">
              <div className="space-y-2">
                {/* Genres */}
                <div className="flex flex-wrap gap-1">
                  {item.genres?.slice(0, 3).map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="px-2 py-1 text-xs bg-primary/80 rounded-full text-white font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                {/* Synopsis */}
                <p className="text-sm text-gray-300 line-clamp-3">
                  {item.synopsis || 'No description available.'}
                </p>
                
                {/* Additional Info */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {item.episodes && (
                    <span>{item.episodes} Episodes</span>
                  )}
                  {item.chapters && (
                    <span>{item.chapters} Chapters</span>
                  )}
                  {item.status && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!readOnly && (
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
              onClick={(e) => {
                e.preventDefault();
                if (itemIsFavorite) {
                  removeFromFavorites(item.mal_id);
                } else {
                  addToFavorites(item);
                }
              }}
              className="p-2 bg-dark/90 backdrop-blur-sm rounded-full hover:bg-primary transition-all transform hover:scale-110"
              title={itemIsFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 ${itemIsFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
              </button>
              <button
              onClick={(e) => {
                e.preventDefault();
                if (!inTop10 && currentTop10List.length < 10) {
                  const nextRank = currentTop10List.length + 1;
                  addToTop10(item, nextRank, itemType);
                } else if (currentTop10List.length >= 10) {
                  alert(`Your top 10 ${itemType} list is full! Visit Preferences to manage it.`);
                }
              }}
              disabled={inTop10}
              className={`p-2 bg-dark/90 backdrop-blur-sm rounded-full hover:bg-yellow-500 transition-all transform hover:scale-110 ${
                inTop10 ? 'bg-yellow-500/90' : ''
              } disabled:opacity-50`}
              title={inTop10 ? "In your Top 10" : "Add to Top 10"}
            >
              <Trophy
                className={`w-5 h-5 ${inTop10 ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
              />
              </button>
            </div>
          )}
          {!readOnly && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowWatchMenu(!showWatchMenu);
                }}
                className={`p-2 bg-dark/90 backdrop-blur-sm rounded-full hover:bg-primary transition-all transform hover:scale-110 ${
                  watchStatus ? 'bg-green-500/90' : ''
                }`}
                title="Add to list"
              >
                {watchStatus ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </button>
              
              {showWatchMenu && (
                <div className="absolute right-full mr-2 top-0 bg-dark-lighter border border-gray-700 rounded-lg shadow-xl p-2 w-48 z-10">
                  {['watching', 'completed', 'planToWatch', 'onHold', 'dropped'].map((status) => (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.preventDefault();
                        addToWatchList(item, status);
                        setShowWatchMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-dark text-sm transition-colors ${
                        watchStatus === status ? 'bg-primary text-white' : 'text-gray-300'
                      }`}
                    >
                      {status === 'planToWatch' ? 'Plan to Watch' : status === 'onHold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rating Badge */}
          {item.score && (
            <div className="absolute top-2 left-2 flex items-center space-x-1 bg-dark/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm font-bold">{item.score}</span>
            </div>
          )}

          {/* Rank Badge */}
          {item.rank && (
            <div className="absolute top-12 left-2 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full shadow-lg">
              <span className="text-white text-xs font-bold">#{item.rank}</span>
            </div>
          )}
          </div>

          {/* Title and Info */}
          <div className="mt-3 space-y-1 px-1">
          <h3 className="font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors">
            {item.title || item.title_english}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="font-medium">{item.type}</span>
            <span>{item.year || item.published?.prop?.from?.year || 'N/A'}</span>
          </div>
          {item.members && (
            <div className="text-xs text-gray-500">
              {item.members.toLocaleString()} members
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Card;

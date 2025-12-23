import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // User state from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteGenres, setFavoriteGenres] = useState(() => {
    const saved = localStorage.getItem('favoriteGenres');
    return saved ? JSON.parse(saved) : [];
  });

  const [watchList, setWatchList] = useState(() => {
    const saved = localStorage.getItem('watchList');
    return saved ? JSON.parse(saved) : {
      watching: [],
      completed: [],
      planToWatch: [],
      dropped: [],
      onHold: []
    };
  });

  const [top10Anime, setTop10Anime] = useState(() => {
    const saved = localStorage.getItem('top10Anime');
    return saved ? JSON.parse(saved) : [];
  });

  const [top10Manga, setTop10Manga] = useState(() => {
    const saved = localStorage.getItem('top10Manga');
    return saved ? JSON.parse(saved) : [];
  });

  const [top10Manhwa, setTop10Manhwa] = useState(() => {
    const saved = localStorage.getItem('top10Manhwa');
    return saved ? JSON.parse(saved) : [];
  });

  const [genreAnimeList, setGenreAnimeList] = useState(() => {
    const saved = localStorage.getItem('genreAnimeList');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('favoriteGenres', JSON.stringify(favoriteGenres));
  }, [favoriteGenres]);

  useEffect(() => {
    localStorage.setItem('watchList', JSON.stringify(watchList));
  }, [watchList]);

  useEffect(() => {
    localStorage.setItem('top10Anime', JSON.stringify(top10Anime));
  }, [top10Anime]);

  useEffect(() => {
    localStorage.setItem('top10Manga', JSON.stringify(top10Manga));
  }, [top10Manga]);

  useEffect(() => {
    localStorage.setItem('top10Manhwa', JSON.stringify(top10Manhwa));
  }, [top10Manhwa]);

  useEffect(() => {
    localStorage.setItem('genreAnimeList', JSON.stringify(genreAnimeList));
  }, [genreAnimeList]);

  useEffect(() => {
    localStorage.setItem('genreAnimeList', JSON.stringify(genreAnimeList));
  }, [genreAnimeList]);

  // Fetch user data from backend if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded user data from backend:', {
            username: data.username,
            favoritesCount: data.favorites?.length || 0,
            watchListCompleted: data.watchList?.completed?.length || 0,
            top10Count: data.top10List?.length || 0
          });
          
          setCurrentUser(data);
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(data));
          
          // Load user's data from backend if available
          if (data.favorites) {
            setFavorites(data.favorites);
            localStorage.setItem('favorites', JSON.stringify(data.favorites));
          }
          if (data.favoriteGenres) {
            setFavoriteGenres(data.favoriteGenres);
            localStorage.setItem('favoriteGenres', JSON.stringify(data.favoriteGenres));
          }
          if (data.watchList) {
            setWatchList(data.watchList);
            localStorage.setItem('watchList', JSON.stringify(data.watchList));
          }
          if (data.genreAnimeList) {
            const genreList = typeof data.genreAnimeList === 'object' ? data.genreAnimeList : {};
            setGenreAnimeList(genreList);
            localStorage.setItem('genreAnimeList', JSON.stringify(genreList));
          }
          
          // Load Top 10 lists
          if (data.top10List && Array.isArray(data.top10List)) {
            const anime = data.top10List.filter(item => item.type !== 'Manga' && item.type !== 'Manhwa');
            const manga = data.top10List.filter(item => item.type === 'Manga');
            const manhwa = data.top10List.filter(item => item.type === 'Manhwa');
            
            setTop10Anime(anime);
            setTop10Manga(manga);
            setTop10Manhwa(manhwa);
            
            localStorage.setItem('top10Anime', JSON.stringify(anime));
            localStorage.setItem('top10Manga', JSON.stringify(manga));
            localStorage.setItem('top10Manhwa', JSON.stringify(manhwa));
          }
          
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []); // Only run once on mount

  const addToFavorites = async (item) => {
    const newFavorites = [...favorites, { ...item, addedAt: new Date().toISOString() }];
    setFavorites(newFavorites);
    
    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      
      if (response.ok) {
        console.log('✅ Favorite synced to backend:', item.title);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to sync favorite:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Network error syncing favorite:', error);
    }
  };

  const removeFromFavorites = async (malId) => {
    setFavorites(prev => prev.filter(fav => fav.mal_id !== malId));
    
    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/favorites/${malId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to sync favorites removal to backend:', error);
    }
  };

  const isFavorite = (malId) => {
    return favorites.some(fav => fav.mal_id === malId);
  };

  const addToWatchList = async (item, category) => {
    setWatchList(prev => {
      // First, remove the item from all categories
      const newWatchList = {
        watching: prev.watching.filter(i => i.mal_id !== item.mal_id),
        completed: prev.completed.filter(i => i.mal_id !== item.mal_id),
        planToWatch: prev.planToWatch.filter(i => i.mal_id !== item.mal_id),
        dropped: prev.dropped.filter(i => i.mal_id !== item.mal_id),
        onHold: prev.onHold.filter(i => i.mal_id !== item.mal_id)
      };
      
      // Then add to the specified category
      newWatchList[category] = [...newWatchList[category], item];
      
      console.log('Updated watchList:', newWatchList);
      
      // Sync to backend
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ anime: item, category })
      }).catch(error => console.error('Failed to sync watchlist to backend:', error));
      
      return newWatchList;
    });
  };

  const removeFromWatchList = async (malId, category) => {
    setWatchList(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.mal_id !== malId)
    }));

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/watchlist/${category}/${malId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to sync watchlist removal to backend:', error);
    }
  };

  const getWatchStatus = (malId) => {
    for (const [category, items] of Object.entries(watchList)) {
      if (items.some(item => item.mal_id === malId)) {
        return category;
      }
    }
    return null;
  };

  const toggleGenre = async (genre) => {
    setFavoriteGenres(prev => {
      const exists = prev.find(g => g.mal_id === genre.mal_id);
      if (exists) {
        return prev.filter(g => g.mal_id !== genre.mal_id);
      }
      return [...prev, genre];
    });

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/user/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(genre)
      });
    } catch (error) {
      console.error('Failed to sync genre to backend:', error);
    }
  };

  const isGenreFavorite = (genreId) => {
    return favoriteGenres.some(g => g.mal_id === genreId);
  };

  // Genre-specific anime list functions
  const addAnimeToGenre = async (genreId, anime) => {
    setGenreAnimeList(prev => {
      const genreList = prev[genreId] || [];
      if (genreList.some(item => item.mal_id === anime.mal_id)) {
        return prev;
      }
      return {
        ...prev,
        [genreId]: [...genreList, anime]
      };
    });

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/user/genre-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ genreId, anime })
      });
    } catch (error) {
      console.error('Failed to sync genre anime to backend:', error);
    }
  };

  const removeAnimeFromGenre = async (genreId, malId) => {
    setGenreAnimeList(prev => ({
      ...prev,
      [genreId]: (prev[genreId] || []).filter(item => item.mal_id !== malId)
    }));

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/genre-anime/${genreId}/${malId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to sync genre anime removal to backend:', error);
    }
  };

  const getGenreAnimeList = (genreId) => {
    return genreAnimeList[genreId] || [];
  };

  const isAnimeInGenre = (genreId, malId) => {
    return (genreAnimeList[genreId] || []).some(item => item.mal_id === malId);
  };

  const addToTop10 = async (item, rank, type = 'anime') => {
    const setter = type === 'anime' ? setTop10Anime : type === 'manga' ? setTop10Manga : setTop10Manhwa;
    setter(prev => {
      // Remove if already exists
      const filtered = prev.filter(i => i.mal_id !== item.mal_id);
      
      // Add with rank
      const newItem = { ...item, rank, addedAt: new Date().toISOString() };
      
      // Insert at correct position
      const newList = [...filtered, newItem];
      newList.sort((a, b) => a.rank - b.rank);
      
      // Keep only top 10
      return newList.slice(0, 10);
    });

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      const newItem = { ...item, rank, type, addedAt: new Date().toISOString() };
      await fetch('http://localhost:5000/api/user/top10', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });
    } catch (error) {
      console.error('Failed to sync top10 to backend:', error);
    }
  };

  const removeFromTop10 = async (malId, type = 'anime') => {
    const setter = type === 'anime' ? setTop10Anime : type === 'manga' ? setTop10Manga : setTop10Manhwa;
    setter(prev => prev.filter(item => item.mal_id !== malId));

    // Sync to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/user/top10/${malId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Failed to sync top10 removal to backend:', error);
    }
  };

  const isInTop10 = (malId, type = 'anime') => {
    const list = type === 'anime' ? top10Anime : type === 'manga' ? top10Manga : top10Manhwa;
    return list.some(item => item.mal_id === malId);
  };

  const getTop10Rank = (malId, type = 'anime') => {
    const list = type === 'anime' ? top10Anime : type === 'manga' ? top10Manga : top10Manhwa;
    const item = list.find(item => item.mal_id === malId);
    return item?.rank || null;
  };

  const reorderTop10 = (malId, newRank, type = 'anime') => {
    const setter = type === 'anime' ? setTop10Anime : type === 'manga' ? setTop10Manga : setTop10Manhwa;
    setter(prev => {
      return prev.map(item => {
        if (item.mal_id === malId) {
          return { ...item, rank: newRank };
        }
        return item;
      }).sort((a, b) => a.rank - b.rank);
    });
  };

  const updatePrivacySettings = async (privacySettings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(privacySettings)
      });

      if (response.ok) {
        const updatedPrivacy = await response.json();
        setCurrentUser(prev => ({ ...prev, privacy: updatedPrivacy }));
        localStorage.setItem('user', JSON.stringify({ ...currentUser, privacy: updatedPrivacy }));
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const value = {
    currentUser,
    isLoggedIn,
    favorites,
    favoriteGenres,
    watchList,
    top10Anime,
    top10Manga,
    top10Manhwa,
    genreAnimeList,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToWatchList,
    removeFromWatchList,
    getWatchStatus,
    toggleGenre,
    isGenreFavorite,
    addAnimeToGenre,
    removeAnimeFromGenre,
    getGenreAnimeList,
    isAnimeInGenre,
    addToTop10,
    removeFromTop10,
    isInTop10,
    getTop10Rank,
    reorderTop10,
    updatePrivacySettings,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

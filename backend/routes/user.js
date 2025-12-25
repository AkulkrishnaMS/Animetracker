const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to check authentication (supports both session and JWT)
const isAuthenticated = (req, res, next) => {
  // Check session authentication first (Passport)
  if (req.isAuthenticated()) {
    console.log('✓ Authenticated via session');
    return next();
  }
  
  // Check JWT token
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? authHeader.substring(0, 30) + '...' : 'none');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✓ JWT token verified for user:', decoded.id);
      req.user = { id: decoded.id };
      return next();
    } catch (error) {
      console.error('✗ JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
  }
  
  console.error('✗ No authentication method found');
  res.status(401).json({ message: 'Not authenticated' });
};

// @route   POST /api/user/favorites
// @desc    Add to favorites
router.post('/favorites', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const exists = user.favorites.some(fav => fav.mal_id === req.body.mal_id);
    
    if (!exists) {
      user.favorites.push({ ...req.body, addedAt: new Date() });
      await user.save();
    }
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/favorites/:malId
// @desc    Remove from favorites
router.delete('/favorites/:malId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav.mal_id !== parseInt(req.params.malId));
    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/genres
// @desc    Toggle favorite genre
router.post('/genres', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const exists = user.favoriteGenres.some(g => g.mal_id === req.body.mal_id);
    
    if (exists) {
      user.favoriteGenres = user.favoriteGenres.filter(g => g.mal_id !== req.body.mal_id);
    } else {
      user.favoriteGenres.push(req.body);
    }
    
    await user.save();
    res.json(user.favoriteGenres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/genre-anime
// @desc    Add anime to genre list
router.post('/genre-anime', isAuthenticated, async (req, res) => {
  try {
    const { genreId, anime } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.genreAnimeList) {
      user.genreAnimeList = new Map();
    }
    
    const genreList = user.genreAnimeList.get(genreId.toString()) || [];
    const exists = genreList.some(item => item.mal_id === anime.mal_id);
    
    if (!exists) {
      genreList.push(anime);
      user.genreAnimeList.set(genreId.toString(), genreList);
      await user.save();
    }
    
    res.json(Object.fromEntries(user.genreAnimeList));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/genre-anime/:genreId/:malId
// @desc    Remove anime from genre list
router.delete('/genre-anime/:genreId/:malId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const genreList = user.genreAnimeList.get(req.params.genreId) || [];
    
    const filtered = genreList.filter(item => item.mal_id !== parseInt(req.params.malId));
    user.genreAnimeList.set(req.params.genreId, filtered);
    await user.save();
    
    res.json(Object.fromEntries(user.genreAnimeList));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/top10
// @desc    Add to top 10
router.post('/top10', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.top10List = user.top10List.filter(item => item.mal_id !== req.body.mal_id);
    
    if (user.top10List.length < 10) {
      user.top10List.push(req.body);
      user.top10List.sort((a, b) => a.rank - b.rank);
      await user.save();
    }
    
    res.json(user.top10List);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/top10/:malId
// @desc    Remove from top 10
router.delete('/top10/:malId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.top10List = user.top10List.filter(item => item.mal_id !== parseInt(req.params.malId));
    await user.save();
    res.json(user.top10List);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/user/watchlist
// @desc    Add to watch list
router.post('/watchlist', isAuthenticated, async (req, res) => {
  try {
    const { category, anime } = req.body;
    const user = await User.findById(req.user.id);
    
    // Remove from all categories first
    Object.keys(user.watchList).forEach(cat => {
      user.watchList[cat] = user.watchList[cat].filter(item => item.mal_id !== anime.mal_id);
    });
    
    // Add to specified category
    user.watchList[category].push(anime);
    await user.save();
    
    res.json(user.watchList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/user/watchlist/:category/:malId
// @desc    Remove from watch list
router.delete('/watchlist/:category/:malId', isAuthenticated, async (req, res) => {
  try {
    const { category, malId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (user.watchList[category]) {
      user.watchList[category] = user.watchList[category].filter(
        item => item.mal_id !== parseInt(malId)
      );
      await user.save();
    }
    
    res.json(user.watchList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/user/search
// @desc    Search users by username or email
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    console.log('User search request:', { query: q, userId: req.user?.id });
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search users by username or email (case-insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username email createdAt favorites top10List')
    .limit(20);

    console.log(`Found ${users.length} users matching query "${q}"`);
    res.json(users);
  } catch (error) {
    console.error('Error in user search:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/user/profile/:userId
// @desc    Get public user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    console.log('Profile request for userId:', req.params.userId);
    
    const user = await User.findById(req.params.userId)
      .select('username email createdAt favorites top10List favoriteGenres watchList privacy genreAnimeList');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', {
      username: user.username,
      favoritesCount: user.favorites?.length || 0,
      top10Count: user.top10List?.length || 0,
      watchListCounts: {
        watching: user.watchList?.watching?.length || 0,
        completed: user.watchList?.completed?.length || 0
      }
    });

    // Check if this is the user's own profile
    const isOwnProfile = req.isAuthenticated() && req.user.id === req.params.userId;
    console.log('Is own profile:', isOwnProfile);

    // If not own profile, respect privacy settings
    if (!isOwnProfile) {
      const publicProfile = {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        privacy: user.privacy
      };

      // Only include data that is set to public
      if (user.privacy?.listsPublic) {
        publicProfile.watchList = user.watchList;
      }
      if (user.privacy?.favoritesPublic) {
        publicProfile.favorites = user.favorites;
      }
      if (user.privacy?.top10Public) {
        publicProfile.top10List = user.top10List;
      }
      if (user.privacy?.favoritesPublic) {
        publicProfile.favoriteGenres = user.favoriteGenres;
        publicProfile.genreAnimeList = user.genreAnimeList;
      }

      console.log('Returning public profile with counts:', {
        favorites: publicProfile.favorites?.length || 0,
        top10: publicProfile.top10List?.length || 0,
        watchListCompleted: publicProfile.watchList?.completed?.length || 0
      });

      return res.json(publicProfile);
    }

    // Own profile - return everything
    console.log('Returning full profile (own)');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/user/privacy
// @desc    Update user privacy settings
router.put('/privacy', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.privacy) {
      user.privacy = {};
    }

    // Update privacy settings
    if (req.body.listsPublic !== undefined) {
      user.privacy.listsPublic = req.body.listsPublic;
    }
    if (req.body.favoritesPublic !== undefined) {
      user.privacy.favoritesPublic = req.body.favoritesPublic;
    }
    if (req.body.top10Public !== undefined) {
      user.privacy.top10Public = req.body.top10Public;
    }

    await user.save();
    res.json(user.privacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

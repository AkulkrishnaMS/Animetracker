const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authLimiter } = require('../middleware/security');
const { registerValidation, loginValidation, validate } = require('../middleware/validators');

// @route   POST /api/auth/register
// @desc    Register with email/password
router.post('/register', authLimiter, registerValidation, validate, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      watchList: {
        watching: [],
        completed: [],
        planToWatch: [],
        onHold: [],
        dropped: []
      }
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login with email/password
router.post('/login', authLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        favorites: user.favorites,
        favoriteGenres: user.favoriteGenres,
        genreAnimeList: user.genreAnimeList,
        top10List: user.top10List,
        watchList: user.watchList
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login` 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect(process.env.FRONTEND_URL);
  }
);

// @route   GET /api/auth/user
// @desc    Get current user
router.get('/user', async (req, res) => {
  try {
    // Check for JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        return res.json({
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          favorites: user.favorites,
          favoriteGenres: user.favoriteGenres,
          genreAnimeList: user.genreAnimeList,
          top10List: user.top10List,
          watchList: user.watchList
        });
      }
    }
    
    // Fall back to passport session
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    
    res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// @route   GET /api/auth/logout
// @desc    Logout user
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;

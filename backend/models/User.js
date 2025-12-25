const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google
    }
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/300?img=10'
  },
  favorites: [{
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }],
  favoriteGenres: [{
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }],
  genreAnimeList: {
    type: Map,
    of: [mongoose.Schema.Types.Mixed],
    default: {}
  },
  top10List: [{
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }],
  watchList: {
    watching: [{
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }],
    completed: [{
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }],
    planToWatch: [{
      mal_id: Number,
      title: String,
      images: Object,
      type: String
    }],
    planToWatch: [{
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }],
    onHold: [{
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }],
    dropped: [{
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }]
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  privacy: {
    listsPublic: {
      type: Boolean,
      default: true
    },
    favoritesPublic: {
      type: Boolean,
      default: true
    },
    top10Public: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

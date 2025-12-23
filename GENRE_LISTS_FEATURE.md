# Genre-Specific Anime Lists Feature 🎭

## What's New?

Now you can create **favorite anime lists for each genre** you like! Instead of just selecting genres, you can pick your favorite anime within each genre.

## How It Works

### 1. **Select Your Favorite Genres**
   - Go to **Preferences** → **Genre Favorites** tab
   - Click on genres you like (Action, Romance, Comedy, etc.)
   - Selected genres will be highlighted in purple

### 2. **Add Anime to Each Genre**
   - Once you select a genre, it appears below with an "Add Anime" button
   - Click **"Add Anime"** next to the genre name
   - Search for anime in that genre
   - Click **"Add"** on any anime to add it to that genre's list

### 3. **View on Profile**
   - Visit your profile to see all your genre-specific lists
   - Each genre shows up to 6 anime
   - Hover over anime to see titles

## Example Workflow

```
1. Select "Action" genre
   ↓
2. Click "Add Anime" next to Action
   ↓
3. Search "Attack on Titan"
   ↓
4. Click "Add" on Attack on Titan
   ↓
5. It's added to your Action favorites!
```

## Features

✅ **Genre Selection**: Pick unlimited genres  
✅ **Search by Genre**: Find anime specifically in that genre  
✅ **Unlimited Anime**: Add as many anime as you want per genre  
✅ **Easy Management**: Remove anime with one click  
✅ **Profile Display**: All genre lists shown on your profile  
✅ **Hover Preview**: See full anime titles on hover  

## Visual Layout

### Preferences Page
```
┌─────────────────────────────────────────┐
│  [Genre Favorites] [My Top 10 All-Time]│
├─────────────────────────────────────────┤
│  Select Your Favorite Genres            │
│  [Action] [Romance] [Comedy] [Drama]    │
├─────────────────────────────────────────┤
│  ❤️ Your Favorite Anime by Genre        │
│                                          │
│  Action (5 anime)      [Add Anime]      │
│  [Anime1] [Anime2] [Anime3] [Anime4]    │
│                                          │
│  Romance (3 anime)     [Add Anime]      │
│  [Anime1] [Anime2] [Anime3]             │
└─────────────────────────────────────────┘
```

### Profile Page
```
┌─────────────────────────────────────────┐
│  ✨ Favorite Anime by Genre    [Manage→]│
├─────────────────────────────────────────┤
│  Action (5 anime)                        │
│  [▓▓▓] [▓▓▓] [▓▓▓] [▓▓▓] [▓▓▓]         │
│                                          │
│  Romance (3 anime)                       │
│  [▓▓▓] [▓▓▓] [▓▓▓]                      │
└─────────────────────────────────────────┘
```

## Tips

💡 **Search within Genre**: When you click "Add Anime", search results are filtered to that specific genre  
💡 **Remove Anytime**: Hover over anime and click the X button to remove  
💡 **Cancel Search**: Click "Cancel" to close search without adding  
💡 **Multiple Genres**: Anime can appear in multiple genre lists  

## Difference from Other Features

| Feature | Description | Limit |
|---------|-------------|-------|
| **Genre Lists** | Your favorite anime **per genre** | Unlimited per genre |
| **Top 10** | Your **all-time** top 10 anime | Max 10 total |
| **Favorites** | General favorites (any anime/manga) | Unlimited |

## Data Storage

- **localStorage Key**: `genreAnimeList`
- **Structure**: Object with genre IDs as keys
- **Example**:
  ```json
  {
    "1": [anime1, anime2, anime3],  // Action
    "8": [anime4, anime5]            // Romance
  }
  ```

## Perfect For:

✨ Organizing anime by your favorite genres  
✨ Discovering patterns in your preferences  
✨ Sharing your taste with others  
✨ Quick access to favorites in specific genres  
✨ Building curated collections  

Enjoy organizing your anime by genre! 🎉

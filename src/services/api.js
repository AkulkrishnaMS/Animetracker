import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Create axios instance with default config
const api = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 10000,
});

// ============ ANIME API CALLS ============
export const fetchTopAnime = async (page = 1, filter = 'bypopularity') => {
  const response = await api.get('/top/anime', {
    params: { page, filter }
  });
  return response.data;
};

export const fetchAnimeById = async (id) => {
  const response = await api.get(`/anime/${id}/full`);
  return response.data;
};

export const searchAnime = async (query, page = 1, filters = {}) => {
  // Filter out empty string values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '')
  );
  
  const response = await api.get('/anime', {
    params: { 
      q: query, 
      page, 
      sfw: true,
      ...cleanFilters 
    }
  });
  return response.data;
};

export const fetchAnimeCharacters = async (id) => {
  const response = await api.get(`/anime/${id}/characters`);
  return response.data;
};

export const fetchAnimeRecommendations = async (id) => {
  const response = await api.get(`/anime/${id}/recommendations`);
  return response.data;
};

export const fetchSeasonalAnime = async (year, season) => {
  const response = await api.get(`/seasons/${year}/${season}`);
  return response.data;
};

// ============ MANGA API CALLS ============
export const fetchTopManga = async (page = 1, filter = 'bypopularity') => {
  const response = await api.get('/top/manga', {
    params: { page, filter }
  });
  return response.data;
};

export const fetchMangaById = async (id) => {
  const response = await api.get(`/manga/${id}/full`);
  return response.data;
};

export const searchManga = async (query, page = 1, filters = {}) => {
  // Filter out empty string values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '')
  );
  
  const response = await api.get('/manga', {
    params: { 
      q: query, 
      page, 
      sfw: true,
      ...cleanFilters 
    }
  });
  return response.data;
};

export const fetchMangaCharacters = async (id) => {
  const response = await api.get(`/manga/${id}/characters`);
  return response.data;
};

// ============ MANHWA (Manga with type filter) ============
export const fetchTopManhwa = async (page = 1) => {
  const response = await api.get('/manga', {
    params: { 
      page,
      type: 'manhwa',
      order_by: 'popularity',
      sfw: true
    }
  });
  return response.data;
};

export const searchManhwa = async (query, page = 1, filters = {}) => {
  // Filter out empty string values
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== '')
  );
  
  const response = await api.get('/manga', {
    params: { 
      q: query, 
      page,
      type: 'manhwa',
      sfw: true,
      ...cleanFilters
    }
  });
  return response.data;
};

// ============ CHARACTERS & PEOPLE ============
export const fetchTopCharacters = async (page = 1) => {
  const response = await api.get('/top/characters', {
    params: { page }
  });
  return response.data;
};

export const fetchCharacterById = async (id) => {
  const response = await api.get(`/characters/${id}/full`);
  return response.data;
};

export const searchCharacters = async (query, page = 1) => {
  const response = await api.get('/characters', {
    params: { q: query, page }
  });
  return response.data;
};

export const fetchPeople = async (page = 1) => {
  const response = await api.get('/top/people', {
    params: { page }
  });
  return response.data;
};

// ============ GENRES ============
export const fetchAnimeGenres = async () => {
  const response = await api.get('/genres/anime');
  return response.data;
};

export const fetchMangaGenres = async () => {
  const response = await api.get('/genres/manga');
  return response.data;
};

// ============ RANDOM ============
export const fetchRandomAnime = async () => {
  const response = await api.get('/random/anime');
  return response.data;
};

export const fetchRandomManga = async () => {
  const response = await api.get('/random/manga');
  return response.data;
};

// ============ USER API (Backend) ============
const BACKEND_URL = 'http://localhost:5000/api';

export const searchUsers = async (query) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Searching users with query:', query);
    console.log('Using token:', token.substring(0, 20) + '...');
    
    const response = await axios.get(`${BACKEND_URL}/user/search`, {
      params: { q: query },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('User search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in searchUsers:', error.response || error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BACKEND_URL}/user/profile/${userId}`, {
    headers: token ? {
      'Authorization': `Bearer ${token}`
    } : {}
  });
  return response.data;
};

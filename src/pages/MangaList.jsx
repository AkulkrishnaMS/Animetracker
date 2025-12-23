import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchManga, fetchTopManga, fetchMangaGenres } from '../services/api';
import Card from '../components/common/Card';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MangaList = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    genre: '',
    order_by: 'popularity',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: genresData } = useQuery({
    queryKey: ['mangaGenres'],
    queryFn: fetchMangaGenres,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['manga', searchQuery, page, filters],
    queryFn: () => {
      // Check if any filter is different from defaults or if there's a search query
      const hasFilters = searchQuery || 
                        filters.type || 
                        filters.status || 
                        filters.genre ||
                        filters.order_by !== 'popularity';
      
      if (hasFilters) {
        return searchManga(searchQuery || '', page, filters);
      }
      return fetchTopManga(page);
    },
    keepPreviousData: true,
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      genre: '',
      order_by: 'popularity',
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mangaTypes = ['Manga', 'Novel', 'Lightnovel', 'Oneshot', 'Doujin', 'Manhua'];
  const statuses = ['publishing', 'complete', 'upcoming', 'discontinued'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'score', label: 'Score' },
    { value: 'title', label: 'Title' },
    { value: 'start_date', label: 'Start Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Manga'}
          </h1>
          <p className="text-gray-400">
            {data?.pagination?.items?.total || 0} manga found
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-dark-lighter rounded-xl p-6 border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Types</option>
                {mangaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Genres</option>
                {genresData?.data?.slice(0, 20).map(genre => (
                  <option key={genre.mal_id} value={genre.mal_id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
              <select
                value={filters.order_by}
                onChange={(e) => handleFilterChange('order_by', e.target.value)}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading manga...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 p-8">
          <p>Error loading manga. Please try again.</p>
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center text-gray-400 p-12 bg-dark-lighter rounded-xl">
          <p className="text-xl">No manga found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data?.data?.map((manga) => (
              <Card key={manga.mal_id} item={manga} type="manga" />
            ))}
          </div>

          {data?.pagination && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!data.pagination.has_previous_page}
                className="flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <span className="text-white font-medium">
                Page {data.pagination.current_page} of {data.pagination.last_visible_page || 1}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!data.pagination.has_next_page}
                className="flex items-center gap-2 px-4 py-2 bg-dark-lighter border border-gray-700 rounded-lg text-white hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MangaList;

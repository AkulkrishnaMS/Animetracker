import { useQuery } from '@tanstack/react-query';
import { fetchTopAnime, fetchTopManga } from '../services/api';
import Card from '../components/common/Card';
import { TrendingUp, Flame, Star, ArrowRight, Sparkles, Zap, Heart, Play, BookOpen, Search, Users, Eye, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const Home = () => {
  const [typingText, setTypingText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fullText = 'Discover. Track. Discuss.';
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypingText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const { data: topAnime, isLoading: animeLoading } = useQuery({
    queryKey: ['topAnime'],
    queryFn: () => fetchTopAnime(1),
  });

  const { data: topManga, isLoading: mangaLoading } = useQuery({
    queryKey: ['topManga'],
    queryFn: () => fetchTopManga(1),
  });

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 225;
      carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  const genres = [
    { name: 'Action', count: '1,240' },
    { name: 'Romance', count: '890' },
    { name: 'Isekai', count: '640' },
    { name: 'Slice of Life', count: '450' },
    { name: 'Horror', count: '320' },
    { name: 'Sci-Fi', count: '510' },
  ];

  const chatMessages = [
    { user: 'SasukeUchiha', msg: 'Did anyone see the new episode?!' },
    { user: 'NeonShade', msg: 'The animation quality is amazing!' },
    { user: 'MangaReader_X', msg: 'Read the manga, it\'s better.' },
    { user: 'KawaiiDesu', msg: 'I can\'t wait for next week!' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/anime?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-6">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ff006e]/10 via-[#8338ec]/10 to-[#00f5ff]/10 animate-gradient-shift" />
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#ff006e]/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00f5ff]/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#8338ec]/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Diagonal Watermark */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.03] select-none pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ transform: 'rotate(-30deg) translateY(-20%)' }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-32 mb-32 whitespace-nowrap" style={{ marginLeft: i % 2 === 0 ? '0' : '-200px' }}>
                <span className="text-[100px] font-black" style={{ fontFamily: 'Orbitron, sans-serif', color: '#ff006e' }}>OTAKU</span>
                <span className="text-[100px] font-black" style={{ fontFamily: 'Orbitron, sans-serif', color: '#00f5ff' }}>VERSE</span>
                <span className="text-[100px] font-black" style={{ fontFamily: 'Orbitron, sans-serif', color: '#8338ec' }}>アニメ</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <Sparkles className="w-5 h-5 text-[#ff006e]" />
            <span className="text-white font-semibold">Your Ultimate Anime & Manga Universe</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#00f5ff] bg-clip-text text-transparent">
              OtakuVerse
            </span>
          </h1>
          
          {/* Typing Animation Subheading */}
          <p className="text-2xl md:text-3xl text-[#b8c1ec] mb-4 h-12 font-medium">
            {typingText}<span className="animate-pulse text-[#ff006e]">|</span>
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Join 500K+ anime fans tracking their favorite series
          </p>
          
          {/* Search Bar with Glow */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8 mx-auto group">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#ff006e] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for titles, characters, or genres..."
                className="w-full pl-16 pr-6 py-5 bg-white/5 backdrop-blur-md border-2 border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#ff006e] focus:shadow-[0_0_30px_rgba(255,0,110,0.3)] transition-all"
              />
            </div>
          </form>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/anime"
              className="group relative px-10 py-5 bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white rounded-full font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,110,0.5)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center justify-center gap-3">
                <Play className="w-6 h-6" />
                Explore Anime
              </span>
            </Link>
            
            <Link
              to="/manga"
              className="group relative px-10 py-5 bg-white/5 backdrop-blur-md border-2 border-[#00f5ff] text-white rounded-full font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,245,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff]/20 to-[#8338ec]/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center justify-center gap-3">
                <BookOpen className="w-6 h-6" />
                Start Tracking
              </span>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-20 flex flex-wrap gap-12 justify-center">
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-[#ff006e] to-[#8338ec] bg-clip-text text-transparent">15K+</div>
              <div className="text-sm text-gray-400 mt-1">Anime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-[#8338ec] to-[#00f5ff] bg-clip-text text-transparent">500K+</div>
              <div className="text-sm text-gray-400 mt-1">Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-[#00f5ff] to-[#ff006e] bg-clip-text text-transparent">2M+</div>
              <div className="text-sm text-gray-400 mt-1">Reviews</div>
            </div>
          </div>
        </div>
      </header>

      {/* Trending Now Section */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-5xl font-black text-white mb-2 relative inline-block">
              Trending Now
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-transparent rounded-full" />
            </h2>
            <p className="text-gray-400 mt-4">What everyone's watching right now</p>
          </div>
        </div>
        
        {animeLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ff006e]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topAnime?.data?.slice(0, 10).map((anime) => (
              <Card key={anime.mal_id} item={anime} type="anime" />
            ))}
          </div>
        )}
      </section>

      {/* Top Manga Section */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-5xl font-black text-white mb-2 relative inline-block">
              Top Manga
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00f5ff] via-[#8338ec] to-transparent rounded-full" />
            </h2>
            <p className="text-gray-400 mt-4">The highest rated series</p>
          </div>
        </div>
        
        {mangaLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00f5ff]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topManga?.data?.slice(0, 10).map((manga) => (
              <Card key={manga.mal_id} item={manga} type="manga" />
            ))}
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 p-12">
          {/* Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#8338ec]/20 rounded-full blur-[150px]" />
          
          <div className="relative">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-white mb-4">Join the Community</h2>
              <p className="text-xl text-gray-400">Connect with fellow otakus worldwide</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Users className="w-5 h-5 text-[#00f5ff]" />
                <span className="text-[#00f5ff] font-bold">12,453 fans online</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <Link 
                to="/anime"
                className="group relative px-12 py-6 bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white rounded-2xl font-black text-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,0,110,0.6)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-3">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  Start Your Journey
                  <ChevronRight className="w-6 h-6" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

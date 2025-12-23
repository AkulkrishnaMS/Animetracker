import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Users, Hash } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Naruto_Fan', avatar: 'https://i.pravatar.cc/150?img=1', message: 'Just finished watching Attack on Titan S4!', time: '10:30 AM' },
    { id: 2, user: 'MangaReader99', avatar: 'https://i.pravatar.cc/150?img=2', message: 'Anyone reading Jujutsu Kaisen manga?', time: '10:32 AM' },
    { id: 3, user: 'AnimeKing', avatar: 'https://i.pravatar.cc/150?img=3', message: 'Demon Slayer movie was amazing!', time: '10:35 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState('general');
  const messagesEndRef = useRef(null);

  const rooms = [
    { id: 'general', name: 'General', icon: Hash, count: 142 },
    { id: 'anime', name: 'Anime Discussion', icon: Hash, count: 89 },
    { id: 'manga', name: 'Manga Talk', icon: Hash, count: 56 },
    { id: 'recommendations', name: 'Recommendations', icon: Hash, count: 34 },
  ];

  const onlineUsers = [
    { id: 1, name: 'Naruto_Fan', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online' },
    { id: 2, name: 'MangaReader99', avatar: 'https://i.pravatar.cc/150?img=2', status: 'online' },
    { id: 3, name: 'AnimeKing', avatar: 'https://i.pravatar.cc/150?img=3', status: 'online' },
    { id: 4, name: 'OtakuLife', avatar: 'https://i.pravatar.cc/150?img=4', status: 'away' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] grid grid-cols-12 gap-4">
      {/* Rooms Sidebar */}
      <div className="col-span-12 md:col-span-3 bg-dark-lighter rounded-xl p-4 border border-gray-800 space-y-4">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Chat Rooms
        </h3>
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeRoom === room.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-dark hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <room.icon className="w-5 h-5" />
                <span className="font-medium">{room.name}</span>
              </div>
              <span className="text-xs">{room.count}</span>
            </button>
          ))}
        </div>
        
        {/* Online Users */}
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-lighter ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <span className="text-sm text-gray-400">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="col-span-12 md:col-span-9 bg-dark-lighter rounded-xl border border-gray-800 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Hash className="w-5 h-5" />
            {rooms.find(r => r.id === activeRoom)?.name}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <img
                src={message.avatar}
                alt={message.user}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{message.user}</span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-gray-300">{message.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <button
              type="button"
              className="p-3 bg-dark hover:bg-dark-lighter rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;

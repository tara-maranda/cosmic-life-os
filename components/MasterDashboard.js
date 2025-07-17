import React, { useState, useEffect } from 'react';
import { 
  Brain, Calendar, Target, TrendingUp, Search, Filter, 
  Clock, CheckCircle, AlertCircle, Sparkles, Moon, Sun,
  BarChart3, PieChart, Activity, Zap, Heart, Home, Leaf,
  Book, DollarSign, Users, Plus, ArrowRight, Eye
} from 'lucide-react';

const MasterDashboard = () => {
  const [dumps, setDumps] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock cosmic data
  const [cosmicData, setCosmicData] = useState({
    moonPhase: 'Waxing Crescent',
    currentSign: 'Leo',
    cycleDay: 14,
    cyclePhase: 'ovulatory'
  });

  // Mock data for demonstration
  const mockDumps = [
    {
      id: 1,
      content: "I need to remember to call my dentist and schedule that cleaning I've been putting off",
      category: 'tasks',
      processed: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      content: "Feeling really inspired about my career transition lately. The universe seems to be opening doors",
      category: 'goals',
      processed: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      content: "Had the most vivid dream about planting a garden with moonlight. Need to research moon phase gardening",
      category: 'spiritual',
      processed: false,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 4,
      content: "That ceiling fan project is staring me down again. Why do I keep avoiding it?",
      category: 'home',
      processed: true,
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 5,
      content: "My cycle is in luteal phase and I'm feeling super creative. Should lean into this energy",
      category: 'health',
      processed: false,
      created_at: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: 6,
      content: "Random thought: What if I started a spiritual business helping other Projectors?",
      category: 'goals',
      processed: false,
      created_at: new Date(Date.now() - 432000000).toISOString()
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      // Filter mock data based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedTimeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      const filteredData = mockDumps.filter(dump => 
        new Date(dump.created_at) >= startDate
      );

      setDumps(filteredData);
      calculateStats(filteredData);
      setLoading(false);
    }, 1000);
  };

  const calculateStats = (dumpData) => {
    const categoryStats = {};
    const processedCount = dumpData.filter(d => d.processed).length;
    const totalCount = dumpData.length;

    // Category breakdown
    dumpData.forEach(dump => {
      categoryStats[dump.category] = (categoryStats[dump.category] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentDumps = dumpData.filter(d => new Date(d.created_at) > weekAgo);

    setStats({
      totalDumps: totalCount,
      processedDumps: processedCount,
      unprocessedDumps: totalCount - processedCount,
      categoryBreakdown: categoryStats,
      recentActivity: recentDumps.length,
      topCategories: Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      goals: Target,
      tasks: Calendar,
      garden: Leaf,
      spiritual: Sparkles,
      health: Heart,
      home: Home,
      finance: DollarSign,
      relationships: Users,
      learning: Book,
      random: Brain
    };
    return icons[category] || Brain;
  };

  const getCategoryColor = (category) => {
    const colors = {
      goals: 'purple',
      tasks: 'blue',
      garden: 'green',
      spiritual: 'pink',
      health: 'red',
      home: 'orange',
      finance: 'yellow',
      relationships: 'cyan',
      learning: 'indigo',
      random: 'gray'
    };
    return colors[category] || 'gray';
  };

  const filteredDumps = dumps.filter(dump => {
    const matchesSearch = searchTerm === '' || 
      dump.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      dump.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCyclePhaseColor = (phase) => {
    const colors = {
      'menstrual': 'bg-red-500/20 text-red-300',
      'follicular': 'bg-green-500/20 text-green-300',
      'ovulatory': 'bg-yellow-500/20 text-yellow-300',
      'luteal': 'bg-purple-500/20 text-purple-300'
    };
    return colors[phase] || 'bg-gray-500/20 text-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your cosmic dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Cosmic Life OS Dashboard
          </h1>
          <p className="text-gray-300">Your holistic life overview</p>
        </div>

        {/* Cosmic Context Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-8 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Moon Phase</p>
                <p className="font-medium">{cosmicData.moonPhase}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sun className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Current Sign</p>
                <p className="font-medium">{cosmicData.currentSign}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-sm text-gray-400">Cycle Day</p>
                <p className="font-medium">Day {cosmicData.cycleDay}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Cycle Phase</p>
                <p className={`font-medium px-2 py-1 rounded-full text-xs ${getCyclePhaseColor(cosmicData.cyclePhase)}`}>
                  {cosmicData.cyclePhase}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold">{stats.totalDumps || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Total Brain Dumps</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold">{stats.processedDumps || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Processed</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold">{stats.unprocessedDumps || 0}</span>
            </div>
            <p className="text-sm text-gray-400">Needs Processing</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold">{stats.recentActivity || 0}</span>
            </div>
            <p className="text-sm text-gray-400">This Week</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Category Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown || {}).map(([category, count]) => {
                const IconComponent = getCategoryIcon(category);
                const color = getCategoryColor(category);
                const percentage = Math.round((count / (stats.totalDumps || 1)) * 100);
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 text-${color}-400`} />
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-16 h-2 bg-gray-700 rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full bg-${color}-400 transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Insights */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Recent Insights
            </h3>
            <div className="space-y-3">
              <div className="bg-purple-500/10 rounded-lg p-3">
                <p className="text-sm text-purple-300">🌟 Most Active Category</p>
                <p className="font-medium">{stats.topCategories?.[0]?.[0] || 'None yet'}</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-sm text-blue-300">📈 Weekly Growth</p>
                <p className="font-medium">+{stats.recentActivity || 0} new thoughts</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-sm text-green-300">✅ Processing Rate</p>
                <p className="font-medium">
                  {stats.totalDumps > 0 ? Math.round((stats.processedDumps / stats.totalDumps) * 100) : 0}% completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your thoughts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 w-64"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(stats.categoryBreakdown || {}).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Brain Dumps List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Your Thoughts ({filteredDumps.length})
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Brain Dump
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredDumps.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No thoughts found for your current filters.</p>
                <p className="text-sm">Try adjusting your search or timeframe.</p>
              </div>
            ) : (
              filteredDumps.map((dump) => {
                const IconComponent = getCategoryIcon(dump.category);
                const color = getCategoryColor(dump.category);
                
                return (
                  <div
                    key={dump.id}
                    className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 ${
                      dump.processed ? 'border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
                          <IconComponent className="w-3 h-3" />
                          {dump.category}
                        </div>
                        {dump.processed && (
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Processed
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(dump.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3 line-clamp-2">{dump.content}</p>
                    
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-xs transition-all duration-200">
                        <Sparkles className="w-3 h-3" />
                        Process
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs transition-all duration-200">
                        <ArrowRight className="w-3 h-3" />
                        Move
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;

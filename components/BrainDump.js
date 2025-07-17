import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Sparkles, Mic, MicOff, Save, Send, MessageCircle, 
  Calendar, Target, Home, Leaf, Heart, Book, DollarSign, 
  Users, Camera, Lightbulb, ArrowRight, CheckCircle, 
  Trash2, Plus, Settings, Database, BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BrainDump() {
  // State management
  const [dumpText, setDumpText] = useState('');
  const [dumps, setDumps] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState({});
  const [currentChatType, setCurrentChatType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [cosmicData, setCosmicData] = useState({
    moonPhase: 'Loading...',
    currentSign: 'Loading...'
  });
  const [cycleData, setCycleData] = useState({ day: 14, phase: 'ovulatory' });
  const [databases, setDatabases] = useState([
    { id: 1, name: 'Goals', type: 'goals', itemCount: 5, created: new Date().toISOString() },
    { id: 2, name: 'Garden', type: 'garden', itemCount: 0, created: new Date().toISOString() }
  ]);
  const [showChat, setShowChat] = useState(false);
  
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadDumps();
    loadCosmicData();
    loadCycleData();
    loadDatabases();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [dumpText]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadDumps = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDumps(data || []);
    } catch (error) {
      console.error('Error loading dumps:', error);
    }
  };

  const loadCosmicData = async () => {
    try {
      const response = await fetch('/api/cosmic');
      if (response.ok) {
        const cosmic = await response.json();
        setCosmicData(cosmic);
        console.log('Loaded cosmic data:', cosmic);
      } else {
        console.error('Failed to load cosmic data');
      }
    } catch (error) {
      console.error('Error loading cosmic data:', error);
    }
  };

  const loadCycleData = async () => {
    try {
      const response = await fetch('/api/cycle');
      if (response.ok) {
        const data = await response.json();
        setCycleData(data);
        console.log('Loaded cycle data:', data);
      } else {
        console.error('Failed to load cycle data');
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
  };

  const loadDatabases = async () => {
    try {
      const response = await fetch('/api/databases');
      if (response.ok) {
        const data = await response.json();
        setDatabases(data.databases || []);
        console.log('Loaded databases:', data.databases);
      } else {
        console.error('Failed to load databases');
      }
    } catch (error) {
      console.error('Error loading databases:', error);
    }
  };

  const handleSubmit = async (isChat = false) => {
    if (!dumpText.trim()) return;

    setIsLoading(true);
    
    if (isChat) {
      await sendChatMessage();
    } else {
      await saveBrainDump();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(false);
    }
  };

  const saveBrainDump = async () => {
    const category = categorizeDump(dumpText);
    
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .insert([
          {
            content: dumpText,
            category: category,
            processed: false
          }
        ])
        .select();

      if (error) throw error;
      
      setDumps([data[0], ...dumps]);
      setDumpText('');
      
      // Auto-start chat for this dump
      startChatForDump(data[0]);
    } catch (error) {
      console.error('Error saving dump:', error);
      alert('Error saving dump. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    const userMessage = { role: 'user', content: dumpText, timestamp: new Date().toISOString() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setDumpText('');
    setShowChat(true);

    try {
      console.log('Sending chat message:', userMessage.content);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          chatType: currentChatType,
          chatHistory: newHistory,
          userContext: {
            cosmicData,
            cycleData,
            recentDumps: dumps.slice(0, 3)
          }
        })
      });

      const data = await response.json();
      console.log('Chat response:', data);
      
      if (response.ok) {
        const aiMessage = { 
          role: 'assistant', 
          content: data.response, 
          timestamp: new Date().toISOString(),
          actions: data.actions || []
        };
        
        setChatHistory([...newHistory, aiMessage]);
        
        // Process any actions and update state immediately
        if (data.actions && data.actions.length > 0) {
          await processActionsAndUpdateState(data.actions);
        }
      } else {
        throw new Error(data.error || 'Chat failed');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: "I'm having some trouble connecting right now, but I'm still here with you. Try asking again in a moment!",
        timestamp: new Date().toISOString() 
      };
      setChatHistory([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processActionsAndUpdateState = async (actions) => {
    console.log('Processing actions:', actions);
    
    for (const action of actions) {
      switch (action.type) {
        case 'update_cycle':
          console.log('Updating cycle to day:', action.value);
          const newCycleData = {
            day: action.value,
            phase: calculateCyclePhase(action.value),
            updated: new Date().toISOString()
          };
          setCycleData(newCycleData);
          
          // Also try to update via API
          try {
            await fetch('/api/cycle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cycleDay: action.value })
            });
          } catch (error) {
            console.error('Error updating cycle via API:', error);
          }
          break;
          
        case 'create_database':
          console.log('Creating database:', action.name);
          const newDatabase = {
            id: Date.now(),
            name: action.name.charAt(0).toUpperCase() + action.name.slice(1),
            type: action.name.toLowerCase(),
            itemCount: 0,
            created: new Date().toISOString()
          };
          setDatabases(prevDatabases => [...prevDatabases, newDatabase]);
          
          // Also try to create via API
          try {
            await fetch('/api/databases', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                name: newDatabase.name,
                type: newDatabase.type
              })
            });
          } catch (error) {
            console.error('Error creating database via API:', error);
          }
          break;
      }
    }
  };

  const calculateCyclePhase = (day) => {
    if (day <= 5) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day <= 16) return 'ovulatory';
    return 'luteal';
  };

  const startChatForDump = (dump) => {
    setActiveChatId(dump.id);
    
    // Check if we have existing chat for this dump
    if (chatSessions[dump.id]) {
      setChatHistory(chatSessions[dump.id]);
    } else {
      const initialChat = [
        { role: 'user', content: dump.content, timestamp: dump.created_at },
        { role: 'assistant', content: "I've captured this thought! What would you like to explore about it? I can help categorize it, break it into actionable steps, or connect it to your other goals and patterns.", timestamp: new Date().toISOString() }
      ];
      setChatHistory(initialChat);
      setChatSessions({ ...chatSessions, [dump.id]: initialChat });
    }
    setShowChat(true);
  };

  const categorizeDump = (text) => {
    const categories = {
      goals: ['goal', 'want to', 'need to', 'should', 'career', 'transition', 'house', 'future', 'plan', 'achieve'],
      tasks: ['todo', 'need to do', 'remember', 'call', 'buy', 'fix', 'schedule', 'appointment', 'email', 'order'],
      garden: ['plant', 'garden', 'harvest', 'seeds', 'water', 'herbs', 'vegetables', 'grow', 'soil', 'compost'],
      spiritual: ['tarot', 'meditation', 'insight', 'dream', 'feeling', 'intuition', 'energy', 'spiritual', 'moon', 'astrology', 'crystal'],
      health: ['cycle', 'pcos', 'pmdd', 'weight', 'exercise', 'vitamins', 'mood', 'body', 'tired', 'energy'],
      home: ['house', 'room', 'clean', 'organize', 'ceiling fan', 'project', 'repair', 'decorate', 'kitchen'],
      finance: ['money', 'budget', 'invest', 'save', 'spending', 'bills', 'income', 'expense', 'financial'],
      relationships: ['friend', 'family', 'birthday', 'call', 'text', 'visit', 'love', 'partner', 'social'],
      learning: ['course', 'book', 'study', 'learn', 'research', 'video', 'skill', 'knowledge', 'read'],
      random: ['idea', 'thought', 'random', 'brain dump', 'note', 'wonder', 'curious']
    };

    const textLower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return category;
      }
    }
    return 'random';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      goals: Target, tasks: Calendar, garden: Leaf, spiritual: Sparkles,
      health: Heart, home: Home, finance: DollarSign, relationships: Users,
      learning: Book, random: Lightbulb
    };
    return icons[category] || Lightbulb;
  };

  const getCategoryColor = (category) => {
    const colors = {
      goals: 'purple', tasks: 'blue', garden: 'green', spiritual: 'pink',
      health: 'red', home: 'orange', finance: 'yellow', relationships: 'cyan',
      learning: 'indigo', random: 'gray'
    };
    return colors[category] || 'gray';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Cosmic Life OS
          </h1>
          <p className="text-gray-300">Your AI-powered second brain</p>
          
          {/* Navigation */}
          <div className="mt-4 flex justify-center gap-4">
            <a 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </a>
          </div>
        </div>

        {/* Cosmic Context */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-400">Moon Phase</p>
              <p className="font-medium">{cosmicData.moonPhase}</p>
            </div>
            <div>
              <p className="text-gray-400">Current Sign</p>
              <p className="font-medium">{cosmicData.currentSign}</p>
            </div>
            <div>
              <p className="text-gray-400">Cycle Day</p>
              <p className="font-medium">Day {cycleData.day}</p>
            </div>
            <div>
              <p className="text-gray-400">Cycle Phase</p>
              <p className={`font-medium px-2 py-1 rounded-full text-xs ${getCyclePhaseColor(cycleData.phase)}`}>
                {cycleData.phase}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Brain Dump Input */}
          <div className="space-y-6">
            
            {/* Main Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">What's swirling in your mind?</span>
              </div>
              
              <textarea
                ref={textareaRef}
                value={dumpText}
                onChange={(e) => setDumpText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your thoughts... Press Enter to capture, Shift+Enter for new line"
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none min-h-[120px] text-lg"
                style={{ overflow: 'hidden' }}
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200">
                    <Mic className="w-4 h-4" />
                    Voice
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200">
                    <Camera className="w-4 h-4" />
                    Photo
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={!dumpText.trim() || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/50 hover:bg-blue-500/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={!dumpText.trim() || isLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Capture
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Dumps */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Recent Thoughts
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dumps.slice(0, 5).map((dump) => {
                  const IconComponent = getCategoryIcon(dump.category);
                  const color = getCategoryColor(dump.category);
                  
                  return (
                    <div
                      key={dump.id}
                      className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => startChatForDump(dump)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-${color}-500/20 text-${color}-300`}>
                          <IconComponent className="w-3 h-3" />
                          {dump.category}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(dump.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm">{dump.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Chat Interface */}
          <div className="space-y-6">
            
            {/* Chat Area */}
            {showChat && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Conversation
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-500/20 ml-4' 
                          : 'bg-purple-500/20 mr-4'
                      }`}
                    >
                      <p className="text-sm text-gray-400 mb-1">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      <p className="text-gray-100">{message.content}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dumpText}
                    onChange={(e) => setDumpText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit(true)}
                    placeholder="Continue the conversation..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={!dumpText.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Databases */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Your Databases ({databases.length})
              </h3>
              
              <div className="space-y-2">
                {databases.map((db) => (
                  <div key={db.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <p className="font-medium">{db.name}</p>
                      <p className="text-sm text-gray-400">{db.itemCount} items</p>
                    </div>
                    <button className="text-purple-400 hover:text-purple-300">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setDumpText('create a new database');
                    handleSubmit(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Ask AI to create a new database
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

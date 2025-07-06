import React, { useState, useEffect, useRef } from 'react'
import { Brain, Sparkles, Mic, MicOff, Save, Trash2, Tag, Calendar, Target, Home, Leaf, Heart, Book, DollarSign, Users, Camera, Lightbulb, ArrowRight, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BrainDump() {
  const [dumpText, setDumpText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [dumps, setDumps] = useState([])
  const [selectedDump, setSelectedDump] = useState(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef(null)

  // Load dumps from database on component mount
  useEffect(() => {
    loadDumps()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [dumpText])

  const loadDumps = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_dumps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setDumps(data || [])
    } catch (error) {
      console.error('Error loading dumps:', error)
      // Don't show error to user, just log it
    }
  }

  const categorizeDump = (text) => {
    const categories = {
      goals: ['goal', 'want to', 'need to', 'should', 'career', 'transition', 'house'],
      tasks: ['todo', 'need to do', 'remember', 'call', 'buy', 'fix', 'schedule'],
      garden: ['plant', 'garden', 'harvest', 'seeds', 'water', 'herbs', 'vegetables'],
      spiritual: ['tarot', 'meditation', 'insight', 'dream', 'feeling', 'intuition', 'energy'],
      health: ['cycle', 'pcos', 'pmdd', 'weight', 'exercise', 'vitamins', 'mood'],
      home: ['house', 'room', 'clean', 'organize', 'ceiling fan', 'project'],
      finance: ['money', 'budget', 'invest', 'save', 'spending', 'bills'],
      relationships: ['friend', 'family', 'birthday', 'call', 'text', 'visit'],
      learning: ['course', 'book', 'study', 'learn', 'research', 'video'],
      random: ['idea', 'thought', 'random', 'brain dump', 'note']
    }

    const textLower = text.toLowerCase()
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return category
      }
    }
    return 'random'
  }

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
      random: Lightbulb
    }
    return icons[category] || Lightbulb
  }

  const getCategoryColor = (category) => {
    const colors = {
      goals: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      tasks: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      garden: 'bg-green-500/20 text-green-300 border-green-500/30',
      spiritual: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      health: 'bg-red-500/20 text-red-300 border-red-500/30',
      home: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      finance: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      relationships: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      learning: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      random: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
    return colors[category] || colors.random
  }

  const handleSaveDump = async () => {
    if (!dumpText.trim()) return
    
    setIsLoading(true)
    const category = categorizeDump(dumpText)
    
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
        .select()

      if (error) throw error
      
      // Add to local state
      setDumps([data[0], ...dumps])
      setDumpText('')
    } catch (error) {
      console.error('Error saving dump:', error)
      alert('Error saving dump. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const mockAIProcess = (dump) => {
    setIsProcessing(true)
    setSelectedDump(dump)
    setShowAIChat(true)
    
    // Mock AI processing
    setTimeout(() => {
      const responses = {
        goals: "I can see this relates to your career transition goals! Let me break this down into actionable steps and add them to your goal roadmap. Should we also schedule some time blocks for working on this?",
        tasks: "Perfect! I've categorized this as a task. Based on your energy patterns, would you like me to schedule this for a high-energy time? Also, I can set a gentle reminder so your ADHD brain doesn't forget.",
        garden: "Love this garden insight! I can add this to your garden database and check if it aligns with the current moon phase for optimal timing. Should I also suggest any related rituals or recipes?",
        spiritual: "This feels like an important spiritual download! I can save this to your spiritual insights database and cross-reference it with your current Human Design transits. Want to explore this deeper?",
        health: "This connects to your PCOS/PMDD tracking. Let me check where you are in your cycle and suggest some cycle-synced support. I can also add any relevant herbs or supplements to consider.",
        home: "Ah, another house project! I notice you've been putting off that ceiling fan for 8 months. Should I prioritize this and add it to this week's time blocks? I can help break it into smaller, less overwhelming steps.",
        finance: "This relates to your financial goals! Let me analyze this against your money roadmap and suggest how this fits into your budget. I can also remind you of your bigger financial goals.",
        relationships: "This is about relationships! I can add this to your relationship database and set reminders for important dates or check-ins. Want me to suggest some thoughtful ways to connect?",
        learning: "Adding this to your learning queue! I can integrate this with your spiritual studies and suggest the best timing based on your cycle and energy levels. Should I schedule study time?",
        random: "I love these random thoughts - they often lead to the best insights! Let me save this and see if it connects to any patterns in your journals or other brain dumps."
      }
      
      setAiResponse(responses[dump.category] || responses.random)
      setIsProcessing(false)
    }, 2000)
  }

  const deleteDump = async (id) => {
    try {
      const { error } = await supabase
        .from('brain_dumps')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setDumps(dumps.filter(dump => dump.id !== id))
    } catch (error) {
      console.error('Error deleting dump:', error)
      alert('Error deleting dump. Please try again.')
    }
  }

  const quickDumpTemplates = [
    "I need to remember to...",
    "Random thought: ",
    "Goal idea: ",
    "House project: ",
    "Spiritual insight: ",
    "Something bothering me: ",
    "Excited about: ",
    "Need to research: "
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-purple-400" />
          Brain Dump
        </h1>
        <p className="text-gray-300">Your ADHD-friendly thought capture system</p>
      </div>

      {/* Quick Templates */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Quick starters:</p>
        <div className="flex flex-wrap gap-2">
          {quickDumpTemplates.map((template, index) => (
            <button
              key={index}
              onClick={() => setDumpText(template)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs transition-all duration-200"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Area */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="font-medium">What's swirling in your mind?</span>
        </div>
        
        <textarea
          ref={textareaRef}
          value={dumpText}
          onChange={(e) => setDumpText(e.target.value)}
          placeholder="Just start typing... I'm struggling with deciding between... OR I keep forgetting to... OR Random thought about... OR I'm excited because..."
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none min-h-[120px] text-lg"
          style={{ overflow: 'hidden' }}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-3">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? 'Stop' : 'Voice'}
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200">
              <Camera className="w-4 h-4" />
              Photo
            </button>
          </div>
          
          <button
            onClick={handleSaveDump}
            disabled={!dumpText.trim() || isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Saving...' : 'Capture'}
          </button>
        </div>
      </div>

      {/* Recent Dumps */}
      {dumps.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Recent Brain Dumps
          </h2>
          
          <div className="space-y-4">
            {dumps.slice(0, 5).map((dump) => {
              const IconComponent = getCategoryIcon(dump.category)
              return (
                <div
                  key={dump.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getCategoryColor(dump.category)}`}>
                      <IconComponent className="w-3 h-3" />
                      {dump.category}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(dump.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{dump.content}</p>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => mockAIProcess(dump)}
                      className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-500/70 hover:to-pink-500/70 rounded-lg text-sm transition-all duration-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Ask AI to Process
                    </button>
                    
                    <button className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all duration-200">
                      <ArrowRight className="w-3 h-3" />
                      Move to Database
                    </button>
                    
                    <button 
                      onClick={() => deleteDump(dump.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Processing
              </h3>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">Original dump:</p>
              <p className="text-gray-300">{selectedDump?.content}</p>
            </div>
            
            <div className="bg-purple-500/10 rounded-lg p-4">
              <p className="text-sm text-purple-400 mb-2">AI Response:</p>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                  Processing your thoughts...
                </div>
              ) : (
                <p className="text-gray-300">{aiResponse}</p>
              )}
            </div>
            
            {!isProcessing && (
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-2 px-4 rounded-lg transition-all duration-200">
                  Apply Suggestions
                </button>
                <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg transition-all duration-200">
                  Continue Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

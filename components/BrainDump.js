import React, { useState, useEffect, useRef } from 'react'
import { Brain, Sparkles, Mic, MicOff, Save, Trash2, Tag, Calendar, Target, Home, Leaf, Heart, Book, DollarSign, Users, Camera, Lightbulb, ArrowRight, MessageCircle, Plus, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BrainDump() {
  const [dumpText, setDumpText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [dumps, setDumps] = useState([])
  const [selectedDump, setSelectedDump] = useState(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [followUpMessage, setFollowUpMessage] = useState('')
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
    }
  }

  const categorizeDump = (text) => {
    const categories = {
      goals: ['goal', 'want to', 'need to', 'should', 'career', 'transition', 'house', 'future', 'plan', 'achieve'],
      tasks: ['todo', 'need to do', 'remember', 'call', 'buy', 'fix', 'schedule', 'appointment', 'email', 'order'],
      garden: ['plant', 'garden', 'harvest', 'seeds', 'water', 'herbs', 'vegetables', 'grow', 'soil', 'compost'],
      spiritual: ['tarot', 'meditation', 'insight', 'dream', 'feeling', 'intuition', 'energy', 'spiritual', 'moon', 'astrology'],
      health: ['cycle', 'pcos', 'pmdd', 'weight', 'exercise', 'vitamins', 'mood', 'body', 'tired', 'energy'],
      home: ['house', 'room', 'clean', 'organize', 'ceiling fan', 'project', 'repair', 'decorate', 'kitchen'],
      finance: ['money', 'budget', 'invest', 'save', 'spending', 'bills', 'income', 'expense', 'financial'],
      relationships: ['friend', 'family', 'birthday', 'call', 'text', 'visit', 'love', 'partner', 'social'],
      learning: ['course', 'book', 'study', 'learn', 'research', 'video', 'skill', 'knowledge', 'read'],
      random: ['idea', 'thought', 'random', 'brain dump', 'note', 'wonder', 'curious']
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
      
      setDumps([data[0], ...dumps])
      setDumpText('')
    } catch (error) {
      console.error('Error saving dump:', error)
      alert('Error saving dump. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const processWithAI = async (dump) => {
    setIsProcessing(true)
    setSelectedDump(dump)
    setShowAIChat(true)
    setChatHistory([])
    setSuggestions([])
    
    try {
      const response = await fetch('/api/process-dump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: dump.content,
          category: dump.category,
          userContext: {
            recentDumps: dumps.slice(0, 5).map(d => ({ content: d.content, category: d.category }))
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAiResponse(data.response)
        setSuggestions(data.suggestions || [])
        setChatHistory([
          { role: 'user', content: dump.content },
          { role: 'assistant', content: data.response }
        ])
      } else {
        setAiResponse(data.fallback || "I'm having trouble processing this right now, but I can see it's important to you. Let's save it and come back to it later!")
      }
    } catch (error) {
      console.error('Error processing with AI:', error)
      setAiResponse("I'm having some technical difficulties, but your thought is captured safely. Let's explore this together once I'm back online!")
    } finally {
      setIsProcessing(false)
    }
  }

  const sendFollowUp = async () => {
    if (!followUpMessage.trim()) return
    
    const userMessage = { role: 'user', content: followUpMessage }
    setChatHistory([...chatHistory, userMessage])
    setFollowUpMessage('')
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/chat-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: followUpMessage,
          history: chatHistory,
          originalDump: selectedDump
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        const assistantMessage = { role: 'assistant', content: data.response }
        setChatHistory(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error in follow-up:', error)
    } finally {
      setIsProcessing(false)
    }
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

  const markAsProcessed = async (id) => {
    try {
      const { error } = await supabase
        .from('brain_dumps')
        .update({ processed: true })
        .eq('id', id)

      if (error) throw error
      
      setDumps(dumps.map(dump => 
        dump.id === id ? { ...dump, processed: true } : dump
      ))
    } catch (error) {
      console.error('Error updating dump:', error)
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
                  className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-200 ${
                    dump.processed ? 'border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getCategoryColor(dump.category)}`}>
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
                      {new Date(dump.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{dump.content}</p>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <button 
                      onClick={() => processWithAI(dump)}
                      className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-500/70 hover:to-pink-500/70 rounded-lg text-sm transition-all duration-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      AI Process
                    </button>
                    
                    <button 
                      onClick={() => markAsProcessed(dump.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm transition-all duration-200"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Mark Done
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

      {/* Enhanced AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
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
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs mt-2 ${getCategoryColor(selectedDump?.category)}`}>
                {React.createElement(getCategoryIcon(selectedDump?.category), { className: "w-3 h-3" })}
                {selectedDump?.category}
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500/10 ml-8' 
                      : 'bg-purple-500/10 mr-8'
                  }`}
                >
                  <p className="text-sm text-gray-400 mb-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <p className="text-gray-300">{message.content}</p>
                </div>
              ))}
              
              {isProcessing && (
                <div className="bg-purple-500/10 mr-8 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    Processing your thoughts...
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-yellow-500/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-400 mb-2">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-full text-xs transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Follow-up input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={followUpMessage}
                onChange={(e) => setFollowUpMessage(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && sendFollowUp()}
              />
              <button
                onClick={sendFollowUp}
                disabled={!followUpMessage.trim() || isProcessing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-2 px-4 rounded-lg transition-all duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

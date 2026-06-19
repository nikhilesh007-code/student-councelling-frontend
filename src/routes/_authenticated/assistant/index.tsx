import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { LockedState } from '../../../components/layout/LockedState'

export const Route = createFileRoute('/_authenticated/assistant/')({
  component: AssistantPage,
})

const MOCK_CHAT_HISTORY = [
  { id: 1, title: 'Resume Review & Feedback', date: 'Today' },
  { id: 2, title: 'Frontend Developer Roadmap', date: 'Yesterday' },
  { id: 3, title: 'Interview Prep for Google', date: 'Oct 15' },
  { id: 4, title: 'What is System Design?', date: 'Oct 10' }
]

const MOCK_INSIGHTS = {
  career: 'Frontend Developer',
  skills: ['React', 'TypeScript', 'Node.js', 'System Design'],
  nextActions: [
    'Complete the Advanced React module',
    'Apply to 3 Frontend Internships',
    'Add your latest project to your resume'
  ]
}

const SUGGESTED_PROMPTS = [
  'What career suits me?',
  'Analyze my skills',
  'Recommend internships',
  'Create a learning roadmap',
  'Improve my resume',
  'Explain skill gaps'
]

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

function AssistantPage() {
  const context = useRouteContext({ strict: false }) as any;
  const completionPercentage = context?.completionPercentage || 0;
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  if (completionPercentage < 60) {
    return (
      <DashboardLayout>
        <LockedState />
      </DashboardLayout>
    )
  }

  // Future Integration Preparation: This function is structured to be easily 
  // replaced by Ollama, Gemini API, OpenAI, or a LangGraph backend.
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    // Simulate AI network delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: getMockResponse(messageText),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  const handleSuggestedPromptClick = (prompt: string) => {
    sendMessage(prompt)
  }

  const getMockResponse = (input: string): string => {
    const lower = input.toLowerCase()
    if (lower.includes('resume')) return 'I can definitely help with your resume! Please upload it via the Resume Analysis tool, and I will parse your experience to provide ATS optimization tips and keyword recommendations.'
    if (lower.includes('roadmap')) return 'Based on your goal to become a Frontend Developer, I recommend starting with advanced JavaScript concepts, followed by React, State Management (Zustand/Redux), and Next.js for server-side rendering.'
    if (lower.includes('skill')) return 'Your current profile shows strong proficiency in React and Tailwind CSS. However, adding TypeScript and basic Node.js to your stack will significantly boost your employability for full-stack roles.'
    if (lower.includes('internship')) return 'I found 3 great internships matching your profile at Google, Microsoft, and Netflix. Would you like me to tailor your cover letter for these specific roles?'
    return "That's a great question! I'm your AI Career Assistant. While I'm currently running in demonstration mode, I can help you analyze your skills, build roadmaps, and review your resume."
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
           <div className="w-12 h-12 border-4 border-emerald-100 rounded-full animate-spin border-t-[#00a878]"></div>
           <p className="mt-4 text-slate-500 font-medium">Initializing AI Assistant...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-w-0 w-full max-w-[1600px] mx-auto pb-6 h-[calc(100vh-100px)] flex flex-col">
        
        {/* Header (hidden on very small screens to save space) */}
        <div className="mb-4 hidden sm:flex justify-between items-end gap-4 shrink-0">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2 mb-1">
              AI Career Assistant <span className="material-symbols-outlined text-[#00a878]">psychology</span>
            </h2>
            <p className="text-[14px] text-slate-500">Your personal guide for career growth, interview prep, and skill planning.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 flex-1 overflow-hidden h-full">
          
          {/* Left Column (History) - 3 cols */}
          <div className="hidden lg:flex lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex-col overflow-hidden min-w-0">
            <div className="p-4 border-b border-slate-100">
              <button 
                onClick={() => setMessages([])}
                className="w-full bg-[#00a878] text-white px-4 py-2.5 rounded-xl text-[13px] font-extrabold hover:bg-[#008b63] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span> New Chat
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:border-[#00a878] focus:ring-1 focus:ring-[#00a878]" 
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
              </div>
              <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Recent Conversations</h3>
              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-350px)] scrollbar-hide">
                {MOCK_CHAT_HISTORY.map(chat => (
                  <button key={chat.id} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors group flex items-center justify-between border border-transparent hover:border-slate-100">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-700 truncate group-hover:text-[#00a878]">{chat.title}</p>
                      <p className="text-[11px] font-medium text-slate-400">{chat.date}</p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0 ml-2">delete</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column (Main Chat Interface) - 6 cols */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-w-0 overflow-hidden h-full relative">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide flex flex-col">
              {messages.length === 0 ? (
                // Empty State
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-[#00a878] mb-6 border border-emerald-100">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">How can I help you today?</h3>
                  <p className="text-[13px] text-slate-500 mb-8">I can analyze your skills, build personalized roadmaps, and prepare you for interviews.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSuggestedPromptClick(prompt)}
                        className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-left hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
                      >
                        <p className="text-[13px] font-bold text-slate-700 group-hover:text-[#00a878]">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Chat Bubbles
                <div className="space-y-6 pb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
                        ${msg.role === 'user' ? 'bg-[#00a878] text-white' : 'bg-slate-100 text-[#00a878] border border-slate-200'}`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {msg.role === 'user' ? 'person' : 'psychology'}
                        </span>
                      </div>
                      
                      {/* Bubble */}
                      <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed
                          ${msg.role === 'user' 
                            ? 'bg-[#00a878] text-white rounded-tr-none' 
                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-4 flex-row">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-[#00a878] border border-slate-200 flex items-center justify-center shrink-0 mt-1">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0">
              <div className="relative flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-[#00a878] focus-within:ring-1 focus-within:ring-[#00a878] transition-all">
                <button className="p-2 text-slate-400 hover:text-[#00a878] transition-colors shrink-0">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything about your career..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 text-[14px] text-slate-700"
                  rows={1}
                />
                <button 
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
                  className={`p-2.5 rounded-xl shrink-0 transition-all flex items-center justify-center
                    ${inputText.trim() && !isTyping 
                      ? 'bg-[#00a878] text-white shadow-sm hover:bg-[#008b63]' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
              <p className="text-center text-[10px] font-bold text-slate-400 mt-3">
                AI Assistant can make mistakes. Consider verifying important information.
              </p>
            </div>
            
          </div>

          {/* Right Column (Insights Panel) - 3 cols */}
          <div className="hidden xl:flex xl:col-span-3 flex-col space-y-6 min-w-0">
            
            {/* Career Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0">
              <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#00a878]">track_changes</span> Current Focus
              </h3>
              <div className="mb-5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Role</p>
                <p className="text-[14px] font-extrabold text-slate-800">{MOCK_INSIGHTS.career}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Skills</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_INSIGHTS.skills.map(skill => (
                    <span key={skill} className="bg-emerald-50 border border-emerald-100 text-[#00a878] px-2 py-1 rounded-md text-[10px] font-extrabold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-w-0 flex-1">
              <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500">task_alt</span> Suggested Actions
              </h3>
              <ul className="space-y-4 mb-6">
                {MOCK_INSIGHTS.nextActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-300 text-[18px] mt-0.5">radio_button_unchecked</span>
                    <p className="text-[13px] font-medium text-slate-700 leading-snug">{action}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Tools */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-0">
              <h3 className="text-[13px] font-extrabold text-slate-900 mb-3">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">map</span> Roadmap
                </button>
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">description</span> Resume
                </button>
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">work</span> Jobs
                </button>
                <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[11px] font-bold hover:border-[#00a878] hover:text-[#00a878] transition-colors text-center flex flex-col items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">analytics</span> Skills
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

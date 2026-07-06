import { createFileRoute, useRouteContext, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
})

function getGreetingInfo() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Good Morning", subtitle: "Start your day by building your future." };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Good Afternoon", subtitle: "Keep the momentum going." };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: "Good Evening", subtitle: "Every step today brings you closer to your dream career." };
  } else {
    return { greeting: "Good Night", subtitle: "Reflect, recharge, and prepare for tomorrow." };
  }
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// 50 Motivational Quotes
const MOTIVATIONAL_QUOTES = [
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action.", author: "A.P.J Abdul Kalam" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Wear your failure as a badge of honor.", author: "Sundar Pichai" },
  { text: "Be passionate and bold. Always keep learning. You stop doing useful things if you don't learn.", author: "Satya Nadella" },
  { text: "Life should be great rather than long.", author: "Dr. B. R. Ambedkar" },
  { text: "Arise, awake, and stop not till the goal is reached.", author: "Swami Vivekananda" },
  { text: "To succeed in your mission, you must have single-minded devotion to your goal.", author: "A.P.J Abdul Kalam" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Nothing will work unless you do.", author: "Maya Angelou" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "We must be the change we wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "If you want to shine like a sun, first burn like a sun.", author: "A.P.J Abdul Kalam" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Don't be afraid to fail. It's not the end of the world, and in many ways, it's the first step toward learning.", author: "Jon Hamm" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "If you judge people, you have no time to love them.", author: "Mother Teresa" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Eighty percent of success is showing up.", author: "Woody Allen" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso" },
  { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.", author: "Johann Wolfgang von Goethe" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "Life shrinks or expands in proportion to one's courage.", author: "Anais Nin" },
  { text: "If you hear a voice within you say “you cannot paint,” then by all means paint and that voice will be silenced.", author: "Vincent Van Gogh" },
  { text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
  { text: "Ask and it will be given to you; search, and you will find; knock and the door will be opened for you.", author: "Jesus" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" }
];



const CAREER_FACTS = [
  "Recruiters spend only a few seconds reviewing resumes.",
  "Projects often matter more than certificates.",
  "Networking opens many career opportunities.",
  "Git is one of the most requested developer skills.",
  "Soft skills are just as important as technical skills.",
  "Most open positions are filled through networking.",
  "Continuous learning is the key to tech career longevity.",
  "A tailored resume beats a generic one every time.",
  "Cloud computing skills are in high demand across all industries.",
  "Mock interviews significantly increase your chances of passing real ones.",
  "Open source contributions can make your portfolio stand out.",
  "Data structures and algorithms are core to passing technical interviews.",
  "Problem-solving is the most valued skill by tech employers.",
  "A strong LinkedIn profile can attract inbound job offers.",
  "Mentorship can accelerate your career growth exponentially."
];

const CAREER_TIPS = [
  "Keep every project on GitHub with a clean README.",
  "Recruiters value projects more than tutorial certificates.",
  "Build one strong project instead of ten unfinished ones.",
  "Learning consistently is more valuable than studying for long hours occasionally.",
  "Tailor your resume for the specific job description you're applying to.",
  "Prepare STAR (Situation, Task, Action, Result) stories for behavioral interviews.",
  "Connect with industry professionals on LinkedIn with a personalized note.",
  "Practice speaking your thought process out loud for technical interviews.",
  "Contribute to open source to show you can work on existing large codebases.",
  "Always ask good questions at the end of an interview.",
  "Keep track of your accomplishments at work or in projects as they happen.",
  "Learn how to use a debugger properly; it will save you hundreds of hours.",
  "Read code written by experienced developers to improve your own style.",
  "Don't lie on your resume. You will be asked about it.",
  "Focus on mastering one tech stack before trying to learn everything."
];

const RECRUITER_INSIGHTS = [
  "Recruiters usually spend only a few seconds scanning a resume.",
  "Projects with screenshots stand out more.",
  "Numbers and measurable achievements make resumes stronger.",
  "A strong LinkedIn profile increases recruiter visibility.",
  "Typos on a resume are a major red flag for detail-oriented roles.",
  "We look for candidates who show genuine passion, not just skills.",
  "A clean, single-column resume format is best for ATS systems.",
  "Gaps in employment are fine, just be prepared to explain them positively.",
  "Highlighting soft skills like communication and teamwork is critical.",
  "Including a link to a live portfolio or project repository is a huge plus."
];

const DID_YOU_KNOW = [
  "Git was created by Linus Torvalds in 2005.",
  "Python was released in 1991 by Guido van Rossum.",
  "Docker was first released in 2013.",
  "Google receives millions of job applications every year.",
  "Communication skills consistently rank among employers' top hiring criteria.",
  "The first computer bug was an actual real-life moth found in 1947.",
  "JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "The original name of Java was Oak.",
  "More than 90% of the world's data was generated in the last two years.",
  "Over 70% of developers are self-taught or learned through bootcamps."
];

const MODULES = [
  { id: 'profile', title: 'Profile', icon: 'person', desc: 'Build your professional identity.', link: '/profile' },
  { id: 'recommendation', title: 'Career Guidance', icon: 'explore', desc: 'Discover your ideal career paths.', link: '/recommendation' },
  { id: 'assessment', title: 'Skill Gap Analysis', icon: 'radar', desc: 'Discover your strengths and missing skills.', link: '/assessment' },
  { id: 'roadmap', title: 'Career Roadmap', icon: 'map', desc: 'Follow a step-by-step master plan.', link: '/roadmap' },
  { id: 'resume', title: 'Resume Analysis', icon: 'description', desc: 'Optimize your resume for recruiters.', link: '/resume' },
  { id: 'planner', title: 'Study Planner', icon: 'calendar_month', desc: 'Organize your learning schedule.', link: '/planner' },
  { id: 'resources', title: 'Learning Resources', icon: 'menu_book', desc: 'Access curated study materials.', link: '/resources' },
  { id: 'placement', title: 'Placement Coach', icon: 'model_training', desc: 'Prepare for your interviews.', link: '/placement' },
  { id: 'opportunities', title: 'Career Opportunities', icon: 'work', desc: 'Find jobs and internships.', link: '/opportunities' },
  { id: 'progress', title: 'Progress Tracking', icon: 'trending_up', desc: 'Monitor your overall journey.', link: '/progress' },
];

function Dashboard() {
  const context = useRouteContext({ strict: false }) as any;
  const sessionData = context?.sessionUser;
  const userName = sessionData?.name || 'Student'
  const userId = sessionData?.id;

  const [greetingInfo, setGreetingInfo] = useState(getGreetingInfo());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rotating/Random Content States
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  

  const factIdx = useMemo(() => Math.floor(Math.random() * CAREER_FACTS.length), []);
  const tipIdx = useMemo(() => Math.floor(Math.random() * CAREER_TIPS.length), []);
  const insightIdx = useMemo(() => Math.floor(Math.random() * RECRUITER_INSIGHTS.length), []);
  const dykIdx = useMemo(() => Math.floor(Math.random() * DID_YOU_KNOW.length), []);

  useEffect(() => {
    const updateGreeting = () => setGreetingInfo(getGreetingInfo());
    updateGreeting(); // Initial set
    const greetingInterval = setInterval(updateGreeting, 60000); // Check every minute

    const quoteInterval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setQuoteVisible(true);
      }, 500); // 500ms fade out before changing text
    }, 8000);
    return () => {
      clearInterval(greetingInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  // --- API QUERIES (Only for Continue Journey Status, No Analytics Displayed) ---

  const { data: profileData } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    },
    enabled: !!userId,
  });

  const { data: skillGapData } = useQuery({
    queryKey: ['skillGap', userId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/skill-gap/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error("Failed to fetch skill gap");
      const json = await res.json();
      return json.data;
    },
    enabled: !!userId,
  });

  const { data: roadmapData } = useQuery({
    queryKey: ['roadmap', userId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roadmap?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      const json = await res.json();
      return json.data;
    },
    enabled: !!userId,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['plannerTasks', userId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/study-planner/tasks?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      return json.tasks?.tasks || [];
    },
    enabled: !!userId,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!userId,
  });

  // --- DERIVED JOURNEY DATA ---
  
  const profileCompletion = profileData?.completionInfo?.percentage || 0;
  const isProfileComplete = profileCompletion > 50;
  const hasSkillGap = !!skillGapData;
  const hasRoadmap = !!roadmapData;
  const hasTasks = Array.isArray(tasksData) && tasksData.length > 0;
  const hasResume = !!profileData?.resumeUrl;
  const recentActivity = Array.isArray(notificationsData) ? notificationsData : [];

  const journeySteps = [
    { id: 'profile', title: 'Profile', icon: 'person', completed: isProfileComplete, link: '/profile', action: 'Complete Profile', desc: 'Build your foundation' },
    { id: 'recommendation', title: 'Career Guidance', icon: 'explore', completed: isProfileComplete, link: '/recommendation', action: 'Generate Guidance', desc: 'Find your path' }, 
    { id: 'assessment', title: 'Skill Gap', icon: 'radar', completed: hasSkillGap, link: '/assessment', action: 'Run Skill Gap Analysis', desc: 'Identify missing skills' },
    { id: 'roadmap', title: 'Roadmap', icon: 'map', completed: hasRoadmap, link: '/roadmap', action: 'Build Career Roadmap', desc: 'Plan your journey' },
    { id: 'planner', title: 'Learning', icon: 'menu_book', completed: hasTasks, link: '/planner', action: 'Generate Study Plan', desc: 'Start learning' },
    { id: 'resume', title: 'Resume', icon: 'description', completed: hasResume, link: '/resume', action: 'Upload Resume', desc: 'Get recruiter ready' },
    { id: 'placement', title: 'Placement', icon: 'model_training', completed: false, link: '/placement', action: 'Open Placement Coach', desc: 'Practice interviews' },
  ];
  
  const nextStep = journeySteps.find(step => !step.completed) || journeySteps[0];
  
  // Prioritize uncompleted modules for Featured Module
  const featurePool = useMemo(() => {
    const uncompleted = MODULES.filter(m => {
       const step = journeySteps.find(s => s.id === m.id);
       return step ? !step.completed : false;
    });
    return uncompleted.length > 0 ? uncompleted : MODULES;
  }, [profileData, skillGapData, roadmapData, tasksData]);
  
  const featuredModule = useMemo(() => featurePool[Math.floor(Math.random() * featurePool.length)], [featurePool]);

  const q = searchTerm.toLowerCase().trim();
  const showWidget = (title: string, tags: string[] = []) => {
    if (!q) return true;
    if (title.toLowerCase().includes(q)) return true;
    return tags.some(tag => tag.toLowerCase().includes(q));
  };

  return (
    <DashboardLayout
      searchPlaceholder="Search dashboard..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-[1400px] mx-auto flex flex-col gap-8 pb-16">
        
        {/* HEADER & MOTIVATION */}
        {showWidget('Overview', ['home']) && (
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div>
              <h2 className="text-[36px] font-extrabold text-slate-900 tracking-tight leading-tight">{greetingInfo.greeting}, {userName}</h2>
              <p className="text-[16px] text-slate-500 font-medium mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {greetingInfo.subtitle}
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 max-w-md w-full md:w-[420px] relative overflow-hidden group hover:shadow-md transition-all h-[110px] flex items-center">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
               <div className={`pl-4 transition-opacity duration-500 ease-in-out w-full ${quoteVisible ? 'opacity-100' : 'opacity-0'}`}>
                 <p className="text-[14px] font-semibold text-slate-700 italic leading-snug line-clamp-2">"{MOTIVATIONAL_QUOTES[quoteIdx].text}"</p>
                 <p className="text-[12px] font-bold text-emerald-600 mt-2">— {MOTIVATIONAL_QUOTES[quoteIdx].author}</p>
               </div>
            </div>
          </motion.div>
        )}

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CONTINUE, INSIGHT, DID YOU KNOW (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Continue Journey */}
            {showWidget('Continue Journey', ['next step', 'action']) && (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-lg shadow-emerald-900/10 overflow-hidden relative group min-h-[280px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="p-8 relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-emerald-200 text-[20px]">route</span>
                    <span className="text-[13px] font-bold text-emerald-100 uppercase tracking-wider">Continue Journey</span>
                  </div>
                  
                  <h3 className="text-[28px] font-black text-white leading-tight mb-3">See Your Roadmap to Achieve Your Goals</h3>
                  <p className="text-[15px] text-emerald-100/90 mb-8 font-medium">Follow your personalized AI roadmap and complete each milestone toward your dream career.</p>
                  
                  <Link to="/roadmap" className="mt-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold text-[15px] px-6 py-4 rounded-xl hover:bg-emerald-50 hover:scale-[1.02] transition-all shadow-md">
                    Open Roadmap <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Recruiter Insight */}
            {showWidget('Recruiter Insight', ['tips', 'hiring']) && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 flex flex-col group hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-amber-500">visibility</span>
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Recruiter Insight</span>
                </div>
                <p className="text-[17px] font-semibold text-slate-800 leading-snug">
                  "{RECRUITER_INSIGHTS[insightIdx]}"
                </p>
              </div>
            )}

            {/* Did You Know? */}
            {showWidget('Did You Know', ['facts', 'trivia']) && (
              <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">psychology_alt</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">Did you know?</h4>
                  <p className="text-[14px] font-medium text-slate-700 leading-snug">{DID_YOU_KNOW[dykIdx]}</p>
                </div>
              </div>
            )}
            
          </div>

          {/* RIGHT COLUMN: CAREER HUB & INSPIRATION (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Career Hub Grid */}
            {showWidget('Career Hub', ['modules', 'explore']) && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 ml-2">
                  <span className="material-symbols-outlined text-[24px] text-emerald-500">apps</span>
                  <h3 className="text-[20px] font-bold text-slate-800">Career Hub</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MODULES.map((mod, index) => (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.07 }}
                    >
                    <Link 
                      to={mod.link}
                      className="bg-white border border-slate-100 rounded-3xl p-6 flex items-start gap-5 group hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                    >
                      <div className="w-14 h-14 bg-emerald-50/80 rounded-2xl text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform duration-300">{mod.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="text-[17px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">{mod.title}</h4>
                        <p className="text-[13px] text-slate-500 leading-snug line-clamp-2">{mod.desc}</p>
                      </div>
                      <div className="pt-2 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1.5 transition-all">
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </div>
                    </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Inspiration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Career Fact of the Day */}
              {showWidget('Career Fact', ['daily', 'inspiration']) && (
                <div className="bg-slate-900 rounded-3xl p-7 flex flex-col relative overflow-hidden group min-h-[180px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <span className="material-symbols-outlined text-[20px] text-emerald-400">lightbulb</span>
                    <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Career Fact</h3>
                  </div>
                  <p className="text-[18px] font-bold text-white leading-snug relative z-10">
                    "{CAREER_FACTS[factIdx]}"
                  </p>
                </div>
              )}

              {/* Career Tip of the Day */}
              {showWidget('Career Tip', ['tips', 'advice']) && (
                <div className="bg-emerald-50/50 rounded-3xl p-7 border border-emerald-100 flex flex-col group min-h-[180px]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">tips_and_updates</span>
                    <h3 className="text-[13px] font-bold text-slate-600 uppercase tracking-wider">Career Tip</h3>
                  </div>
                  <p className="text-[18px] font-bold text-emerald-900 leading-snug">
                    {CAREER_TIPS[tipIdx]}
                  </p>
                </div>
              )}

            </div>

            {/* Feature Spotlight & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              
              {/* Feature Spotlight */}
              {showWidget('Featured', ['module', 'highlight']) && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-3xl p-7 border border-indigo-100/50 flex flex-col group hover:shadow-md transition-all h-full min-h-[200px]">
                  <div className="flex items-center gap-2 mb-4 text-indigo-500">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    <span className="text-[13px] font-bold uppercase tracking-wider">Featured Today</span>
                  </div>
                  <h4 className="text-[22px] font-extrabold text-slate-900 mb-2">{featuredModule.title}</h4>
                  <p className="text-[15px] text-slate-600 mb-6 flex-1">{featuredModule.desc}</p>
                  <Link to={featuredModule.link} className="inline-flex items-center justify-between bg-white border border-indigo-100 px-5 py-3 rounded-xl font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors mt-auto">
                    <span>Open Module</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              )}

              {/* Recent Activity */}
              {showWidget('Activity', ['notifications']) && recentActivity.length > 0 && (
                <div className="bg-white rounded-3xl p-7 border border-slate-100 flex flex-col h-full min-h-[200px]">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-[20px] text-slate-400">history</span>
                    <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Recent Activity</span>
                  </div>
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[200px]">
                    {recentActivity.slice(0, 3).map((activity: any, idx: number) => {
                      let formattedTitle = activity.title || activity.message;
                      let formattedIcon = activity.icon || "notifications";
                      
                      const tLower = formattedTitle.toLowerCase();
                      if(tLower.includes("started") || tLower.includes("learning")) formattedIcon = "play_circle";
                      else if(tLower.includes("roadmap") || tLower.includes("plan")) formattedIcon = "map";
                      else if(tLower.includes("profile")) formattedIcon = "person";
                      else if(tLower.includes("task") || tLower.includes("completed")) formattedIcon = "check_circle";
                      
                      return (
                        <div key={idx} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">{formattedIcon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-slate-800 truncate">{formattedTitle}</p>
                            <span className="text-[12px] font-medium text-slate-400">{timeAgo(activity.createdAt || new Date().toISOString())}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>

        </motion.div>

      </motion.div>
    </DashboardLayout>
  )
}

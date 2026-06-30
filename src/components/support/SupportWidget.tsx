import React, { useState, useEffect, useRef } from 'react';
import { feedbackApi } from '../../lib/feedback-api';
import { toast } from 'sonner';

const MODULES = [
  'Dashboard', 'Profile', 'Career Guidance', 'Skill Gap Analysis', 
  'Career Roadmap', 'Learning Resources', 'Opportunities', 
  'Resume Analysis', 'Placement Preparation', 'Progress Tracking', 
  'Study Planner', 'Notifications', 'Settings'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const QUICK_ACTIONS = [
  { id: 'bug', title: 'Report a Bug', desc: 'Report crashes, broken buttons, or unexpected behaviour.', icon: 'bug_report', category: 'Bug Report' },
  { id: 'feature', title: 'Suggest a Feature', desc: 'Share ideas that could improve CareerAI.', icon: 'lightbulb', category: 'Feature Suggestion' },
  { id: 'ui', title: 'Report a UI Glitch', desc: 'Report layout issues, responsiveness, visual bugs.', icon: 'design_services', category: 'UI Glitch' },
  { id: 'support', title: 'Contact Support', desc: 'Send a general question or request.', icon: 'support_agent', category: 'General Support' }
];

interface SupportWidgetProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({ userId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'my_reports'>('new');
  
  // Form State
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [priority, setPriority] = useState('Low');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'my_reports') {
      fetchReports();
    }
  }, [isOpen, activeTab]);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await feedbackApi.getMyFeedback(userId);
      if (res.success) {
        setReports(res.feedback);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reports');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, and JPEG formats are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return toast.error('Subject is required');
    if (description.trim().length < 20) return toast.error('Description must be at least 20 characters');
    if (description.length > 1000) return toast.error('Description cannot exceed 1000 characters');

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (userId) formData.append('userId', userId);
      formData.append('category', selectedAction.category);
      formData.append('module', selectedModule);
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('priority', priority);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await feedbackApi.submitFeedback(formData);
      toast.success('Thank you! Your feedback has been submitted.');
      
      // Reset form & close
      setSubject('');
      setDescription('');
      setSelectedModule(MODULES[0]);
      setPriority('Low');
      setAttachment(null);
      setSelectedAction(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await feedbackApi.deleteFeedback(id, userId);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    const action = QUICK_ACTIONS.find(a => a.category === category);
    return action ? action.icon : 'support_agent';
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 transition-opacity">
          
          {/* Modal Content */}
          <div 
            ref={modalRef}
            className="bg-white w-full sm:w-[500px] h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300"
          >
            {/* Header */}
            <div className="bg-slate-800 px-6 py-5 shrink-0 relative">
              <h2 className="text-xl font-extrabold text-white mb-1">Support & Feedback</h2>
              <p className="text-slate-300 text-sm">Need help or found something that isn't working? Let us know and we'll look into it.</p>
              
              <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
              <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'new' ? 'text-[#00a878] border-b-2 border-[#00a878] bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
              >
                New Report
              </button>
              <button 
                onClick={() => setActiveTab('my_reports')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'my_reports' ? 'text-[#00a878] border-b-2 border-[#00a878] bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
              >
                My Reports
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              
              {/* --- NEW REPORT TAB --- */}
              {activeTab === 'new' && (
                <div>
                  {!selectedAction ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {QUICK_ACTIONS.map(action => (
                        <button 
                          key={action.id}
                          onClick={() => setSelectedAction(action)}
                          className="bg-white border border-slate-200 hover:border-[#00a878] hover:shadow-md p-4 rounded-xl text-left transition-all group flex flex-col items-start gap-2 h-full"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#00a878] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-[14px]">{action.title}</h4>
                            <p className="text-slate-500 text-[12px] leading-snug mt-1">{action.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in duration-300">
                      
                      <div className="flex items-center gap-3 mb-2">
                        <button type="button" onClick={() => setSelectedAction(null)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        </button>
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</div>
                          <div className="text-[14px] font-extrabold text-[#00a878] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">{selectedAction.icon}</span>
                            {selectedAction.category}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878]/50 focus:border-[#00a878] transition-all"
                          placeholder="Briefly describe the issue..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 flex justify-between">
                          <span>Description <span className="text-red-500">*</span></span>
                          <span className={`text-[11px] font-medium ${description.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>{description.length}/1000</span>
                        </label>
                        <textarea 
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878]/50 focus:border-[#00a878] transition-all resize-none h-32"
                          placeholder="Provide details. What happened? What did you expect?"
                          required
                          minLength={20}
                          maxLength={1000}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Module</label>
                          <select 
                            value={selectedModule}
                            onChange={e => setSelectedModule(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878]/50 focus:border-[#00a878] appearance-none cursor-pointer"
                          >
                            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                          <select 
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a878]/50 focus:border-[#00a878] appearance-none cursor-pointer"
                          >
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Attachment (Optional)</label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                            Upload Image
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden" 
                          />
                          {attachment && (
                            <div className="flex items-center gap-2 bg-emerald-50 text-[#00a878] px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 flex-1 overflow-hidden">
                              <span className="material-symbols-outlined text-[16px]">image</span>
                              <span className="truncate">{attachment.name}</span>
                              <button type="button" onClick={() => setAttachment(null)} className="ml-auto hover:text-emerald-700">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">PNG or JPG up to 5MB</p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-2">
                        <button 
                          type="button" 
                          onClick={onClose}
                          className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2.5 rounded-xl font-bold bg-[#00a878] text-white hover:bg-[#008b63] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Report
                              <span className="material-symbols-outlined text-[18px]">send</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* --- MY REPORTS TAB --- */}
              {activeTab === 'my_reports' && (
                <div className="flex flex-col h-full">
                  {isLoadingReports ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-4xl mb-3 text-[#00a878]">progress_activity</span>
                      <p className="text-sm font-bold">Loading your reports...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">inbox</span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-700 mb-1">No reports submitted yet.</h3>
                      <p className="text-sm text-slate-500 max-w-[250px]">When you submit a bug report or feature suggestion, it will appear here.</p>
                      <button 
                        onClick={() => setActiveTab('new')}
                        className="mt-6 px-5 py-2 bg-emerald-50 text-[#00a878] font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report: any) => (
                        <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                          {/* Priority Indicator Strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(report.priority).split(' ')[1]}`}></div>
                          
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-slate-400">{getCategoryIcon(report.category)}</span>
                              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{report.category}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <h4 className="font-extrabold text-slate-800 text-[15px] mb-1 pl-2 pr-8">{report.subject}</h4>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3 pl-2">
                            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">view_module</span>
                              {report.module}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${getPriorityColor(report.priority)}`}>
                              <span className="material-symbols-outlined text-[14px]">flag</span>
                              {report.priority}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 pl-2">
                            <span className="text-[11px] font-medium text-slate-400">
                              {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            {report.status === 'OPEN' && (
                              <button 
                                onClick={() => handleDelete(report.id)}
                                className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export interface UserProfile {
  branch?: string | null;
  year?: string | null;
  skills?: string[];
  interests?: string[];
  careerGoal?: string | null;
}

export interface RecommendedCareer {
  id: string | number;
  title: string;
  matchScore: number;
  averageSalary: string;
  demandLevel: string;
  jobGrowth: string;
  requiredSkills: string[];
  recommendedSkills: string[];
  recommendedCertifications: string[];
  topIndustries: string[];
  tags: string[];
  icon: string;
  colorClass: string;
  illustrationUrl?: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  desc: string;
  color: string;
}

export interface RecommendationResult {
  topMatches: RecommendedCareer[];
  otherOptions: RecommendedCareer[];
  aiRecommendation: {
    career: string;
    reasons: string[];
  };
  roadmap: RoadmapStep[];
}

// Pre-defined database of careers for rule-based matching
const CAREERS_DATABASE: RecommendedCareer[] = [
  {
    id: 1,
    title: 'Software Engineer',
    matchScore: 0,
    averageSalary: '₹8 - 15 LPA',
    demandLevel: 'Very High',
    jobGrowth: 'Excellent',
    requiredSkills: ['Python', 'Data Structures', 'Algorithms', 'Java', 'C++'],
    recommendedSkills: ['System Design', 'Cloud Computing'],
    recommendedCertifications: ['AWS Certified Developer', 'Meta Backend Developer'],
    topIndustries: ['IT Services', 'Product Based Companies', 'Startups'],
    tags: ['High Demand', 'Great Growth'],
    icon: 'code',
    colorClass: 'text-emerald-500 bg-emerald-50',
    illustrationUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGTx96Mayvzfwpw054Gc22AcJFtsOLqe2a-xly-7HSHNYK4wCj_mCiFV-sQseC70xMXXVrAolzLHxEaIjHdwd-YfEnEt4hE5-461PbJMpSTKFJ2-eVVZ3DNMNdkYQrCbrF42KYnX4tKaLrpsaUOvXXUhkZlc23MhhrM8-x98Dzj21mGSMEz29DXteitLShABRerka4YFhG5y2VHMw4bXoNqqnk_v8De3YYYwJQ6jzm4oaZL5G8mf74c71O2VxckXZNwkgCqKLSghrb'
  },
  {
    id: 2,
    title: 'Data Scientist',
    matchScore: 0,
    averageSalary: '₹10 - 20 LPA',
    demandLevel: 'High',
    jobGrowth: 'Exceptional',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
    recommendedSkills: ['Deep Learning', 'PyTorch', 'TensorFlow'],
    recommendedCertifications: ['Google Data Analytics', 'IBM Data Science'],
    topIndustries: ['Finance', 'Healthcare', 'E-commerce', 'Tech'],
    tags: ['High Paying', 'Future Proof'],
    icon: '🧬',
    colorClass: 'text-purple-500 bg-purple-50'
  },
  {
    id: 3,
    title: 'Frontend Developer',
    matchScore: 0,
    averageSalary: '₹6 - 12 LPA',
    demandLevel: 'Very High',
    jobGrowth: 'Good',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    recommendedSkills: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    recommendedCertifications: ['Meta Frontend Developer', 'Responsive Web Design'],
    topIndustries: ['Software Agencies', 'Startups', 'Product Companies'],
    tags: ['Creative', 'High Demand'],
    icon: 'web',
    colorClass: 'text-blue-500 bg-blue-50'
  },
  {
    id: 4,
    title: 'Cyber Security Analyst',
    matchScore: 0,
    averageSalary: '₹7 - 14 LPA',
    demandLevel: 'High',
    jobGrowth: 'Very Good',
    requiredSkills: ['Networking', 'Linux', 'Security Frameworks', 'Cryptography'],
    recommendedSkills: ['Ethical Hacking', 'Penetration Testing'],
    recommendedCertifications: ['CompTIA Security+', 'CEH (Certified Ethical Hacker)'],
    topIndustries: ['Banking', 'Government', 'Consulting'],
    tags: ['Secure Career', 'High Growth'],
    icon: '🛡️',
    colorClass: 'text-red-500 bg-red-50'
  },
  {
    id: 5,
    title: 'Product Manager',
    matchScore: 0,
    averageSalary: '₹12 - 25 LPA',
    demandLevel: 'Medium-High',
    jobGrowth: 'Excellent',
    requiredSkills: ['Agile', 'Product Strategy', 'Communication', 'Data Analysis'],
    recommendedSkills: ['A/B Testing', 'UI/UX Basics', 'Stakeholder Management'],
    recommendedCertifications: ['CSPO', 'Google Project Management'],
    topIndustries: ['Tech', 'Fintech', 'Edtech'],
    tags: ['Leadership', 'High Impact'],
    icon: 'insights',
    colorClass: 'text-amber-500 bg-amber-50'
  }
];

function calculateMatchScore(career: RecommendedCareer, profile: UserProfile): number {
  let score = 50; // Base score
  
  const userSkills = profile.skills?.map(s => s.toLowerCase()) || [];
  const userInterests = profile.interests?.map(i => i.toLowerCase()) || [];
  const careerGoal = (profile.careerGoal || '').toLowerCase();
  
  // Goal matching (Heavy weight)
  if (careerGoal && careerGoal.includes(career.title.toLowerCase())) {
    score += 30;
  }
  
  // Skills matching
  career.requiredSkills.forEach(reqSkill => {
    if (userSkills.some(s => reqSkill.toLowerCase().includes(s) || s.includes(reqSkill.toLowerCase()))) {
      score += 10;
    }
  });

  career.recommendedSkills.forEach(recSkill => {
    if (userSkills.some(s => recSkill.toLowerCase().includes(s) || s.includes(recSkill.toLowerCase()))) {
      score += 5;
    }
  });
  
  // Interests matching
  userInterests.forEach(interest => {
    if (career.title.toLowerCase().includes(interest) || career.requiredSkills.some(s => s.toLowerCase().includes(interest))) {
      score += 10;
    }
  });
  
  // Cap score at 98 for realism
  return Math.min(Math.round(score), 98);
}

export function generateCareerRecommendations(profile: UserProfile | null): RecommendationResult {
  if (!profile) {
    // Return default generic recommendations if no profile exists yet
    const sorted = [...CAREERS_DATABASE].sort((a, b) => b.id > a.id ? -1 : 1);
    sorted[0].matchScore = 80;
    sorted[1].matchScore = 75;
    sorted[2].matchScore = 70;
    return generateResult(sorted, null);
  }

  const scoredCareers = CAREERS_DATABASE.map(career => ({
    ...career,
    matchScore: calculateMatchScore(career, profile)
  })).sort((a, b) => b.matchScore - a.matchScore);

  return generateResult(scoredCareers, profile);
}

function generateResult(scoredCareers: RecommendedCareer[], profile: UserProfile | null): RecommendationResult {
  const topMatches = scoredCareers.slice(0, 3);
  const otherOptions = scoredCareers.slice(3, 6);
  
  const primaryCareer = topMatches[0];
  
  let reasons = [
    `Strong alignment with your required core skills like ${primaryCareer.requiredSkills[0]}`,
    `High demand in the current job market`,
    `Fits your academic background`
  ];

  if (profile?.skills?.length && profile.skills.length > 0) {
    reasons[0] = `Matches your existing skills in ${profile.skills[0]}`;
  }

  if (profile?.careerGoal) {
    reasons[2] = `Directly aligns with your stated goal: ${profile.careerGoal}`;
  }

  return {
    topMatches,
    otherOptions,
    aiRecommendation: {
      career: primaryCareer.title,
      reasons
    },
    roadmap: [
      { step: 1, title: 'Master Core Fundamentals', desc: `Learn ${primaryCareer.requiredSkills.slice(0, 2).join(' and ')}`, color: 'bg-emerald-500' },
      { step: 2, title: 'Learn Advanced Concepts', desc: `Focus on ${primaryCareer.recommendedSkills.join(', ')}`, color: 'bg-blue-500' },
      { step: 3, title: 'Build Real-world Projects', desc: 'Create 3-5 solid projects for your portfolio', color: 'bg-purple-500' },
      { step: 4, title: 'Get Certified', desc: `Achieve ${primaryCareer.recommendedCertifications[0] || 'a relevant industry certification'}`, color: 'bg-orange-400' },
      { step: 5, title: 'Internship & Placement Prep', desc: 'Aptitude, Resume, Interviews', color: 'bg-pink-400' },
    ]
  };
}

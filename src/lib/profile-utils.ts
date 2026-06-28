export type ProfileData = {
  name?: string;
  branch?: string;
  year?: string;
  cgpa?: string | number;
  phone?: string;
  skills?: string[] | string;
  interests?: string[] | string;
  careerGoal?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
}

export function calculateProfileCompletion(profile: ProfileData | null, sessionUser: { name?: string | null, email?: string | null } | null): number {
  if (!profile && !sessionUser) return 0;
  
  // Core fields: Max 80%
  // 1. Name, 2. Email, 3. Branch, 4. Career Goal, 5. Skills, 6. Interests
  let coreFilled = 0;
  if (sessionUser?.name || profile?.name) coreFilled++;
  if (sessionUser?.email) coreFilled++;
  if (profile?.branch && profile.branch.trim() !== '') coreFilled++;
  if (profile?.careerGoal && profile.careerGoal.trim() !== '') coreFilled++;
  if (profile?.skills && (Array.isArray(profile.skills) ? profile.skills.length > 0 : (typeof profile.skills === 'string' && profile.skills.trim() !== ''))) coreFilled++;
  if (profile?.interests && (Array.isArray(profile.interests) ? profile.interests.length > 0 : (typeof profile.interests === 'string' && profile.interests.trim() !== ''))) coreFilled++;

  const coreScore = (coreFilled / 6) * 80; // 6 core fields = 80%

  // Optional fields: Max 20%
  // 1. Phone, 2. Bio, 3. LinkedIn, 4. GitHub, 5. CGPA, 6. Year
  let optionalFilled = 0;
  if (profile?.phone && profile.phone.trim() !== '') optionalFilled++;
  if (profile?.bio && profile.bio.trim() !== '') optionalFilled++;
  if (profile?.linkedin && profile.linkedin.trim() !== '') optionalFilled++;
  if (profile?.github && profile.github.trim() !== '') optionalFilled++;
  if (profile?.cgpa) optionalFilled++;
  if (profile?.year) optionalFilled++;

  const optionalScore = (optionalFilled / 6) * 20; // 6 optional fields = 20%
  
  return Math.min(100, Math.round(coreScore + optionalScore));
}

export function hasMissingMandatoryFields(profile: ProfileData | null): boolean {
  if (!profile) return true;
  
  const isMissing = (val: string | undefined | null) => !val || val.trim() === '';
  const isMissingArr = (val: string[] | string | undefined | null) => {
    if (!val) return true;
    if (Array.isArray(val)) return val.length === 0;
    return val.trim() === '';
  };

  return isMissing(profile.branch) || 
         isMissing(profile.year) || 
         isMissing(profile.careerGoal) || 
         isMissingArr(profile.skills) || 
         isMissingArr(profile.interests);
}

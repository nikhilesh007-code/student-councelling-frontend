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
  
  const fields = [
    sessionUser?.name || profile?.name,
    sessionUser?.email,
    profile?.phone,
    profile?.bio,
    profile?.careerGoal,
    profile?.linkedin,
    profile?.github,
    profile?.branch,
    profile?.cgpa ? String(profile.cgpa) : undefined
  ];
  
  let filledCount = fields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
  
  if (profile?.skills && (Array.isArray(profile.skills) ? profile.skills.length > 0 : (typeof profile.skills === 'string' && profile.skills.trim() !== ''))) {
    filledCount++;
  }
  
  // Total fields = 9 simple + 1 array = 10
  return Math.round((filledCount / 10) * 100);
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

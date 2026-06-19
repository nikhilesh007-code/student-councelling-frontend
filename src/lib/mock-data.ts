export type ProfileData = {
  branch: string;
  year: string;
  phone: string;
  skills: string[] | string;
  interests: string[] | string;
  careerGoal: string;
  linkedin: string;
  github: string;
  bio: string;
}

export const mockSessionUser = {
  name: "Demo Student",
  email: "demo.student@example.com",
};

export const mockProfileData: ProfileData = {
  branch: "Computer Science and Engineering",
  year: "2026",
  phone: "+91 9876543210",
  skills: ["React", "TypeScript", "Node.js", "Python"],
  interests: ["Web Development", "Artificial Intelligence", "Open Source"],
  careerGoal: "To become a Full Stack Developer and contribute to impactful open-source projects.",
  linkedin: "https://linkedin.com/in/demostudent",
  github: "https://github.com/demostudent",
  bio: "Passionate software engineering student eager to learn and build scalable web applications.",
};

// In a real frontend-only demo, we can persist updates to a variable or localStorage
let currentProfile = { ...mockProfileData };

export const getMockProfile = async (): Promise<ProfileData> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...currentProfile });
    }, 300);
  });
};

export const updateMockProfile = async (updates: Partial<ProfileData>): Promise<ProfileData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentProfile = { ...currentProfile, ...updates };
      resolve({ ...currentProfile });
    }, 400);
  });
};

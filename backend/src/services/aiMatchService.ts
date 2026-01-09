import pool from '../database/config';
import profileService from './profileService';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
}

interface UserProfile {
  skills: { name: string }[];
  experience: { jobTitle: string; description?: string }[];
  education: { degree: string; fieldOfStudy?: string }[];
  profile: { bio?: string; headline?: string };
}

export class AiMatchService {
  private readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // User requested "Gemini 2.5 Flash". Fallback to 1.5-flash if 2.5 is not valid/available yet.
  private readonly MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash'; 

  /**
   * Calculates the match score for a user against a specific job.
   * Tries to use Gemini API if key is present, otherwise falls back to keyword heuristic.
   */
  async calculateMatchScore(userId: number, job: Job): Promise<number> {
    try {
      const fullProfile = await profileService.getProfile(userId);
      const userProfile: UserProfile = {
        skills: fullProfile.skills,
        experience: fullProfile.experience,
        education: fullProfile.education,
        profile: fullProfile.profile
      };

      if (this.GEMINI_API_KEY) {
        return await this.calculateWithGemini(userProfile, job);
      } else {
        return this.calculateHeuristicScore(userProfile, job);
      }
    } catch (error) {
      console.error('Error calculating match score:', error);
      return 0; // Default to 0 on error
    }
  }

  /**
   * Calculates the average match score for a user against a set of jobs.
   * Typically used for dashboard stats.
   */
  async calculateAverageMatchScore(userId: number, limit: number = 10): Promise<number> {
    try {
        // Fetch recent active jobs to compare against
        const jobsResult = await pool.query(
            `SELECT id, title, description, requirements, responsibilities, location, job_type, salary_min, salary_max
             FROM jobs
             WHERE status = 'published'
             ORDER BY created_at DESC
             LIMIT $1`,
            [limit]
        );

        if (jobsResult.rows.length === 0) return 0;

        const scores = await Promise.all(
            jobsResult.rows.map(job => this.calculateMatchScore(userId, job))
        );

        const total = scores.reduce((sum, score) => sum + score, 0);
        return Math.round(total / scores.length);
    } catch (error) {
        console.error('Error calculating average match score:', error);
        return 0;
    }
  }

  private async calculateWithGemini(user: UserProfile, job: Job): Promise<number> {
    try {
      // Simplified API call structure - assumes standard Google Generative AI REST format or SDK
      // Since we don't want to add heavy dependencies, we'll use fetch if Node 18+
      
      const prompt = `
        Role: Expert HR Recruiter.
        Task: Calculate a match percentage (0-100) for a candidate applying to a job.
        
        Job Details:
        Title: ${job.title}
        Description: ${job.description}
        Requirements: ${job.requirements}
        
        Candidate Profile:
        Headline: ${user.profile.headline}
        Skills: ${user.skills.map(s => s.name).join(', ')}
        Experience: ${user.experience.map(e => `${e.jobTitle}: ${e.description}`).join('; ')}
        Education: ${user.education.map(e => `${e.degree} in ${e.fieldOfStudy}`).join('; ')}
        
        Output only a single number (integer 0-100) representing the match percentage. No text.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL_NAME}:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
          const score = parseInt(text.trim());
          return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
      }
      return 0;
    } catch (error) {
      console.warn('Gemini match failed, falling back to heuristic:', error);
      return this.calculateHeuristicScore(user, job);
    }
  }

  private calculateHeuristicScore(user: UserProfile, job: Job): number {
    let score = 0;
    let maxScore = 0;

    const jobText = `${job.title} ${job.description} ${job.requirements} ${job.responsibilities}`.toLowerCase();
    
    // 1. Skills Match (Weight: 40)
    maxScore += 40;
    if (user.skills.length > 0) {
        const matchedSkills = user.skills.filter(skill => jobText.includes(skill.name.toLowerCase()));
        const skillRatio = matchedSkills.length / Math.max(1, user.skills.length); // Avoid division by zero
        // Bonus for having any matches, but capped
        score += Math.min(40, (matchedSkills.length * 5) + (skillRatio * 10));
    }

    // 2. Title Match (Weight: 30)
    maxScore += 30;
    const jobTitleWords = job.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let titleMatch = false;
    for (const exp of user.experience) {
        const expTitle = exp.jobTitle.toLowerCase();
        if (jobTitleWords.some(word => expTitle.includes(word))) {
            titleMatch = true;
            break;
        }
    }
    if (titleMatch) score += 30;

    // 3. Experience Description Keywords (Weight: 20)
    maxScore += 20;
    const requirementsWords = (job.requirements || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
    let keywordMatches = 0;
    const userExperienceText = user.experience.map(e => (e.description || '')).join(' ').toLowerCase();
    
    requirementsWords.forEach(word => {
        if (userExperienceText.includes(word)) keywordMatches++;
    });
    
    score += Math.min(20, keywordMatches * 2);

    // 4. Education/Profile (Weight: 10)
    maxScore += 10;
    if (user.education.length > 0) score += 5;
    if (user.profile.headline && jobText.includes(user.profile.headline.toLowerCase())) score += 5;

    // Normalize to 0-100
    // Ensure we don't return 0 if the user has a profile but just no perfect keyword matches, 
    // give a "base" score for effort if profile is complete-ish.
    const baseScore = (user.skills.length > 0 || user.experience.length > 0) ? 15 : 0;
    
    return Math.min(100, Math.round(score + baseScore));
  }
}

export default new AiMatchService();

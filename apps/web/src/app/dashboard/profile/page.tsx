'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Plus, 
  X, 
  Check,
  Camera,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SEED_SKILLS = [
  "React", "Python", "Machine Learning", "UI/UX Design", "Node.js", "Flutter",
  "Django", "FastAPI", "Figma", "Docker", "AWS", "TypeScript", "Vue", "Angular",
  "Swift", "Kotlin", "Unity", "Blockchain", "GraphQL", "PostgreSQL", "MongoDB",
  "Redis", "TensorFlow", "PyTorch", "OpenCV", "Rust", "Go", "Java", "C++", "Arduino"
];

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    college: '',
    city: '',
    linkedinUrl: '',
    githubUrl: '',
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        bio: session.user.bio || '',
        college: session.user.college || '',
        city: session.user.city || '',
        linkedinUrl: session.user.linkedinUrl || '',
        githubUrl: session.user.githubUrl || '',
      });
      setAvatarPreview(session.user.image || null);
      // Skills would need to be fetched separately or included in session
    }
  }, [session]);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillInput(val);
    if (val.trim()) {
      const filtered = SEED_SKILLS.filter(s => 
        s.toLowerCase().includes(val.toLowerCase()) && !selectedSkills.includes(s)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillInput('');
    setSuggestions([]);
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('bio', formData.bio);
      data.append('college', formData.college);
      data.append('city', formData.city);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('githubUrl', formData.githubUrl);
      data.append('skills', JSON.stringify(selectedSkills));
      if (avatar) {
        data.append('avatar', avatar);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile`, {
        method: 'PUT',
        body: data,
        headers: {
          // Headers handled by fetch for FormData, except session which we'll need to pass via credentials
        },
        // Important for cookies
        credentials: 'include'
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-zinc-400 mt-2">Help others find you for the next big hackathon.</p>
          </div>
          <div className="hidden md:block">
            <Sparkles className="text-indigo-400 h-8 w-8" />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center md:flex-row md:items-start gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-zinc-800 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-zinc-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </label>
                  <input 
                    type="email" 
                    value={session.user.email} 
                    disabled 
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> College
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your college"
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> City
                </label>
                <input 
                  type="text" 
                  placeholder="Where are you based?"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bio & Socials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" /> About You
              </h3>
              <textarea 
                rows={4}
                placeholder="Share a bit about your hackathon experience or what you're looking for..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Links
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <Github className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                  <input 
                    type="url" 
                    placeholder="GitHub Profile URL"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                  <input 
                    type="url" 
                    placeholder="LinkedIn Profile URL"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Skills & Expertise
            </h3>
            
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              <AnimatePresence>
                {selectedSkills.map(skill => (
                  <motion.span 
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="relative">
              <div className="relative">
                <Plus className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Add a skill (e.g. Next.js, AI, Design)"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (skillInput.trim()) addSkill(skillInput.trim());
                    }
                  }}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map(s => (
                    <button 
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-600 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={cn(
                "px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2",
                success 
                  ? "bg-green-600 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : success ? (
                <Check className="h-5 w-5" />
              ) : (
                "Save Changes"
              )}
              {success ? "Saved!" : "Update Profile"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

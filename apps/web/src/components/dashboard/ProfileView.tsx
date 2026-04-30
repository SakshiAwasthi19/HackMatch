'use client';

import React, { useEffect, useState } from 'react';
import {
  User, Mail, FileText, GraduationCap, MapPin,
  Linkedin, Github, X, Plus, Camera, Loader2,
  ArrowRight, ArrowLeft, CheckCircle2, Briefcase, Eye
} from 'lucide-react';
import ProfileCard from '../shared/ProfileCard';
import { User as UserType, UserSkill } from '@/lib/types';
import { useCallback } from 'react';
import Image from 'next/image';
import { authClient, apiFetch } from '@/lib/auth-client';

const SUGGESTED_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python',
  'Node.js', 'Tailwind CSS', 'Figma', 'UI/UX Design',
  'Flutter', 'Swift', 'Kotlin', 'Rust', 'Go',
  'Machine Learning', 'AI/ML', 'DevOps', 'Docker',
  'PostgreSQL', 'MongoDB', 'Firebase', 'AWS',
  'Blockchain', 'Web3', 'Solidity',
  'Java', 'C++', 'C#', 'Ruby', 'PHP',
];

const STEPS = [
  { label: 'Basic Info', icon: User },
  { label: 'Education', icon: GraduationCap },
  { label: 'Skills', icon: Briefcase },
  { label: 'Socials', icon: Linkedin },
  { label: 'Photo', icon: Camera },
];

export default function ProfileView() {
  const { data: session } = authClient.useSession();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Fetch existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
          setTitle(data.title || '');
          setBio(data.bio || '');
          setCollege(data.college || '');
          setCity(data.city || '');
          setLinkedinUrl(data.linkedinUrl || '');
          setGithubUrl(data.githubUrl || '');
          setSkills(data.skills?.map((s: any) => {
            if (typeof s === 'string') return s;
            return s.skill?.name || s.name || '';
          }).filter(Boolean) || []);
          if (data.image) setAvatarPreview(data.image);
        }
      } catch {
        // fallback to session data
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      const updateFromSession = () => {
        setName(session.user.name || '');
        setEmail(session.user.email || '');
        if (session.user.image) setAvatarPreview(session.user.image);
      };
      updateFromSession();
      fetchProfile();
    }
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 8) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('bio', bio);
      formData.append('college', college);
      formData.append('city', city);
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('githubUrl', githubUrl);
      formData.append('skills', JSON.stringify(skills));
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to save profile');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    s => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  ).slice(0, 6);

  // Initials for avatar fallback
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // ── RENDER EACH STEP ──
  const renderStep = () => {
    switch (currentStep) {
      // ─── Step 0: Basic Information ───
      case 0:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">👤</span> Core Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 cursor-not-allowed text-sm"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 cursor-not-allowed text-sm"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Title / Role</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world what you build when no one is watching..."
                rows={3}
                maxLength={300}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none text-sm"
              />
              <p className="text-[10px] text-zinc-500 mt-1 text-right">{bio.length}/300</p>
            </div>
          </div>
        );

      // ─── Step 1: Education & Location ───
      case 1:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">🎓</span> Education & Location
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">College / University</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT Delhi"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        );

      // ─── Step 2: Skills ───
      case 2:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">⚡</span> Tech Stack
            </h3>
            <p className="text-xs text-zinc-500 -mt-3">Select up to 8 skills</p>

            {/* Current Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/20"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Skill */}
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                placeholder="Type a skill and press Enter..."
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Suggestions */}
            {skillInput.length > 0 && filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredSuggestions.map((s) => (
                  <button key={s} type="button" onClick={() => addSkill(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-400 text-sm rounded-full border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Popular when empty */}
            {skillInput.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">Popular skills</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, showAllSkills ? undefined : 10).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800/60 text-zinc-500 text-xs rounded-full border border-zinc-700/50 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> {s}
                    </button>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setShowAllSkills(!showAllSkills)}
                    className="inline-flex items-center px-3 py-1.5 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
                  >
                    {showAllSkills ? 'Show Less' : `+${SUGGESTED_SKILLS.filter(s => !skills.includes(s)).length - 10} More`}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      // ─── Step 3: Social Links ───
      case 3:
        return (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">🔗</span> Social Links
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">GitHub URL</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="github.com/username"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        );

      // ─── Step 4: Profile Photo ───
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">📸</span> Profile Photo
            </h3>
            <p className="text-sm text-zinc-500 -mt-3">Add a photo so teammates can recognize you.</p>

            <div className="flex flex-col items-center gap-6 py-6">
              <div className="relative group">
                <div className="h-40 w-40 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <div className="relative h-full w-full">
                      <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                    </div>
                  ) : (
                    <User className="h-16 w-16 text-zinc-600" />
                  )}
                </div>
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="h-8 w-8 text-white mb-2" />
                  <span className="text-xs text-white font-medium">Upload Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-xs text-zinc-500 text-center">Click or drag to upload<br />JPG, PNG (max 5MB)</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Build your identity.
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          The most ambitious hackathon teams start with a great profile. Let&apos;s get you set up.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2.5 mb-10">
        {STEPS.map((step, i) => (
          <div key={i} className="w-10">
            <div
              className={`h-1 w-full rounded-full transition-colors duration-300 ${i <= currentStep
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                : 'bg-zinc-800'
                }`}
            />
          </div>
        ))}
      </div>

      {/* Main Layout: Form Left, Card Right */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* LEFT: Form Section */}
        <div className="flex-1 w-full min-w-0">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
            {renderStep()}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${currentStep === 0
                  ? 'text-zinc-600 cursor-not-allowed'
                  : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
                }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                ${saved
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                }
                ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved!</>
              ) : currentStep === STEPS.length - 1 ? (
                <><CheckCircle2 className="h-4 w-4" /> Save & Finish</>
              ) : (
                <>Save & Continue <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview Card */}
        <div className="w-full lg:w-[340px] flex-shrink-0 lg:sticky lg:top-20 lg:-mt-14 relative">
          <div className="flex items-center justify-between mb-3 lg:absolute lg:-top-10 lg:left-0 lg:right-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Live Preview</span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ● DRAFT MODE
            </span>
          </div>
          {/* The Swipe Card */}
          <ProfileCard
            name={name}
            image={avatarPreview}
            title={title}
            bio={bio}
            college={college}
            city={city}
            skills={skills}
            githubUrl={githubUrl}
            linkedinUrl={linkedinUrl}
            isDraft={true}
          />

          {/* Swipe Hints */}
          <div className="flex items-center justify-center gap-8 mt-5">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-8 w-8 rounded-full border border-red-500/30 flex items-center justify-center">
                <X className="h-4 w-4 text-red-400" />
              </div>
              <span>Swipe Left to Pass</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-emerald-400 text-sm">♥</span>
              </div>
              <span>Swipe Right to Match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ExternalLink, Github, Figma, Plus, Trash2, Loader2, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '@/lib/auth-client';
import Image from 'next/image';

interface ProjectResource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface TeamMember {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    skills: {
      skill: {
        name: string;
      };
    }[];
  };
}

interface TeamSidebarProps {
  teamId: string;
  teamName: string | null;
  members: TeamMember[];
  resources: ProjectResource[];
  onRefresh: () => void;
  isLeader: boolean;
}

export default function TeamSidebar({ teamId, teamName, members, resources, onRefresh, isLeader }: TeamSidebarProps) {
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'LINK' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate team stack (union of all member skills)
  const teamStack = Array.from(new Set(
    members.flatMap(m => m.user.skills.map(s => s.skill.name))
  ));

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/teams/${teamId}/resources`, {
        method: 'POST',
        body: JSON.stringify(newResource)
      });
      if (res.ok) {
        setNewResource({ title: '', url: '', type: 'LINK' });
        setIsAddingResource(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to add resource:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const res = await apiFetch(`/api/teams/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };


  const getResourceIcon = (type: string, url: string) => {
    if (url.includes('github.com')) return <Github className="w-4 h-4" />;
    if (url.includes('figma.com')) return <Figma className="w-4 h-4" />;
    if (type === 'IMAGE') return <ImageIcon className="w-4 h-4" />;
    if (type === 'DOCUMENT') return <FileText className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  return (
    <div className="w-80 border-l border-white/5 bg-[#0d0d14] flex flex-col h-full overflow-y-auto no-scrollbar pb-10">

      {/* PROJECT RESOURCES */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Project Resources</h4>
          <button 
            onClick={() => setIsAddingResource(true)}
            className="p-1 hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="group relative bg-zinc-900/50 border border-white/5 rounded-lg p-3 flex items-center gap-3 hover:bg-zinc-900 transition-all">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                {getResourceIcon(resource.type, resource.url)}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-white truncate">{resource.title}</h5>
                <p className="text-[10px] text-zinc-500 truncate">{resource.url}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button 
                  onClick={() => handleDeleteResource(resource.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {isAddingResource && (
            <form onSubmit={handleAddResource} className="bg-zinc-900 border border-indigo-500/30 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                placeholder="Resource Title (e.g. GitHub Repo)"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="url"
                placeholder="URL (https://...)"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                className="w-full bg-zinc-800 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!isAddingResource && resources.length === 0 && (
            <button 
              onClick={() => setIsAddingResource(true)}
              className="w-full py-4 border border-dashed border-white/10 rounded-lg text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all flex flex-col items-center gap-2 group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Add Link</span>
            </button>
          )}
        </div>
      </div>

      {/* TEAM MEMBERS */}
      <div className="p-6 space-y-4">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Team Members</h4>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                {member.user.image ? (
                  <Image src={member.user.image} alt={member.user.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-600">
                    {member.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[13px] font-bold text-white truncate">{member.user.name}</h5>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.1em]">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM STACK */}
      <div className="p-6 space-y-4">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Team Stack</h4>
        <div className="flex flex-wrap gap-2">
          {teamStack.map((skill) => (
            <span 
              key={skill}
              className="px-2.5 py-1 bg-[#1a2b3b] border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold tracking-tight"
            >
              {skill}
            </span>
          ))}
          {teamStack.length === 0 && (
            <span className="text-zinc-600 text-[10px] italic">No skills listed yet</span>
          )}
        </div>
      </div>
    </div>
  );
}

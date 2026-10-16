import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PricingArchived (Deprecated / Archived)
 * 
 * Notice: OfficeAIM transitioned to a 100% Free Open-Source model.
 * All tools, prompts, blueprints, and agent skills are provided at zero cost.
 * This component is kept as an internal archive of previous tier structures.
 */
export default function PricingArchived() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-6">
          ARCHIVED RECORD • NOT ACTIVE
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          OfficeAIM is Now 100% Free & Open Source
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          All commercial pricing tiers have been permanently retired. All 19 AI agents, 
          engineering blueprints, and micro-tools are free forever.
        </p>
        <div className="flex justify-center gap-4">
          <a 
            href="/community.html" 
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-all shadow-lg shadow-cyan-500/20"
          >
            Visit Community & Support →
          </a>
          <Link 
            to="/hub" 
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700"
          >
            Enter Campus
          </Link>
        </div>
      </div>
    </div>
  );
}

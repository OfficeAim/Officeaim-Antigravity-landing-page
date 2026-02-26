-- ============================================================
-- Lesson 1.4: Your Free AI Board – The Collaboration Loop
-- Bridge lesson between Module 1 and Module 2
-- Uses the real schema from FIX_AND_SEED.sql
-- ============================================================

-- Clean up in case this was run before (safe to re-run)
DELETE FROM quiz_questions WHERE lesson_id = '1-4';
DELETE FROM lessons WHERE id = '1-4';

-- Insert Lesson 1.4
INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index)
VALUES (
    '1-4',
    1,
    'Your Free AI Board – The Collaboration Loop',
    'By the end of this lesson, you will be able to identify the role and superpower of each of the 6 core AI agents on your Free AI Board and describe the sequential flow of the Collaboration Loop, enabling you to initiate a project using the correct starting agent.',
    '<div class="space-y-12">

<section>
  <p class="text-xl leading-relaxed text-gray-300">
    Welcome to the final lesson of Module 1! You''ve demystified AI, understood its role as a co-pilot,
    and had your first interaction with an AI tool. Now, it''s time to unlock the true power of AI by understanding
    how a team of specialized AI agents can work together — just like a human team.
    This lesson introduces you to your very own <strong class="text-white">Free AI Board</strong>:
    a collaborative workflow designed to supercharge your productivity and decision-making.
  </p>
</section>

<section>
  <h2 class="text-3xl font-black text-white mb-6 italic">Meet Your 6 Free Agents</h2>
  <div class="overflow-x-auto rounded-2xl border border-gray-700">
    <table class="w-full text-left">
      <thead class="bg-white/5 border-b border-gray-700">
        <tr>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Agent</th>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Superpower</th>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Origin</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-700/50">
        <tr>
          <td class="px-6 py-4 font-black text-white">Gema</td>
          <td class="px-6 py-4 text-cyan-400">AI Project Manager</td>
          <td class="px-6 py-4 text-gray-300">Orchestrates everything. <strong class="text-white">Start here.</strong></td>
          <td class="px-6 py-4">&#x1F1F3;&#x1F1EC; Nigerian</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">Behavioral Psych</td>
          <td class="px-6 py-4 text-indigo-400">The UX</td>
          <td class="px-6 py-4 text-gray-300">Understands your audience''s psychology and decisions</td>
          <td class="px-6 py-4">&#x1F1F0;&#x1F1EA; Kenyan</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">Community Builder</td>
          <td class="px-6 py-4 text-pink-400">The Connect</td>
          <td class="px-6 py-4 text-gray-300">Grows your audience and community</td>
          <td class="px-6 py-4">&#x1F1F5;&#x1F1ED; Filipino</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">SEO Master</td>
          <td class="px-6 py-4 text-green-400">The Visibility</td>
          <td class="px-6 py-4 text-gray-300">Gets you found on Google and social search</td>
          <td class="px-6 py-4">&#x1F1FB;&#x1F1F3; Vietnamese</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">Quality Checker</td>
          <td class="px-6 py-4 text-blue-400">The Standard</td>
          <td class="px-6 py-4 text-gray-300">Reviews everything before it goes live</td>
          <td class="px-6 py-4">&#x1F1F8;&#x1F1EA; Swedish</td>
        </tr>
        <tr class="bg-amber-500/5">
          <td class="px-6 py-4 font-black text-white">Idea Cloner</td>
          <td class="px-6 py-4 text-amber-400">The Blueprint</td>
          <td class="px-6 py-4 text-gray-300">Reverse-engineers proven business models <span class="text-amber-400/70">(Unlocked in Modulo 2)</span></td>
          <td class="px-6 py-4">&#x1F1F7;&#x1F1FA; Russian</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section>
  <h2 class="text-3xl font-black text-white mb-6 italic">The Collaboration Loop</h2>
  <p class="text-gray-300 mb-6">Your agents are not isolated — they form a <strong class="text-white">circular workflow</strong> that drives real projects forward:</p>
  <pre class="bg-gray-950 text-emerald-400 font-mono p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed border border-emerald-400/10">
+------------------------------------------+
|                                          |
v                                          |
GEMA (Project Manager)                    |
  -> Sets the strategy                     |
  -> Assigns sessions                      |
|                                          |
v                                          |
BEHAVIORAL PSYCH                           |
  -> Defines your target audience          |
  -> Maps psychology & decision triggers   |
|                                          |
v                                          |
COMMUNITY BUILDER                          |
  -> Designs audience growth strategy      |
  -> Builds community engagement plan      |
|                                          |
v                                          |
SEO MASTER                                 |
  -> Keyword research & content strategy   |
  -> Organic visibility roadmap            |
|                                          |
v                                          |
QUALITY CHECKER                            |
  -> Reviews all outputs                   |
  -> Verifies before publishing            |
|                                          |
+------------------------------------------+
         (+ IDEA CLONER after Module 2)
  </pre>
  <div class="mt-6 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
    <p class="text-cyan-300 font-black italic">Golden Rule: Always start with Gema. She gives each session a clear objective. Then use specialists for depth.</p>
  </div>
</section>

<section>
  <h2 class="text-3xl font-black text-white mb-6 italic">The 3 Session Types</h2>
  <div class="overflow-x-auto rounded-2xl border border-gray-700">
    <table class="w-full text-left">
      <thead class="bg-white/5 border-b border-gray-700">
        <tr>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Type</th>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">When to Use</th>
          <th class="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Example</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-700/50">
        <tr>
          <td class="px-6 py-4 font-black text-white">Strategy Session</td>
          <td class="px-6 py-4 text-gray-300">You need a plan</td>
          <td class="px-6 py-4 text-gray-400 italic">"Help me figure out what business to start"</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">Deep Dive Session</td>
          <td class="px-6 py-4 text-gray-300">You need specialist expertise</td>
          <td class="px-6 py-4 text-gray-400 italic">"Analyze my target audience psychology"</td>
        </tr>
        <tr>
          <td class="px-6 py-4 font-black text-white">Review Session</td>
          <td class="px-6 py-4 text-gray-300">You need quality control</td>
          <td class="px-6 py-4 text-gray-400 italic">"Check this email before I send it"</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section>
  <h2 class="text-3xl font-black text-white mb-2 italic">Practical Example: Launch a Newsletter Business</h2>
  <p class="text-gray-400 mb-8 italic">Scenario: Starting a paid newsletter on remote work productivity for freelancers.</p>
  <div class="space-y-4">
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 1 — Strategy Kickoff with Gema</h3>
      <p class="text-gray-400 text-sm italic mb-2">"I want to start a newsletter about remote work productivity. I have no audience yet. Help me create a 4-week launch plan."</p>
      <p class="text-cyan-400 text-xs font-bold">Output: 4-week plan, agent assignments, success milestones</p>
    </div>
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 2 — Audience Psychology with Behavioral Psych</h3>
      <p class="text-gray-400 text-sm italic mb-2">"Analyze the psychology of freelancers struggling with remote work — their fears, decision triggers, how to resonate."</p>
      <p class="text-indigo-400 text-xs font-bold">Output: Psychological profile, 3-5 cognitive triggers, emotional architecture map</p>
    </div>
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 3 — Community Growth with Community Builder</h3>
      <p class="text-gray-400 text-sm italic mb-2">"I have zero subscribers. Give me a 30-day community-first growth plan — platforms, content, actions."</p>
      <p class="text-pink-400 text-xs font-bold">Output: Platform strategy, 0 to 100 roadmap, 30-day content calendar</p>
    </div>
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 4 — SEO &amp; Visibility with SEO Master</h3>
      <p class="text-gray-400 text-sm italic mb-2">"Find me 10 low-competition keywords and 3 SEO-optimized article titles to attract my first 500 organic visitors."</p>
      <p class="text-green-400 text-xs font-bold">Output: Keyword list, optimized titles, on-page SEO checklist</p>
    </div>
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 5 — Quality Review with Quality Checker</h3>
      <p class="text-gray-400 text-sm italic mb-2">"Review this welcome email. Is the value proposition clear? CTA strong? Any errors?"</p>
      <p class="text-blue-400 text-xs font-bold">Output: Line-by-line review, rewrites, pre-launch checklist</p>
    </div>
    <div class="p-6 bg-[#0B1220] border border-white/5 rounded-2xl">
      <h3 class="font-black text-white mb-1">Session 6 — Synthesis with Gema</h3>
      <p class="text-gray-400 text-sm italic mb-2">"Consolidate everything into a 1-page launch brief and give me my 3 most important actions this week."</p>
      <p class="text-cyan-400 text-xs font-bold">Output: 1-page project brief, priority action list, gap analysis</p>
    </div>
    <div class="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
      <h3 class="font-black text-amber-400 mb-1">Session 7 — Clone a Proven Model (Module 2 Unlock)</h3>
      <p class="text-gray-400 text-sm italic mb-2">"Reverse-engineer Morning Brew or The Hustle — how do they acquire readers, monetize, and retain?"</p>
      <p class="text-amber-400 text-xs font-bold">Output: Reverse-engineered breakdown, cloneable elements, differentiated positioning</p>
    </div>
  </div>
</section>

<section>
  <h2 class="text-3xl font-black text-white mb-6 italic">5 Rules for Working With Your Agents</h2>
  <div class="space-y-3">
    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <p class="text-gray-300"><strong class="text-cyan-400">1.</strong> <strong class="text-white">Always brief them.</strong> Give context: "I am building X for audience Y. My goal is Z."</p>
    </div>
    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <p class="text-gray-300"><strong class="text-cyan-400">2.</strong> <strong class="text-white">One objective per session.</strong> Don''t ask 5 things at once. Focus = better results.</p>
    </div>
    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <p class="text-gray-300"><strong class="text-cyan-400">3.</strong> <strong class="text-white">Chain the agents.</strong> Use the output from one as the input for the next.</p>
    </div>
    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <p class="text-gray-300"><strong class="text-cyan-400">4.</strong> <strong class="text-white">Save to the Neural Vault.</strong> After every session, save the key output.</p>
    </div>
    <div class="p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <p class="text-gray-300"><strong class="text-cyan-400">5.</strong> <strong class="text-white">Start with Gema when stuck.</strong> She will tell you which agent you need next.</p>
    </div>
  </div>
</section>

<section class="p-8 bg-[#0B1220] border border-cyan-500/20 rounded-2xl text-center">
  <h2 class="text-2xl font-black text-white mb-3 italic">What''s Next — Module 2 Unlocks</h2>
  <ul class="text-gray-300 space-y-2 text-left max-w-md mx-auto mb-6">
    <li>-> <strong class="text-amber-400">Idea Cloner</strong> — Clone any proven SaaS or digital business model</li>
    <li>-> <strong class="text-white">Pro Tier agents</strong> (upgrade required for full access)</li>
    <li>-> <strong class="text-white">Advanced workflow templates</strong> for complete online business builds</li>
  </ul>
  <a href="/hub/agents" class="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-cyan-400 transition-all text-sm">
    Go to Corporate Board
  </a>
</section>

</div>',
    NULL,
    4
);

-- ============================================================
-- Quiz Questions for Lesson 1.4 (5 questions)
-- ============================================================
INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES

('1-4',
 'Which agent is responsible for orchestrating the entire workflow and setting the strategy?',
 'Behavioral Psych',
 'SEO Master',
 'Gema (AI Project Manager)',
 'Quality Checker',
 'C',
 'Gema is your Chief Orchestrator. Golden Rule: always start with Gema — she assigns sessions and sets the direction for the whole project.',
 1),

('1-4',
 'What is the primary purpose of the Collaboration Loop?',
 'To allow agents to work in total isolation from each other',
 'To form a sequential workflow where each agent''s output feeds the next',
 'To replace human decision-making entirely',
 'To use only one agent at a time for all tasks',
 'B',
 'The Collaboration Loop is a circular workflow where Gema orchestrates, and each specialist agent builds on the previous one''s output — creating compounding results.',
 2),

('1-4',
 'According to the Golden Rule, which agent should you always start with when initiating a project?',
 'Quality Checker',
 'Behavioral Psych',
 'Gema',
 'SEO Master',
 'C',
 'The Golden Rule: Always start with Gema. She gives each session a clear objective so specialists have the right context to deliver maximum value.',
 3),

('1-4',
 'If you need specialist expertise (e.g., deep audience psychology analysis), which type of session should you use?',
 'Strategy Session',
 'Deep Dive Session',
 'Review Session',
 'Launch Session',
 'B',
 'A Deep Dive Session is used when you need specialist expertise, like sending a topic to Behavioral Psych for deep psychological analysis of your target audience.',
 4),

('1-4',
 'What should you do after every productive agent session to build your project cumulatively?',
 'Start a new session from scratch each time',
 'Share the session publicly on social media',
 'Delete the chat to keep things clean',
 'Save the key output to your Neural Vault',
 'D',
 'Rule #4: Save to the Neural Vault after every session. This lets you chain agent outputs and build your project layer by layer across sessions.',
 5);

-- ============================================================
-- Verify insertion
-- ============================================================
SELECT l.id, l.title, l.order_index, COUNT(q.id) AS quiz_count
FROM lessons l
LEFT JOIN quiz_questions q ON q.lesson_id = l.id
WHERE l.module_id = 1
GROUP BY l.id, l.title, l.order_index
ORDER BY l.order_index;

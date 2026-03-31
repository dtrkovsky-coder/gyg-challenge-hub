import React, { useState, useEffect, useCallback, useRef } from "react";
import { getUsers, addUser, updateUser, deleteUser as dbDeleteUser, getCompletions, addCompletion, updateCompletion, getChallenges, setChallenges as dbSetChallenges, getLunchConfig, setLunchConfig as dbSetLunchConfig, getSession, setSession, savePushToken, getActivityCompletions, addActivityCompletion, getBatchControl, setBatchControl as dbSetBatchControl, getCoolroomImages, setCoolroomImage, getActivityConfig, setActivityConfig as dbSetActivityConfig, getUserById, getUserByUsername, checkUsernameEmail, getUsersByBatch, getUsersByProgram, getCompletionsByUser, getCompletionsByBatch, getCompletionsByProgram, getActivityCompletionsByUser, hashPassword, verifyPassword, uploadFile, getUserByUsernameAndEmail } from "./db";

const PROGRAMS = {
  nextgen: { id: "nextgen", name: "NEXTGEN LEADERS", subtitle: "Assistant Restaurant Managers", short: "NGL" },
  essentials: { id: "essentials", name: "LEADERSHIP ESSENTIALS", subtitle: "Shift Leaders & Senior Cooks", short: "LE" },
  elite: { id: "elite", name: "ELITE LEADERS", subtitle: "Restaurant Managers", short: "EL" },
  lse: { id: "lse", name: "LEADING SHIFT EXCELLENCE", subtitle: "Crew & Cooks", short: "LSE" },
};
const LUNCH_MENU={types:[{id:"burrito",name:"BURRITO"},{id:"bowl",name:"BOWL"}],fillings:[{id:"grilled_chicken",name:"Grilled Chicken"},{id:"shredded_beef",name:"Shredded Beef Brisket"},{id:"pulled_pork",name:"Pulled Pork"},{id:"ground_beef",name:"Ground Beef"},{id:"veg_guac",name:"Sautéed Vegetables with Guac"},{id:"shiitake_mushroom",name:"Pulled Shiitake Mushroom"}]};
const LUNCH_IMAGES={burrito:"/assets/burrito.webp",bowl:"/assets/bowl.webp",grilled_chicken:"/assets/grilled_chicken.webp",shredded_beef:"/assets/shredded_beef.webp",pulled_pork:"/assets/pulled_pork.webp",ground_beef:"/assets/ground_beef.webp",veg_guac:"/assets/veg_guac.webp",shiitake_mushroom:"/assets/shiitake_mushroom.webp"};

const GYG_LOGO = "/assets/gyg_logo.png";
const LD_LOGO = "/assets/ld_logo.png";
const LOADING_GIF = "/assets/loading_gif.gif";
const BG_IMG = "/assets/bg_img.png";

const MEMBER_ICON = "/assets/member_icon.webp";

const LOGOS = {
  nextgen: "/assets/nextgen.png",
  lse: "/assets/lse.svg",
  essentials: "/assets/essentials.svg",
  elite: "/assets/elite.svg",
};

const ICONS = {
  socks: "/assets/socks.png",
  taco: "/assets/taco.png",
  churros: "/assets/churros.png",
  guac: "/assets/guac.png",
  fries: "/assets/fries.png",
  fire_burrito: "/assets/fire_burrito.png",
  sticky_tape: "/assets/sticky_tape.png",
  sundae: "/assets/sundae.svg",
  under_construction: "/assets/under_construction.svg",
  lime: "/assets/lime.svg",
  bag: "/assets/bag.svg",
  burrito: "/assets/burrito.png",
  avocado: "/assets/avocado.svg",
  churro: "/assets/churro.svg",
};

// Quarterly workshop content library
const QUARTERLY_WORKSHOPS = {
  essentials: {
    Q1: { name: "Guest Obsessed", active: true },
    Q2: { name: "Train the Trainer Frontline", active: false },
    Q3: { name: "Leading Your Crew", active: false },
    Q4: { name: "TBC", active: false },
  },
  nextgen: {
    Q1: { name: "Driving Profitability", active: true },
    Q2: { name: "Train the Trainer Advanced", active: false },
    Q3: { name: "Performance Leadership", active: false },
    Q4: { name: "TBC", active: false },
  },
  elite: {
    Q1: { name: "Running Your Restaurant", active: true },
    Q2: { name: "Train the Trainer Excellence", active: false },
    Q3: { name: "Power of Influence", active: false },
    Q4: { name: "TBC", active: false },
  },
  // LSE doesn't change by quarter
};
const DEFAULT_CHALLENGES = {
  nextgen: [
    { id: "ng-w1", week: 1, type: "shift_call", title: "SHIFT CALL", subtitle: "React or hold?", points: 100, bonusPoints: 50, bonusCondition: "Perfect round (8/8 correct)", description: "Mid-shift scenarios. Sales data, headcount, model. You have 10 seconds to decide: react or do nothing. Eight rounds. Speed matters.", deliverable: "8 scenario decisions with speed scores", tip: "The skill isn't always cutting. It's reading the data and knowing when to hold.", icon: "sticky_tape" },
    { id: "ng-w2", week: 2, type: "make_the_call", title: "MAKE THE CALL", subtitle: "Cost down. Service intact.", points: 100, bonusPoints: 50, bonusCondition: "AHR at target AND SPLH in band", description: "6 roster decisions. Two numbers to manage: AHR and SPLH. Cut cost without killing service. The skill works in both directions.", deliverable: "6 decisions with AHR + SPLH outcomes", tip: "Every shift has two costs: the rate and the hours. And every cut has a service risk. Read both numbers.", icon: "fries" },
    { id: "ng-w3", week: 3, type: "perm_or_pass", title: "PERM OR PASS", subtitle: "Have the conversation", points: 100, bonusPoints: 50, bonusCondition: "All 5 profiles answered correctly", description: "One crew profile per day for 5 days. Read their objection to going permanent. Tap your response. The app tells you if it lands - and why.", deliverable: "5 completed coaching scenarios", tip: "The honest answer is: base rate reduces, but they gain everything else. Show the full picture.", icon: "socks" },
    { id: "ng-w4", week: 4, type: "your_restaurant", title: "YOUR RESTAURANT, YOUR NUMBER", subtitle: "See your own data", points: 100, bonusPoints: 50, bonusCondition: "Completed initial assessment + 30-day check-in", description: "Enter your restaurant's data with sliders - no keyboard. The app calculates your best lever, ranks you against the cohort, and generates a shareable summary.", deliverable: "Restaurant assessment + recommended lever + cohort rank", tip: "By the time you read it on the P&L, the decision was made three weeks ago.", icon: "churros" },
  ],
  essentials: [
    { id: "le-w1", week: 1, type: "spot_the_moment", title: "SPOT THE MOMENT", subtitle: "See your restaurant like a guest", points: 100, bonusPoints: 50, bonusCondition: "All 5 photos uploaded + swipe game completed", description: "5 photos across 5 days from a guest's perspective. Then swipe through your cohort's photos and see how they swiped on yours.", deliverable: "5 restaurant photos + swipe reactions", tip: "You walk past it every shift. Your guests see it for the first time, every time.", icon: "taco" },
    { id: "le-w2", week: 2, type: "thirty_second_sell", title: "THE 30-SECOND SELL", subtitle: "Sell it like you mean it", points: 100, bonusPoints: 0, bonusCondition: "None", description: "A random menu item appears. You have 30 seconds on camera to sell it. Your front camera opens and the video auto-uploads for admin review.", deliverable: "3 video submissions", tip: "It's not just what you say - it's whether you look like you believe it.", icon: "fire_burrito" },
    { id: "le-w3", week: 3, type: "recovery_race", title: "THE RECOVERY RACE", subtitle: "De-escalate under pressure", points: 100, bonusPoints: 50, bonusCondition: "All scenarios completed with positive outcomes", description: "Branching scenario game. An upset guest appears. Choose your response. Your choice changes the outcome. Four decision points per scenario, each on a timer.", deliverable: "Completed scenarios with impact scores", tip: "Good recovery creates more loyalty than no problem at all. But know when to stop recovering and start protecting.", icon: "churros" },
    { id: "le-w4", week: 4, type: "shift_leader_lens", title: "THE SHIFT LEADER LENS", subtitle: "What would you do?", points: 100, bonusPoints: 50, bonusCondition: "Completed all clips with consistent leadership profile", description: "Short scenario clips of real restaurant moments. For each one: what would you do, when would you act, what's at risk. Your answers build your shift leader profile.", deliverable: "Clip assessments + leadership profile", tip: "There's no single right answer. But there's a pattern in yours - and that pattern is your leadership style.", icon: "socks" },
  ],
  elite: [
    { id: "el-w1", week: 1, type: "guest_dollar_trail", title: "THE GUEST DOLLAR TRAIL", subtitle: "Follow the money", points: 100, bonusPoints: 50, bonusCondition: "All 5 correct choices", description: "Follow one guest through 5 moments in your restaurant. Each choice adds to or subtracts from a running dollar counter. See the annual revenue impact.", deliverable: "5 moment decisions + weakest moment selection", tip: "Five 10-second moments. Over a million dollars a year. Same menu. Same prices. Different experience.", icon: "taco" },
    { id: "el-w2", week: 2, type: "triage_call", title: "TRIAGE CALL", subtitle: "Your ARMs are calling", points: 100, bonusPoints: 50, bonusCondition: "All 6 correct triage decisions", description: "6 ARM calls back-to-back. Each delivers a two-sentence situation. You have 10 seconds to triage: act now or hold.", deliverable: "6 triage decisions + coaching profile", tip: "Some calls need you in the conversation today. Some need space. Know the difference.", icon: "fire_burrito" },
    { id: "el-w3", week: 3, type: "rm_brief", title: "THE RM BRIEF", subtitle: "One message. Five minutes.", points: 100, bonusPoints: 50, bonusCondition: "All 3 selections align to the live problem", description: "Saturday 10:45am. AHR above target. Build your 5-minute pre-shift brief: one focus, one number, one call to action.", deliverable: "Assembled brief + quality rating", tip: "The best briefs say one thing clearly. The worst briefs say five things vaguely.", icon: "churros" },
    { id: "el-w4", week: 4, type: "numbers_dont_lie", title: "THE NUMBERS DON'T LIE", subtitle: "Read the whole picture", points: 100, bonusPoints: 50, bonusCondition: "All 3 rounds perfect (24+ points)", description: "3 restaurant P&L snapshots. Identify the real problem, diagnose the root cause, select the right lever.", deliverable: "9 diagnostic decisions + commercial profile", tip: "A high labour % might be a sales problem. A good week might be hiding next week's disaster.", icon: "bag" },
  ],
  lse: [
    { id: "lse-w1", week: 1, type: "hazard_hunt", title: "HAZARD HUNT", subtitle: "Find the dangers", points: 100, bonusPoints: 50, bonusCondition: "All 5 found under 60 seconds + decoy avoided", description: "A 360-degree kitchen image loads on screen. 90-second timer starts. Six hazards are hidden - five real, one decoy. Tap every hazard you can find before the clock runs out.", deliverable: "Hazard taps + open text response", tip: "The standard you walk past is the standard you accept. Go right, not just fast.", icon: "fire_burrito" },
    { id: "lse-w2", week: 2, type: "shift_in_chaos", title: "SHIFT IN CHAOS", subtitle: "Prioritise under pressure", points: 100, bonusPoints: 50, bonusCondition: "Top 3 closest to expert ranking", description: "It's 12:05pm Saturday. 12 real operational problems appear. Drag and rank them 1-12 in order of urgency. Once submitted, you can't change it. Then see how the whole cohort ranked them.", deliverable: "Priority ranking + prevention question", tip: "Crew safety always comes before operational issues. Always.", icon: "taco" },
    { id: "lse-w3", week: 3, type: "waste_audit", title: "WASTE NOTHING", subtitle: "Your shift, your numbers", points: 70, bonusPoints: 30, bonusCondition: "Question 3 names a specific action at a specific time", description: "Log your wastage items, snap photos of the wastage sheet and POS, then answer three targeted questions about what you found.", deliverable: "Wastage log + photos + 3 answers", tip: "A strong answer to the fix question names a specific action at a specific time. 'Prep less chicken' won't cut it.", icon: "fries" },
    { id: "lse-w4", week: 4, type: "teach_it", title: "TEACH IT TO OWN IT", subtitle: "Train one crew member", points: 70, bonusPoints: 30, bonusCondition: "Names a specific behaviour gap + describes explain-show-practise sequence", description: "Pick a skill, find a crew member, train them properly, and record 20-30 seconds of real training.", deliverable: "Skill selection + video + structured reflection", tip: "You can sit in a room and nod. You cannot stand in front of someone and teach something you don't understand.", icon: "socks" },
  ],
  // Q2 challenges
  essentials_Q2: [
    { id: "le-q2-w1", week: 1, title: "THE TRAINING PLAN", subtitle: "Design a 15-minute session", points: 100, bonusPoints: 50, bonusCondition: "Plan follows explain-show-practise", description: "Pick one skill your crew struggles with. Design a 15-minute training session using explain, show, practise. Upload your plan and deliver it this week.", deliverable: "Training plan + delivery reflection", tip: "If you can't explain it in 3 sentences, you don't understand it well enough to teach it.", icon: "sticky_tape" },
    { id: "le-q2-w2", week: 2, title: "WATCH AND COACH", subtitle: "Observe, don't correct", points: 100, bonusPoints: 50, bonusCondition: "Identified 3+ specific behaviours", description: "Spend 15 minutes observing one crew member without interrupting. Write down exactly what they do well and what needs work. Then have the coaching conversation.", deliverable: "Observation notes + coaching summary", tip: "Most managers correct. Few observe first. The observation is where the insight lives.", icon: "fries" },
    { id: "le-q2-w3", week: 3, title: "PEER TEACH-BACK", subtitle: "Can they teach it?", points: 100, bonusPoints: 50, bonusCondition: "Crew member delivered teach-back", description: "Train a crew member on a skill, then ask them to teach it back to another crew member while you watch. Film 30 seconds of the teach-back.", deliverable: "Video of teach-back + reflection", tip: "If they can teach it, they own it. If they can't, you haven't finished training.", icon: "socks" },
    { id: "le-q2-w4", week: 4, title: "THE TRAINING RHYTHM", subtitle: "Build it into the week", points: 100, bonusPoints: 50, bonusCondition: "Ran 3+ training moments in one week", description: "Schedule 3 micro-training moments across one week. Each one is 5 minutes max. Document what you trained, when, and what changed.", deliverable: "3 training logs with before/after", tip: "Training isn't an event. It's a rhythm. Five minutes, three times a week, every week.", icon: "churros" },
  ],
  nextgen_Q2: [
    { id: "ng-q2-w1", week: 1, title: "THE SKILL MATRIX", subtitle: "Map your team", points: 100, bonusPoints: 50, bonusCondition: "Full matrix completed for 10+ crew", description: "Create a skill matrix for your team. List every crew member and rate their competence on 5 key stations. Identify the 3 biggest gaps.", deliverable: "Skill matrix + gap analysis", tip: "You can't train what you can't see. The matrix makes it visible.", icon: "sticky_tape" },
    { id: "ng-q2-w2", week: 2, title: "TRAINING DESIGN", subtitle: "Build a session from scratch", points: 100, bonusPoints: 50, bonusCondition: "Session plan follows GYG training framework", description: "Design a 20-minute training session for the biggest gap you found in Week 1. Use the GYG explain-show-practise-assess framework.", deliverable: "Full session plan with materials", tip: "Great training is 20% telling and 80% doing. Plan for doing.", icon: "fries" },
    { id: "ng-q2-w3", week: 3, title: "DELIVER AND ADJUST", subtitle: "Run it for real", points: 100, bonusPoints: 50, bonusCondition: "Delivered session + captured feedback", description: "Deliver your training session. Film a 30-second clip. Get feedback from the trainees. What worked? What didn't? Adjust the plan.", deliverable: "Video clip + trainee feedback + revised plan", tip: "No plan survives first contact. The revision is where the learning happens.", icon: "socks" },
    { id: "ng-q2-w4", week: 4, title: "TRAIN THE TRAINER", subtitle: "Hand it over", points: 100, bonusPoints: 50, bonusCondition: "Another leader delivered the session", description: "Teach another shift leader to deliver your training session. Watch them do it. Give them feedback. The goal: they can run it without you.", deliverable: "Handover plan + observation notes", tip: "If only you can deliver it, you've built a dependency, not a capability.", icon: "churros" },
  ],
  elite_Q2: [
    { id: "el-q2-w1", week: 1, title: "TRAINING AUDIT", subtitle: "What's actually happening?", points: 100, bonusPoints: 50, bonusCondition: "Audit covers all stations", description: "Audit your restaurant's current training practices. How many hours per week? Who delivers it? What's the quality? What's missing?", deliverable: "Training audit report with recommendations", tip: "Most restaurants think they train more than they do. Measure it.", icon: "bag" },
    { id: "el-q2-w2", week: 2, title: "THE TRAINING CALENDAR", subtitle: "Systematise it", points: 100, bonusPoints: 50, bonusCondition: "Calendar covers 4 weeks minimum", description: "Build a monthly training calendar. Map who trains what, when. Include micro-training, shift briefings, and formal sessions.", deliverable: "Monthly training calendar", tip: "If it's not on the calendar, it's not happening. Schedule it like you schedule shifts.", icon: "avocado" },
    { id: "el-q2-w3", week: 3, title: "DEVELOP YOUR TRAINERS", subtitle: "Build the bench", points: 100, bonusPoints: 50, bonusCondition: "Development plan for 2+ trainers", description: "Identify your 2 best potential trainers. Create a development plan for each. Start executing this week.", deliverable: "Trainer development plans + first actions taken", tip: "Your restaurant's training quality is limited by your worst trainer. Invest in the best.", icon: "lime" },
    { id: "el-q2-w4", week: 4, title: "TRAINING ROI", subtitle: "Prove it works", points: 100, bonusPoints: 50, bonusCondition: "Connected training to one measurable outcome", description: "Pick one metric that training should improve (speed, waste, complaints). Measure it before and after a focused training week. Show the impact.", deliverable: "Before/after data + analysis", tip: "If you can't measure the impact, you can't justify the investment. Make it count.", icon: "sundae" },
  ],
  // Q3 challenges
  essentials_Q3: [
    { id: "le-q3-w1", week: 1, title: "KNOW YOUR CREW", subtitle: "Beyond the roster", points: 100, bonusPoints: 50, bonusCondition: "Completed profiles for all crew", description: "For each crew member on your shift, write down: their name, how long they've been here, what motivates them, and one thing they want to get better at.", deliverable: "Crew profiles", tip: "If you don't know what drives them, you can't lead them.", icon: "sticky_tape" },
    { id: "le-q3-w2", week: 2, title: "THE DIFFICULT CONVERSATION", subtitle: "Say it, don't store it", points: 100, bonusPoints: 50, bonusCondition: "Had the conversation this week", description: "Identify one performance conversation you've been avoiding. Write your opening line. Have the conversation this week. Reflect on how it went.", deliverable: "Opening line + conversation summary + reflection", tip: "The conversation you're avoiding is the one that matters most.", icon: "fries" },
    { id: "le-q3-w3", week: 3, title: "SHIFT ENERGY CHECK", subtitle: "Read the room", points: 100, bonusPoints: 50, bonusCondition: "Completed 3 energy checks across different shifts", description: "At the start of 3 different shifts, rate the crew energy out of 10. What drove it up or down? What did you do about it?", deliverable: "3 energy ratings with actions taken", tip: "Energy is contagious. Yours sets the floor. Theirs tells you the ceiling.", icon: "socks" },
    { id: "le-q3-w4", week: 4, title: "RECOGNITION RESET", subtitle: "Catch them doing it right", points: 100, bonusPoints: 50, bonusCondition: "5 recognition moments documented", description: "This week, catch 5 crew members doing something well. Tell them in the moment. Be specific about what they did and why it mattered. Log each one.", deliverable: "5 recognition logs with specifics", tip: "Generic praise is noise. Specific recognition is signal. Name the behaviour.", icon: "churros" },
  ],
  nextgen_Q3: [
    { id: "ng-q3-w1", week: 1, title: "PERFORMANCE BASELINE", subtitle: "Where does your team stand?", points: 100, bonusPoints: 50, bonusCondition: "Baseline established for all direct reports", description: "For each crew member you manage, rate their performance on 3 dimensions: speed, quality, teamwork. Where are the gaps?", deliverable: "Performance baseline + gap priority list", tip: "You can't manage what you haven't measured. Start with honest baselines.", icon: "sticky_tape" },
    { id: "ng-q3-w2", week: 2, title: "THE COACHING PLAYBOOK", subtitle: "Build your framework", points: 100, bonusPoints: 50, bonusCondition: "Playbook covers 3+ common scenarios", description: "Create your personal coaching playbook. For the 3 most common performance issues you face, write: what you'd say, when you'd say it, and how you'd follow up.", deliverable: "Coaching playbook with 3 scenarios", tip: "Consistency beats creativity in coaching. Have a playbook, not a personality.", icon: "fries" },
    { id: "ng-q3-w3", week: 3, title: "REAL-TIME COACHING", subtitle: "In the moment", points: 100, bonusPoints: 50, bonusCondition: "3 coaching moments documented with outcomes", description: "This week, deliver 3 real-time coaching moments on the floor. Not after the shift. Not in a meeting room. On the floor, in the moment.", deliverable: "3 coaching logs with what changed", tip: "The best coaching happens in 90 seconds on the floor, not 30 minutes in the office.", icon: "socks" },
    { id: "ng-q3-w4", week: 4, title: "THE TOUGH CONVERSATION", subtitle: "Manage up, manage down", points: 100, bonusPoints: 50, bonusCondition: "Had the conversation and documented the outcome", description: "Identify your hardest performance conversation. Plan it. Have it. Document the outcome and what you'd do differently.", deliverable: "Conversation plan + outcome + reflection", tip: "If you can have the tough conversation, you can lead anyone.", icon: "churros" },
  ],
  elite_Q3: [
    { id: "el-q3-w1", week: 1, title: "INFLUENCE MAP", subtitle: "Who moves the needle?", points: 100, bonusPoints: 50, bonusCondition: "Map covers all key stakeholders", description: "Map every person who influences your restaurant's success. Your RM, your ARMs, your best crew, your suppliers, your regulars. Who do you need to influence and how?", deliverable: "Influence map with strategy per person", tip: "Power isn't position. It's the ability to change behaviour. Map who you need to move.", icon: "bag" },
    { id: "el-q3-w2", week: 2, title: "THE PITCH", subtitle: "Sell an idea up", points: 100, bonusPoints: 50, bonusCondition: "Pitched and received feedback", description: "Pick one change you want to make in your restaurant. Build a 2-minute pitch for your RM. Include the problem, the solution, the cost, and the expected return. Deliver it.", deliverable: "Pitch outline + RM feedback", tip: "Great leaders don't ask for permission. They build cases. Make yours compelling.", icon: "avocado" },
    { id: "el-q3-w3", week: 3, title: "CROSS-FUNCTIONAL WIN", subtitle: "Lead without authority", points: 100, bonusPoints: 50, bonusCondition: "Achieved outcome through influence", description: "Identify one thing that needs fixing that's outside your direct control. A supplier issue, a maintenance problem, a neighbouring restaurant relationship. Fix it through influence alone.", deliverable: "Problem + who you influenced + outcome", tip: "The hardest leadership is leading people who don't report to you. That's where influence lives.", icon: "lime" },
    { id: "el-q3-w4", week: 4, title: "LEGACY MOMENT", subtitle: "What will they remember?", points: 100, bonusPoints: 50, bonusCondition: "Reflection shared with team", description: "Ask 3 team members: 'What's one thing I do that makes the biggest difference to your shift?' Write down what they say. Then ask: is that the legacy you want?", deliverable: "3 responses + personal reflection", tip: "Leadership is not what you do. It's what they do after you leave the room.", icon: "sundae" },
  ],
};


const DEFAULT_ACTIVITIES = {
  lse: [
    { id: "lse-act-1", type: "self_assessment", title: "REALLY KNOW YOURSELF", subtitle: "Leadership Self Assessment" }
  ],
  essentials: [
    { id: "le-act-1", type: "huddle_builder", title: "SAY IT LIKE A LEADER", subtitle: "Interactive Huddle Builder" }
  ],
  nextgen: [
    { id: "ng-act-1", type: "coolroom_countdown", title: "COOL ROOM COUNTDOWN", subtitle: "Can you count under pressure?" },
    { id: "ng-act-2", type: "roster_reality", title: "ROSTER REALITY", subtitle: "Three decisions. One restaurant." }
  ],
  // Q2 activities
  essentials_Q2: [
    { id: "le-q2-act-1", type: "huddle_builder", title: "THE TRAINING HUDDLE", subtitle: "Build a 5-minute training moment" }
  ],
  nextgen_Q2: [
    { id: "ng-q2-act-1", type: "coolroom_countdown", title: "STOCK ACCURACY CHECK", subtitle: "Count under pressure - training edition" }
  ],
  elite_Q2: [
    { id: "el-q2-act-1", type: "huddle_builder", title: "THE COACHING FRAMEWORK", subtitle: "Structure your coaching conversations" }
  ],
  // Q3 activities
  essentials_Q3: [
    { id: "le-q3-act-1", type: "huddle_builder", title: "THE RECOGNITION HUDDLE", subtitle: "Lead with positivity" }
  ],
  nextgen_Q3: [
    { id: "ng-q3-act-1", type: "roster_reality", title: "PERFORMANCE SCENARIO", subtitle: "Three crew. Three conversations." }
  ],
  elite_Q3: [
    { id: "el-q3-act-1", type: "huddle_builder", title: "THE INFLUENCE PITCH", subtitle: "Sell your idea in 2 minutes" }
  ],
};

const HUDDLE_FOCUSES = {
  sales: { label: "SALES", subs: [
    { id: "combos", label: "Combos" },
    { id: "suggestive_selling", label: "Suggestive Selling" },
    { id: "menu_knowledge", label: "Menu Knowledge" },
    { id: "allergens", label: "Allergens" },
    { id: "reading_guest", label: "Reading the Guest" },
  ]},
  guest_experience: { label: "GUEST EXPERIENCE", subs: [
    { id: "voice_energy", label: "Voice & Energy" },
    { id: "wait_times", label: "Wait Times" },
    { id: "recovery", label: "Recovery" },
    { id: "difficult_guests", label: "Difficult Guests" },
    { id: "reading_room", label: "Reading the Room" },
  ]},
};

const HUDDLE_STEPS = [
  { label: "THE OPENER", prefix: "Alright team," },
  { label: "THE FOCUS", prefix: "Today I want us to focus on" },
  { label: "THE WHY", prefix: "Here's why this matters -" },
  { label: "THE PROOF", prefix: "Yesterday I saw" },
  { label: "THE ONE THING", prefix: "So today, the one thing I need from everyone is" },
  { label: "THE CREW LINE", prefix: "" },
  { label: "THE CLOSE", prefix: "Let's have a great shift." },
];

const HUDDLE_PLACEHOLDERS = {
  combos: [
    "let's have a quick chat before we get into it.",
    "combos - how we're offering them and when.",
    "every combo adds $3-4 to the check. Across a full shift, that's hundreds of dollars we're either capturing or leaving on the table.",
    "a guest ordered a burrito and walked out. No drink, no chips. We didn't even ask. That's money gone.",
    "to ask every single guest: 'Want to make that a combo?'",
    "e.g. 'Combo it up - chips and a drink for just a few bucks more.'",
    ""
  ],
  suggestive_selling: [
    "quick one before doors open.",
    "suggestive selling - not pushing, just guiding.",
    "when we suggest the right thing at the right time, guests spend more AND leave happier. It's not selling - it's serving.",
    "a guest was deciding between two items. Our crew member said 'the chicken burrito is unreal today' - guest ordered it plus a drink. One sentence, extra $5.",
    "to make one genuine suggestion to every guest. Just one.",
    "e.g. 'You've gotta try the chips and guac - it's the move.'",
    ""
  ],
  menu_knowledge: [
    "30 seconds before we open up.",
    "menu knowledge - knowing what we serve inside out.",
    "when a guest asks 'what's good?' and we freeze, we lose trust instantly. When we answer with confidence, we own the moment.",
    "a guest asked about allergens in the salsa and we had to go check. That hesitation killed the vibe. We should know this cold.",
    "to know three things about every item on the menu you serve today. Ingredients, allergens, what pairs well.",
    "e.g. 'Know it, own it. If a guest asks, you answer - no hesitation.'",
    ""
  ],
  allergens: [
    "this one's serious, team.",
    "allergens - specifically, how we handle them at the line.",
    "one mistake with allergens can send someone to hospital. It's not a 'nice to know' - it's a safety issue and a legal one.",
    "a guest mentioned they were gluten-free and we served them a flour tortilla. That's a near-miss. We got lucky.",
    "to ask every guest with a modification: 'Is that a preference or an allergy?' And if it's an allergy, follow the full protocol.",
    "e.g. 'Allergy means full protocol. Every time. No shortcuts.'",
    ""
  ],
  reading_guest: [
    "eyes up for a second.",
    "reading the guest - knowing what they need before they ask.",
    "some guests want a chat. Some want speed. Some are stressed. If we treat them all the same, we're missing half of them.",
    "a mum came in with three kids hanging off her. Our crew member jumped in, got the kids' orders sorted first, made her laugh. She told the manager it made her day. That's reading the room.",
    "to look at the next guest before they get to the register. Read their energy. Adjust.",
    "e.g. 'Read the guest, match their vibe. Fast for fast, warm for warm.'",
    ""
  ],
  voice_energy: [
    "quick check-in before we go.",
    "voice and energy - how we sound when we talk to guests.",
    "people don't remember what you said. They remember how you made them feel. And that starts with your voice.",
    "two crew members said the exact same greeting yesterday. One sounded like they meant it. The other sounded like a robot. Guess which guest came back?",
    "to greet every guest like you're genuinely glad they walked in. Not louder - just real.",
    "e.g. 'Same words, different energy. Make it real and they'll feel it.'",
    ""
  ],
  wait_times: [
    "quick one on timing.",
    "wait times - not just speed, but how the wait feels.",
    "a 5-minute wait where the guest is acknowledged feels like 2 minutes. A 3-minute wait where they're ignored feels like 10. Perception is everything.",
    "the line was 8 deep yesterday. Nobody on the floor acknowledged anyone. Guests were shifting, looking around, pulling out phones. We lost two walkouts.",
    "to acknowledge every waiting guest within 30 seconds. Eye contact, a nod, 'be right with you'. That's it.",
    "e.g. 'See them, say something. Thirty seconds. That's all it takes.'",
    ""
  ],
  recovery: [
    "this one's about turning things around.",
    "recovery - what we do when things go wrong.",
    "every restaurant makes mistakes. What separates the great ones is how they recover. Done right, recovery creates MORE loyalty than getting it right the first time.",
    "a wrong order went out last week. The crew member apologised, remade it fast, and threw in free chips. The guest posted about it online - positive review. That's the power of recovery.",
    "when something goes wrong today, to own it immediately. Apologise, fix it, add something extra. Don't wait for a manager.",
    "e.g. 'Wrong order? Own it. Fix it. Win them back. Every time.'",
    ""
  ],
  difficult_guests: [
    "real talk for a second.",
    "difficult guests - how we handle the tough ones without losing our cool.",
    "a difficult guest handled badly costs us that guest plus everyone watching. A difficult guest handled well earns respect from your whole team and every guest in earshot.",
    "a guest got heated about a long wait. Our crew member didn't match the energy - stayed calm, acknowledged the frustration, offered to remake the order fresh. Guest calmed down and thanked them on the way out.",
    "if a guest gets heated, do not match their energy. Lower your voice, slow down, and say 'I hear you, let me fix this right now.'",
    "e.g. 'Stay low, stay slow. Their energy is their problem. Your response is yours.'",
    ""
  ],
  reading_room: [
    "heads up, quick observation.",
    "reading the room - seeing the whole floor, not just your station.",
    "the best crew don't just do their job. They see what's happening around them and react. That's the difference between good and great.",
    "the dining room was trashed at 12:30 yesterday. Three tables uncleaned, bins overflowing. Every crew member on the line was heads-down. Nobody looked up. The guests noticed.",
    "to look up from your station once every 5 minutes. Scan the floor. If something needs doing, do it or call it out.",
    "e.g. 'Eyes up every 5 minutes. See it? Sort it. Don't wait to be told.'",
    ""
  ],
};
// ─── UTILS ───────────────────────────────────────────────────────────────────
function getISOWeek(d) { const date = new Date(d); date.setHours(0,0,0,0); date.setDate(date.getDate()+3-(date.getDay()+6)%7); const w1=new Date(date.getFullYear(),0,4); return 1+Math.round(((date-w1)/86400000-3+(w1.getDay()+6)%7)/7); }
function generateBatch(programId, dateStr, stateCode) { const d=new Date(dateStr||Date.now()); const wk=getISOWeek(d); const yr=String(d.getFullYear()).slice(-2); const short=PROGRAMS[programId]?.short||"GYG"; const sc=stateCode||""; return `${short}-${sc?sc+"-":""}WK${String(wk).padStart(2,"0")}-${yr}`; }
function getUserWeek(createdAt) { if(!createdAt)return 1; return Math.min(Math.max(Math.floor((Date.now()-new Date(createdAt))/604800000)+1,1),4); }

// Storage now handled by Firebase - see db.js

// ─── FONTS ───────────────────────────────────────────────────────────────────
const _fs=document.createElement("style");
_fs.textContent="@font-face { font-family: 'HelveticaNeueLTStd'; font-weight: 700; src: url('data:font/opentype;base64,T1RUTwAMAIAAAwBAQkFTRT9iT7oAACfQAAAANENGRiByErS5AAAG/AAAINRHUE9T2cvuvAAAKAQAAAa6R1NVQlaNVaEAAC7AAAAC9k9TLzJbKVbOAAABMAAAAGBjbWFwAbQBWwAABnQAAABmaGVhZAIpi08AAADMAAAANmhoZWEHpgNzAAABBAAAACRobXR4tUcKOgAAMbgAAAF4bWF4cABeUAAAAAEoAAAABm5hbWV8AJdyAAABkAAABORwb3N0/7gAMgAABtwAAAAgAAEAAAABB2wiQLetXw889QADA+gAAAAAuSPwbAAAAADl3FB3/+f/SAQqAtgAAQADAAIAAAAAAAAAAQAAAsr+4gDIBEX/5//tBCoAAQAAAAAAAAAAAAAAAAAAAF4AAFAAAF4AAAACAdICvAADAAQCigJYAAAASwKKAlgAAAFeADIBNgAAAgsHBgMFAgMCBAAAAAEAAAAAAAAAAAAAAABBREJFACAAIAB6Asr+4gDIA8EA4AAAAAEAAAAAAgUCygAgACAABAAAAA0AogADAAEECQAAARQAAAADAAEECQABACwBFAADAAEECQACAAgBQAADAAEECQADAEQBSAADAAEECQAEAC4BjAADAAEECQAFAGgBugADAAEECQAGAC4BjAADAAEECQAHAT4CIgADAAEECQAJABwDYAADAAEECQALADIDfAADAAEECQAOAEgDrgADAAEECQAQACoD9gADAAEECQARACIEIABDAG8AcAB5AHIAaQBnAGgAdAAgAKkAIAAxADkAOQAwACwAIAAyADAAMAAyACAAQQBkAG8AYgBlACAAUwB5AHMAdABlAG0AcwAgAEkAbgBjAG8AcgBwAG8AcgBhAHQAZQBkAC4AIAAgAEEAbABsACAAUgBpAGcAaAB0AHMAIABSAGUAcwBlAHIAdgBlAGQALgAgAKkAIAAxADkAOAAxACwAIAAyADAAMAAyACAASABlAGkAZABlAGwAYgBlAHIAZwBlAHIAIABEAHIAdQBjAGsAbQBhAHMAYwBoAGkAbgBlAG4AIABBAEcALgAgAEEAbABsACAAcgBpAGcAaAB0AHMAIAByAGUAcwBlAHIAdgBlAGQALgBIAGUAbAB2AGUAdABpAGMAYQBOAGUAdQBlAEwAVAAgAFMAdABkACAAQwBuAEIAbwBsAGQAMQAuADAAMgA5ADsAQQBEAEIARQA7AEgAZQBsAHYAZQB0AGkAYwBhAE4AZQB1AGUATABUAFMAdABkAC0AQgBkAEMAbgBIAGUAbAB2AGUAdABpAGMAYQBOAGUAdQBlAEwAVABTAHQAZAAtAEIAZABDAG4ATwBUAEYAIAAxAC4AMAAyADkAOwBQAFMAIAAwADAAMQAuADAAMAAwADsAQwBvAHIAZQAgADEALgAwAC4AMwAzADsAbQBhAGsAZQBvAHQAZgAuAGwAaQBiADEALgA0AC4AMQA1ADgANQBIAGUAbAB2AGUAdABpAGMAYQAgAGkAcwAgAGEAIAB0AHIAYQBkAGUAbQBhAHIAawAgAG8AZgAgAEgAZQBpAGQAZQBsAGIAZQByAGcAZQByACAARAByAHUAYwBrAG0AYQBzAGMAaABpAG4AZQBuACAAQQBHACwAIABlAHgAYwBsAHUAcwBpAHYAZQBsAHkAIABsAGkAYwBlAG4AcwBlAGQAIAB0AGgAcgBvAHUAZwBoACAATABpAG4AbwB0AHkAcABlACAATABpAGIAcgBhAHIAeQAgAEcAbQBiAEgALAAgAGEAbgBkACAAbQBhAHkAIABiAGUAIAByAGUAZwBpAHMAdABlAHIAZQBkACAAaQBuACAAYwBlAHIAdABhAGkAbgAgAGoAdQByAGkAcwBkAGkAYwB0AGkAbwBuAHMALgBMAGkAbgBvAHQAeQBwAGUAIABTAHQAYQBmAGYAaAB0AHQAcAA6AC8ALwB3AHcAdwAuAGEAZABvAGIAZQAuAGMAbwBtAC8AdAB5AHAAZQBoAHQAdABwADoALwAvAHcAdwB3AC4AYQBkAG8AYgBlAC4AYwBvAG0ALwB0AHkAcABlAC8AbABlAGcAYQBsAC4AaAB0AG0AbABIAGUAbAB2AGUAdABpAGMAYQAgAE4AZQB1AGUAIABMAFQAIABTAHQAZAA3ADcAIABCAG8AbABkACAAQwBvAG4AZABlAG4AcwBlAGQAAAACAAAAAwAAABQAAwABAAAAFAAEAFIAAAAOAAgAAgAGACEAIwApADoAWgB6//8AAAAgACMAJQArAD8AYf///+H/4AAA/93/2f/TAAEAAAAAAAoAAAAAAAAAAAAEAAUATgAGAAcAAAADAAAAAAAA/7UAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAQAEAgABAQEYSGVsdmV0aWNhTmV1ZUxUU3RkLUJkQ24AAQEBKfgPAPgbAfgcDAD4HQL4HgP4FARy+0z6vvlsBRwJTA/WHBuwEhwJhhEABAIAAQDmBAAEJwQ8Q29weXJpZ2h0IDE5OTAsIDIwMDIgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuIEhlbHZldGljYSBpcyBhIHRyYWRlbWFyayBvZiBIZWlkZWxiZXJnZXIgRHJ1Y2ttYXNjaGluZW4gQUcsIGV4Y2x1c2l2ZWx5IGxpY2Vuc2VkIHRocm91Z2ggTGlub3R5cGUgTGlicmFyeSBHbWJILCBhbmQgbWF5IGJlIHJlZ2lzdGVyZWQgaW4gY2VydGFpbiBqdXJpc2RpY3Rpb25zLiBUaGUgZGlnaXRhbGx5IGVuY29kZWQgbWFjaGluZSByZWFkYWJsZSBzb2Z0d2FyZSBmb3IgcHJvZHVjaW5nIHRoZQogVHlwZWZhY2VzIGxpY2Vuc2VkIHRvIHlvdSBpcyBjb3B5cmlnaHRlZCAoYykgMTk5MCwgMjAwMiBBZG9iZSBTeXN0ZW1zLgogQWxsIFJpZ2h0cyBSZXNlcnZlZC4gVGhpcyBzb2Z0d2FyZSBpcyB0aGUgcHJvcGVydHkgb2YgQWRvYmUgU3lzdGVtcwogSW5jb3Jwb3JhdGVkIGFuZCBpdHMgbGljZW5zb3JzLCBhbmQgbWF5IG5vdCBiZSByZXByb2R1Y2VkLCB1c2VkLAogZGlzcGxheWVkLCBtb2RpZmllZCwgZGlzY2xvc2VkIG9yIHRyYW5zZmVycmVkIHdpdGhvdXQgdGhlIGV4cHJlc3MKIHdyaXR0ZW4gYXBwcm92YWwgb2YgQWRvYmUuCiAKIFRoZSBkaWdpdGFsbHkgZW5jb2RlZCBtYWNoaW5lIHJlYWRhYmxlIG91dGxpbmUgZGF0YSBmb3IgcHJvZHVjaW5nIHRoZSBUeXBlZmFjZXMgCiBwcm92aWRlZCBhcyBwYXJ0IG9mIHlvdXIgbGFzZXIgcHJpbnRlciBpcyBjb3B5cmlnaHRlZCAoYykgMTk4MSwgMjAwMiBIZWlkZWxiZXJnZXIgRHJ1Y2ttYXNjaGluZW4gQUcuIAogQWxsIHJpZ2h0cyByZXNlcnZlZC4gVGhpcyBkYXRhIGlzIHRo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') format('opentype'); font-display: swap; }   @font-face { font-family: 'HelveticaNeue107'; font-weight: 900; src: url('data:font/otf;base64,T1RUTwAMAIAAAwBAQkFTRT9iT7oAACmsAAAANENGRiAE9jFsAAAGrAAAIv9HUE9T5C/rFQAAKeAAAAmkR1NVQoYEny8AADOEAAACRE9TLzJdL1fpAAABMAAAAGBjbWFwAbQBWwAABiQAAABmaGVhZAQXqQ0AAADMAAAANmhoZWEH0AOUAAABBAAAACRobXR4uvEHGAAANcgAAAF0bWF4cABeUAAAAAEoAAAABm5hbWVwm5FeAAABkAAABJJwb3N0/7gAMgAABowAAAAgAAEAAAABDAiL/PdIXw889QADA+gAAAAAuukJjQAAAADl3FB4/97/SARdAtgAAAADAAIAAAAAAAAAAQAAAsr+4gDIBGr/3v/rBF0AAQAAAAAAAAAAAAAAAAAAAFwAAFAAAF4AAAACAegDtgADAAQCigJYAAAASwKKAlgAAAFeADIBNgAAAgsIBgQFAgUCBAAAAAEAAAAAAAAAAAAAAABBREJFAAAAIAB6Asr+4gDIA+QA7AAAAAEAAAAAAgUCygAgACAABAAAAA0AogADAAEECQAAAJAAAAADAAEECQABADoAkAADAAEECQACAA4AygADAAEECQADAEgA2AADAAEECQAEADIBIAADAAEECQAFAHABUgADAAEECQAGADIBIAADAAEECQAHATwBwgADAAEECQAJABwC/gADAAEECQALADIDGgADAAEECQAOAEgDTAADAAEECQAQACoDlAADAAEECQARADIDvgBDAG8AcAB5AHIAaQBnAGgAdAAgAKkAIAAxADkAOQAwACwAIAAyADAAMAAyACAAQQBkAG8AYgBlACAAUwB5AHMAdABlAG0AcwAgAEkAbgBjAG8AcgBwAG8AcgBhAHQAZQBkAC4AIAAgAEEAbABsACAAUgBpAGcAaAB0AHMAIABSAGUAcwBlAHIAdgBlAGQALgBIAGUAbAB2AGUAdABpAGMAYQBOAGUAdQBlAEwAVAAgAFMAdABkACAARQB4AHQAQgBsAGsAIABDAG4AUgBlAGcAdQBsAGEAcgAxAC4AMAA0ADcAOwBBAEQAQgBFADsASABlAGwAdgBlAHQAaQBjAGEATgBlAHUAZQBMAFQAUwB0AGQALQBYAEIAbABrAEMAbgBIAGUAbAB2AGUAdABpAGMAYQBOAGUAdQBlAEwAVABTAHQAZAAtAFgAQgBsAGsAQwBuAFYAZQByAHMAaQBvAG4AIAAxAC4AMAA0ADcAOwBQAFMAIAAwADAAMQAuADAAMAAwADsAQwBvAHIAZQAgADEALgAwAC4AMwA4ADsAbQBhAGsAZQBvAHQAZgAuAGwAaQBiADEALgA2AC4ANQA5ADYAMABIAGUAbAB2AGUAdABpAGMAYQAgAGkAcwAgAGEAIABUAHIAYQBkAGUAbQBhAHIAawAgAG8AZgAgAEgAZQBpAGQAZQBsAGIAZQByAGcAZQByACAARAByAHUAYwBrAG0AYQBzAGMAaABpAG4AZQBuACAAQQBHACAAZQB4AGMAbAB1AHMAaQB2AGUAbAB5ACAAbABpAGMAZQBuAHMAZQBkACAAdABoAHIAbwB1AGcAaAAgAEwAaQBuAG8AdAB5AHAAZQAgAEwAaQBiAHIAYQByAHkAIABHAG0AYgBIACwAIABhAG4AZAAgAG0AYQB5ACAAYgBlACAAcgBlAGcAaQBzAHQAZQByAGUAZAAgAGkAbgAgAGMAZQByAHQAYQBpAG4AIABqAHUAcgBpAHMAZABpAGMAdABpAG8AbgBzAC4ATABpAG4AbwB0AHkAcABlACAAUwB0AGEAZgBmAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAGQAbwBiAGUALgBjAG8AbQAvAHQAeQBwAGUAaAB0AHQAcAA6AC8ALwB3AHcAdwAuAGEAZABvAGIAZQAuAGMAbwBtAC8AdAB5AHAAZQAvAGwAZQBnAGEAbAAuAGgAdABtAGwASABlAGwAdgBlAHQAaQBjAGEAIABOAGUAdQBlACAATABUACAAUwB0AGQAMQAwADcAIABFAHgAdAByAGEAIABCAGwAYQBjAGsAIABDAG8AbgBkAGUAbgBzAGUAZAAAAAAAAgAAAAMAAAAUAAMAAQAAABQABABSAAAADgAIAAIABgAhACMAKQA6AFoAev//AAAAIAAjACUAKwA/AGH////h/+AAAP/d/9n/0wABAAAAAAAKAAAAAAAAAAAABAAFAE4ABgAHAAAAAwAAAAAAAP+1ADIAAAAAAAAAAAAAAAAAAAAAAAAAAAEABAIAAQEBGkhlbHZldGljYU5ldWVMVFN0ZC1YQmxrQ24AAQEBKfgPAPggAfghDAD4IgL4IwP4JARp+0z68flsBRwKDg/cHB3UEhwKRREACgIAAQAEAAcAEwAfAC0BFwQxBGAEdQR/Zl9pZl9sb25lLnN1cGVyaW9ydHdvLnN1cGVyaW9ydGhyZWUuc3VwZXJpb3JDb3B5cmlnaHQgMTk5MCwgMjAwMiAsIDIwMDNBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZC4gQWxsIFJpZ2h0cyBSZXNlcnZlZC4gSGVsdmV0aWNhIGlzIGEgVHJhZGVtYXJrIG9mIEhlaWRlbGJlcmdlciBEcnVja21hc2NoaW5lbiBBRyBleGNsdXNpdmVseSBsaWNlbnNlZCB0aHJvdWdoIExpbm90eXBlIExpYnJhcnkgR21iSCwgYW5kIG1heSBiZSByZWdpc3RlcmVkIGluIGNlcnRhaW4ganVyaXNkaWN0aW9ucy4gVGhlIGRpZ2l0YWxseSBlbmNvZGVkIG1hY2hpbmUgcmVhZGFibGUgc29mdHdhcmUgZm9yIHByb2R1Y2luZyB0aGUKIFR5cGVmYWNlcyBsaWNlbnNlZCB0byB5b3UgaXMgY29weXJpZ2h0ZWQgKGMpIDE5OTAsIDIwMDIgQWRvYmUgU3lzdGVtcy4KIEFsbCBSaWdodHMgUmVzZXJ2ZWQuIFRoaXMgc29mdHdhcmUgaXMgdGhlIHByb3BlcnR5IG9mIEFkb2JlIFN5c3RlbXMKIEluY29ycG9yYXRlZCBhbmQgaXRzIGxpY2Vuc29ycywgYW5kIG1heSBub3QgYmUgcmVwcm9kdWNlZCwgdXNlZCwKIGRpc3BsYXllZCwgbW9kaWZpZWQsIGRpc2Nsb3NlZCBvciB0cmFuc2ZlcnJlZCB3aXRob3V0IHRoZSBleHByZXNzCiB3cml0dGVuIGFwcHJvdmFsIG9mIEFkb2JlLgogCiBUaGUgZGlnaXRhbGx5IGVuY29kZWQgbWFjaGluZSByZWFkYWJsZSBvdXRsaW5lIGRhdGEgZm9yIHByb2R1Y2luZyB0aGUgVHlwZWZhY2VzIAogcHJvdmlkZWQgYXMgcGFydCBvZiB5b3VyIGxhc2VyIHByaW50ZXIgaXMgY29weXJpZ2h0ZWQgKGMpIDE5ODEsIDIwMDIgSGVpZGVsYmVyZ2VyIERydWNrbWFzY2hpbmVuIEFHLiAKIEFsbCByaWdodHMgcmVzZXJ2ZWQuIFRoaXMgZGF0YSBpcyB0aGUgcHJvcGVydHkgb2YgSGVp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AAEAAf/bAAIHuAAEAAAIBgjAACMAHAAA//r/+v/6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/5//n/+L/7gAK/8n/7v/b/9v/tgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/6AAD/9AAAAAAAAAAAAAAAAAAA/+7/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/9P/0//QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QAAAAAAAAAAAAAAAAAAP/u/+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+7/7v/J/9v/2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//r/+v/6AAAAAAAAAAAAAAAAAAAAAAAAAAD/9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/b/9sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/5H/kf/bAAD/9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/6AAAAAAAAAAAAAAAAAAD/7v/uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9v/2wAAAAD/9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//r/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/9P/0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2wAAAAD/tgAA/7b/tv+RAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/7v/uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+v/6/+4AAAAAAAAAAAAAAAAAAAAAAAAAAP/0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QAAP/i/+7/7v/0AAAAAAAAAAD/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP9l/2X/tgAA/9j/4v/iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAEgAAAAAAAAAAAAAAAAAA/7b/tgAAAAD/9AAAAAAAAP/0/9sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/uAAD/9P/0/+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+7/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/tv/JAAAAAAAAAAAAAAAAAAD/pP+k/8kAAP+2/7b/tgAAAAD/yf/J/7b/zgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/u/+7/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8n/yQAAAAD/9P/0//QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+4AAAAAAAAAAAAAAAD/pP+k/9sAAP/i/+f/5wAAAAD/4gAA/+7/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/b/9sAAAAA/+7/+v/6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/7b/tv/bAAD/4v/n/+cAAAAA/+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/J/8kAAAAA//T/9P/0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/5H/kf+2AAD/pP+k/6QAAAAA/5EAAP+//9v/7v/nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//r/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9sAAP/b/9v/2wAAAAD/2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAlAAEAGgAbAB0AHwAjACQAJQAnACgAKQArACwALQAuAC8AMAAyADQANQA2ADgAOQA6ADsAPgBCAEMARQBGAEkASgBLAEwATQBZAFoAAQABAFoAIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAMAAAAFAAAACAAAAAAAAAALAA0ADgAAAA8AEQATAAAAFQAXABgAGQAbAB0AAAAgAAAAAAACAAQAAAAGAAcACQAKAAAAAAAMAAAAAAAAABAAEgAAABQAFgAAAAAAGgAcAB4AHwAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcAAQAJAEQACwAUAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABcAAAAAAA0AAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAZAAAAAAAAAAAABgAHAAgACQASAAoAAAAPAAAAEwAaABAAAAAAAAAAGAAAAAAAAAAAAAAAEQAFAAAAFQAbAAAAFgABAAIADgADAAEAAAAKACYAZgABbGF0bgAIAAQAAAAA//8ABQAAAAEAAgADAAQABWFhbHQAIGZyYWMAKGxpZ2EALm9yZG4ANHN1cHMAOgAAAAIAAAABAAAAAQACAAAAAQADAAAAAQAEAAAAAQAFAAgAEgBEAGIA9gEeAUABbgG8AAEAAAABAAgAAgAWAAgAUABbAFwAXQBTAFQAUwBUAAEACAALAA4ADwAQABoAKAA0AEIAAwAAAAEACAABABAAAQAIAAMATwBSAFgAAQABAAoABgAAAAUAEAAmADoATgBuAAMAAAAEAVoAeAFaAVoAAAABAAAABgADAAAAAwFEAGIBRAAAAAEAAAAHAAMAAAADACgATgBUAAAAAQAAAAYAAwAAAAMAFAA6ABoAAAABAAAABgABAAEADgABAAEADwADAAAAAwAUABoAIAAAAAEAAAAGAAEAAQAQAAEAAQAMAAEAAQARAAQAAAABAAgAAQAaAAEACAACAAYADABZAAIAPABaAAIAPwABAAEAOQABAAAAAQAIAAIADgAEAFMAVABTAFQAAQAEABoAKAA0AEIAAQAAAAEACAACABQABwBbAFwAXQBTAFQAUwBUAAEABwAOAA8AEAAaACgANABCAAQAAAABAAgAAQA8AAMADAAaADAAAQAEAFEABAAMAA0ADQACAAYADgBVAAMADAAPAFYAAwAMABEAAQAEAFcAAwAMABEAAQADAA0ADgAQAAQAAAABAAgAAQAIAAEADgABAAEADQABAAQABAADAAwADQH0AAABBAAAAU4ASQIIAA8DCgANAnYABQFNACcBTf/1AlgALwEEACoBcgAXAQQAKgFg//ACCAANAggALgIIABQCCAATAggABgIIABYCCAANAggAGQIIAA0CCAANAQQAKgH0ABwDIAAdAj7/+QI+ACcCGQAVAj4AJwH0ACcB4QAnAiwAGwI+ACcBAgAdAfQAAgI+ACcBzwAnAwoAJwJRACoCLAAVAiwAJwIsABUCPgAnAhkAEwHQ//wCLAAgAhn/9QMK//wCLP/1Ahr/9QHhABMB9AANAgcAGwHhAA0CBwATAeEADQE7//0CBwATAgcAGwECACABAv/eAgcAGwECACADHAAeAgcAGwH0AA0CBwAbAgcAEwFyABsBzwAKATv//QIHABsB4f/8Avf//wH0//wB4f/8Ac8AEgEEAC0B9AAAA+gATwRqAA0D6AAAAUUACQFFAAkDCgAdAwoAHQMKAA8CWAAvAj7//QI+//0BUgAdAA8ADw==') format('opentype'); font-display: swap; } @font-face { font-family: 'GuzmanBoldCaps'; font-weight: 700; src: url('data:font/truetype;base64,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BgcHBwYGBgcHBwYHBwcGBwcHBgYGBwcHBgYGBwYGBgYGByMCRAIDQwcFBQYFBgUGBQYEAgQEAgUDBgUIBgYEWgIIAuoFBwWuAwEFBgYFBgUGBQYFBgUFBQYFBgUGBQUGBQUFBQYFBgUFBQYEBgQBBQIEBgUGBQYFBgUFBgUFBgUFBQYFBQUGBQUGBQQBBgUFBAIFAwIFBAEFBAIEAwEEAgEHAQcBCQsBDWUGBQYFBgUGBQUFBgUFBgUFBgUFBQYFBQYFBQYFBQUGBAYFBQUFAwEBAQAAAQAKAAwCrANEAPwAAAEHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHIxEzFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcjFSUjJyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3BTUnIyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3MxcVFzUhJzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzczITUzNRc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxczNxc3FzcXNxc3FzcXFTMCrAcHBwYHBwcGBgYHBgYGBwcHBgcHBwYGBgcHBwYHBwcGBgYHBwYVDAYGBgcHBwYGBgcGBgYHBwcGBwcHBgYGBwcHBgcHBwYGBgcGBgYFAf2mASMHBwYGBgcGBwcHBgcGBwcHBgcHBwYHBgcHBwYHBwcGBwYHBwcGBwGlygQHBwYHBwcGBwYGBgcGBwcHBgcGBgYHBgcHBwYHBgYGBwYHBwcGBwMfof5TCAcGBgYHBgYGBwcHBgcHBwYGBgcHBwYHBwcGBgYHBgYGBwcHBgciAYQBCgUFBQYFBQUFBgUFBQUFBQYFBQUFBQUFBQoGBQUFBQQFBQUFBQQZAzMGBgUGBQUGBQUGBQYFBgUFBgUFBgUGBAYFBgUGBAYEBgUFBQUD/mUGBgUFBgUGBQYFBgUGBQUGBQUGBQYFBQUGBQYFBQUGBAYEBgUFAgEIAQYFBgUGBQYFBQUGBQUFBgUGBQUFBgUFBQYFBQUGBQUFBgUFBQUEBlsKBgUGBQYFBgUFBQYFBQUGBQYFBQUGBQUFBgUFBQYFBQUFBgUFBQQBAQh2BgUGBQYFBgUFBQYFBQYFBQYFBQUGBQUGBQUGBQUFBQUGBQUFBQQFAQEHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBgYEAAIACgADAtUDZAC2ALkAAAEXNxc3FTcXNxUXNxU3FTcHNxc3Nxc3FzcXNxczNxczNxczNxczNxczNxczNxczNxczNwcRFzcXFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcjJxUnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnByc3NSUjJzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzczATUzNQMXNQGiBQUFBhMBBwEHCAkBAQMEBAUFBgUFBQQBBQQCBQQCBAQCBAQCBAMCBQMCBAMDBAFIASIGBwYHBwcGBwYHBwcGBwYHBgYGBwYHBgYGBwYHBgcHBwYHBgcHBgJcBwYFBQUGBQUFBQUGBQUFBQUFBgUFBQUFBQUFBgUFBQUFBQUFBQUEAf6XIwcHBwcGBwcHBgYGBwYGBgcHBwYHBwcGBgYHBwcGBwcHBgYGBwcIEQFyAXd2A08GBgcHARYBAQcBAggBCAIEAQUBBAcGBgYGBgYGBgYGBQUFBQUFBQUFBQQX/ikEAQIFBgYFBgUGBQYEBgUGBQYFBQUGBQYFBQUGBQUFBgUFBQYEBgQGAwSRBwcHBwcGBgYGBgcHBwcHBgYGBgYHBwcHBwcHBgYGBwcHBwcHBwYGI24SBwUGBQYFBgUFBQYFBgUFBgUFBgUFBQYFBgQGBQUGBQUGBQUFBQQBtBkC/iQGkQAAAQAKABECzANAAKsAAAEHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFzcXFzcXFQcjAycHJSMnNSMnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNzMFNyU3NycnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNzUhNxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHIwUHBTMCyQYGBwYHBwcGBwYHBwcGBwYHBgYGBwYHBgYEAQECBgMGATUHAf2tAx4DBwcGBwcHBgcGBwcHBgcGBwcHBgcGBwYGBgcGBwYGBgcGBwYGBggB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GAEQBwYHBgcGBwcHBgcGBwYHBgcGBwYHBgcGBwYHBgcGBwYHBgcGBwYHBgYG/XcEdRbKEXYGAAEACgALAscDWwC6AAABBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXIwcXIyUTJTU3BxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFyMFFycHJwcnBycHJwcnBycHJwcnBycHJwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnAxUnFzcXNxc3NRc3FzcXNxc3FzcXNxc3FzcXNxc3NTM3FTcnMzUFAsYGBgcHBwYGBgcHBwYGBgcHBwYHBwcGBgYHBwcGBgYHBwcGBgYHBwcGBgYcAQcw/nIeAY4vBQYGBgYGBgYGBgYGBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBy/+gAEHBQYFBQUFBQYEBgUFBQUFBQUFBQUFBQEEBAIEBQEEBAIEBAMDBAIEBAMDBAMCBAMDAwQCAzUDBgQGBQUDBgUFBQUGBQUFBQUGBQUFBQUGBQIBAgQGBwImA1YHBQUGBQUFBQUFBQYEBgQGBQUFBQUFBQUFBQUFBQUFBQUFBQUFBAUFBAUBBAT+YgMBAQcFBQUFBQYFBQUFBQUFBQUFBQUFBQUGBAYFBQUFBQUFBQQGBAUFBQQDCAYHBgYGBwcHBgYGBwcHBgYGBwcHBgYFBgUFBQUEBQUFBAQEBQQEBAQDBDAC1wEvBgcHBwYEGAYGBwcHBwcGBgYGBgcHBwcHBwcCAQMBAgQBBQADAAoADwMtA2sA3ADhAOYAAAEHFwcXBxcHFwcXExcHJwcnBxcXNxczNxc3FzcHMwMXBxcHFwcXBxcHFwcXBxcPAicjBycHJwcnBycHJyMFFSMVBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwc1ESc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnMzM1FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxUFNxczNxc3FzcXNxc3FzcXNxc3FzcXMzcXFzcBJTcnJQUXFzcnAqUHBgYGBwYGBgQDfQEDBwMHAgIBBgIBBgIHAgYEAYgDBwcH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BxcHFwcXBxcHFwcXBxcHFwcjFzMVFwcVFwcVFwcVFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXDwInBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHFxUHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycjBycjBycjBycjIyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzM1NzcDMzUXMzcXMzcXNTM3FTM3FTM3FzM3FSUzFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxUhEzc1Iyc3NSc3NSc3NSc3NSc3NSc3NSc3NSc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3MzUC2QcGBwcHBwcGBgYGBgcHBwcHBwcGBgYGBgcHBwcHBgYGBgYHBwcHBgYtAQIGBgcGBgYHBgcGBgYHBgcGBgYHBgcGBgYHBgcGBwcHBgcGBwcHBgcGCwIGBQYFBQYFBQYFBQYFBQYFBQUGBQUFBgUFBQYFBQUGBAYFBQQGBQLqAQUFBgUFBgUFBQUFBgUFBQYFBQUFBQUFBgUFBQUFBgUFBQUFBQEEBQEDBQEFARUDBgYHBwcHBwYGBgYGBwcHBwcGBgYGBgcHBwcHBwcGBgYGBgcHBwcHBwwJEgEEAgQFAgQDmQEJAQkBAQoBAeMBBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBgYGBgYGBgYGBgYGBgYGBv4iDO+pBgYGBgYGBgYGBgYGBgYGBwcHBgYGBgYGBgYGBgYGBgYGBgYGBgYGBwICFQUFBQUFBgQGBQUFBQUFBQUFBQUFBQUFBgQFBQYEBQUFBQUFBQUEBgU4AQQFAQQFAQQGAQMGBQUFBQUFBQUFBQUFBQUFBgQFBQUFBQUFBQUEBgQFBAYBLAYGBgcHBwcHBgYGBgYHBwcGBgYHBwcHBwYGBgcHBwcHBgYGBgYHJA4XAwcHBwYGBgYGBgYGBgcHBwcHBwcHBwcHBwcGBgYGBgYGBgYHBgYGBgYGFAUGBQUFBQYFBQUGBQUFBQYFBQUFBgUFBQUFBQUGBQUFBQUFBQUFBAEBAQJcBQUGBgYEBQEBAQEBAQEBAQUFBQUGBQUFBQUFBQUFBgUEBgQGBAYFBQUFBQUFBQUFBAYEBgQFBAUB/nEPRQUEAQUEAgUEAQUEAQUEAQUEAQUEAQUGBAYEBQUGBQUFBQUFBQUFBQQGBAUFBQQFAQAAAQAKACEC7wNZARMAAAEXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxUzEzMXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHIxUjBxc3FwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHNQMhEyMXBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwc1AycnNzUnNyc3JzcnNyc3JzcnNyc3NSc3JzcnNzUnNyc3Jzc1JzcnNyc3NSc3NSczAycXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FTMTIQM1FwH8BQUGBQUGBQUGBQUGBQUFBgUFBQYFBQYFBQUFBQYFBQUFBQUFBwUBAh4HBwcHBwYGBgYGBwcHBwcHBwYGBgYGBwcHBwcGBgYGBgcHBwcHBwcGBA4OAgEBBQUGBQUGBQUFBgUFBQUGBQUFBQYFBQUFBgUFBQUFBgUFBQUFBQQFBQYD/vgJAQEFBgUGBQUGBQUFBQYFBQUGBQUFBQUFBQYFBQUFBQYFBQUFBQUFBAUFBggLBgYGBwYGBgYGBwYGBgYGBwYGBgcGBgYGBgcGBgYGBgcGBQUFBQUEBAgCBgUFBQYFBQYFBQYFBQYFBQUGBQUGBQUFBgUFBQUFBgUFBQUFBQUHBQEJAQwDBQNXBwcHBwcHBwcHBwYGBgYGBgYHBwcHBwcHBwcHBwYGBgYGBgYGBgcJ/s4FBQUFBQYFBQUFBQUFBQUGBAYEBgQGBQUFBQUFBQUFBQQGBAYEBQQFAQH1ASoGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYBH/7aBwYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgcHBgYGKAEKAQUEAQYFBQUFBQYFBQUGBAYFBQQBBQUGBQUEAQUFBQUFBAEGBAYEBQQCBAMDBAEGLwYHBgYGBwcHBwcGBgYGBgcHBwcHBgYGBwcHBwcGBgYGBgcHBwcHBgYG/s4BLwkGAAEACgATAOgDbgBjAAATMzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzM3FzM3FzcHBycTNwcHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycjBycjBycjBycjBycjBycjBzUjCgkBBAYFBgUFBQYFBgUFBQYFBQUGBQUFBgUFBQYEBgUGBQUFBQMCBQMCBQcFAQYCBwQBBQUGBQYFBQUGBAYFBQUGBQUFBQUFBQYFBQUGBAYEAQUFAQQEAwMEAwMDAwMDBQMCA14QBgYGBgcGBgYHBgYGBwYHBwcGBwcHBgcHBwYHBwcGBwcHBgYGBgUHByoGAv0HBCkGBgYHBgYGBwYHBwcGBwcHBgcHBwYHBwcGBwcHBgYGBgUFBQUEBAQEAwMAAAEAIwAaApIDWgDQAAATFzcXNxc3FzcXMzcXNxczNxczNxczNxczNxczNxczNxczNxczNxczNxczNxczNxczFzMDNRc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXBxMzFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXByMHFQcnBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycHJyEHJzcHAxUnFy4FBQYFBQUGBQUBBQUFBQEFBAEFBQEFBAIFBAEFBAEFBQIEBAEFBQEFBAIEBAEFBAgGoAYFBgUFBgUFBgUFBgUFBQYFBQYFBQUGBQUFBgUFBQUGBQUFBQUFBQcFAQEGJQgICAgICAgICAgICAgHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcBIwUFBQYBBAUCBAQCBAQCBAUDAwQDAwUDAwQDAwQCBAQCBAUCBAQCBAQCBAUCBAUBBAUBBAUBBAUBAwUGAf7oIwYCIwwCBQGHBgcHBwYGBgcHBwYGBgcGBgYHBgYGBgUGBgYGBgUGBgYGBwaPAlcJBgcHBwcHBwcHBwcHBwcHBwcHBwcHBgYHBwYGBwcGBgYGBgYGBgYGByoB/coFBQUFBQYFBQUFBQUFBQUGBAYEBgQGBAYFBQUFBQUFBQQGBAUFBQQFAQ4GBgYFBQUFBAUFBQUFBQUFBQUFBQUFBQUFBQUFBgYGBgYGBgYGBgYGBhcBBQIBASIBLwYAAQAKAA0C7QOFAMcAAAEVNwc3FTcVNwc3BzcVNwc3BzcVNwc3FTcHNxU3BzcHNwc3BzcXMwcjBxMXBycHJxUnBycVJwcnFScHJxUnBycVFScHJxUVJxUnBycVJxUnFScVJwcnBycDBxMVBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnJyM3BzcHNwc1BzcHNwc3Izc1NwM1FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxUTATcVAjsIAQgICAEJAQgIAQkBCAgBCAgBCAgBCQEIAQgBCAEJHQHN+hEBCAEICAEICAEICAEICAEICAEICAgBCAgJCAcBBwIE8j0MBQYFBQUGBQUFBgUFBQUGBQUFBQYEBgUFBQUFBgQGBQUFBQUFBQUEBgUBCgIBCAEIAQgIAQgBCAEIBCsXBQUGBQYFBQUGBQUGBQUFBgUFBQYFBQYEBgUFBQUGBQUFBQUFBQUHBg4BLAQDfggBCAEJAgkBCAEIAQkCCQEIAQgBCAEJAggBCAEJAQgCCAEIAQod1f6fFQkDCQMJAggCCAIIAggCCAIIAggDAQgDCQMBCAMJAwgCCAIIAggCCAMIAggFAVU+/v8BBwYHBwcGBgYHBgYGBwYGBgcHBwYHBwcGBwcHBgYGBwYGBgcHBwYHBwcN8wgBCAEIAQkCCQIIAQgEASwB+AcFBwYHBwcGBgYHBgYGBwcHBgcHBwYGBgcHBwYHBwcGBgYHBwcGBwcIEf7YATYECAAAAQAKABcCfQN3AL8AABMXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXMzcVEyEXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHIRUjBycHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHJyMHNScjJzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnMwM1FyoGBQUGBQUGBQUGBQUFBgUFBQYFBQYFBQUFBQYFBQYFBAUGBAYGAgQBAYIHBwcHBwgHBwcHBwcHCAgIBwcHBwcICAgHBwcHBwcHCAgIBwcHBwcI/oQB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Nyc3JzcnNyc3JzcnNycXMzcXMzcXMzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXMxUlJzcHFwcXBxcHMxUzBxUzBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxcHFwcXBxcHAzcXJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJzUFBzc1Jzc1JzMnBycHJwc1IzURIxM3EQcbBwcHBgcHBwYHBgYGBwYHBwcGBwcHBgcGBgYHBgYGBwYHBwcGBwcHFQIEAgQFAQUEAQUFBQYFBQUFBgUFBQUFBQYFBQUFBQUFBQUGBAYEBQUFBQUEBAUBAQGeAS8FBwcHBgcEBQEBAQECAgICAwMDAwQEBAQFBQUFBgYGBgcGBwcHCAEBAQcFBQYFBQUFBQUGBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEBQUFBAH+YxcFBgUFAQQFBAUFBAEK3f39AmQFBQUFBQYFBQUGBAYFBQUFBQYFBQUFBQUFBQUGBAYEBQUFBQUEBAUCIwUFBQYGBgYGBgcHBwYGBgcHBwYHBwcHBwYHBwcHBwYHBwcGBgYHBwcGBgwQIAEECAUFBQUFBBsBCQEIAQIHAQIGAgIGAgMEAwQDAwQDAwQCBAQCBAUFBQUFBAUFAf2mAS8GBwcHBwcHBgYGBgYGBgYGBgYGBgYGBgYGBgcHBwcHBwcHBwcHBwcHBwcHBhYCBQIEBAIEBgYGBgYGBioCG/5zDgGkFAAAAgAKABEC6ANiANsA3wAAEzUnNzUnNzUnNzUnNzUnNyc3NSc3Jzc1JzcnNzUnNyc3JzcnNyc3JzcnNyc3JzcnNzUXJRU3BxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFRcHFRcHFRcHFRcHFRcHFRcHFyMXIxMXJwcnIxUzBxcXBxcXBxcXBxcXBxcXBxcXBxcHBRUjFycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBzc1Jzc1Jzc1Jzc1Jzc1JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3NTc1Bxc3JwcaBgUFBQYGBgUGBgYFBgYHBgYGBwYGBgcGBgYHBgYGBwYHBwcGBwcHK2MCEgsFBwcHBgYGBwcHBgYGBwcHBgYGBwcHBgYGBwYGBgYFBgUFBAQDBAQBAQQFLwEIBAUCAQIBAgIBAwMBAwMBBAQBBAQBBQUBLP5ZAQEHBQUGBQUFBQUFBQUFBQUGBQUFBQUFBQUFBQUFBQUFBQUFBQUFBAUFBAUBAQEDAwQEBQUGBgcGBwYHBgcGCAYHBgcGBwYHBgcGBwgKIPP/GeYCaQIEBAIEBQEFBAIEBAEFBgUEAQUFBQQBBQYFBAEFBQUFBQUFBgQGBAUFBQUFBAUEAwgBKgEBCAQGBQUFBQUGBAYFBQUFBQUFBQUFBQUFBQUFAQQFAQQEAgQEAwMEAwMDBAICBQP++gYDBgUBAgcBAgcBAwUBBAUBBAQCAwQCAQEGPPAMBQYHBwcGBgYHBwcGBgYHBwcGBgYHBwcHBwYGBgcHBwYGBgcHBwcHBgYGMNwBAQgCAgUDBAMDBQEEBgUFBQUFBQUFBQYEBgQFBAYEBgMFBAEBAaoCiiONEgACAAr/xgMWA2EAyQEEAAAlIzUFJycHJwcnBycjEQc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNzc1Jxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxUlFTcHFwcXBxcHMwcXBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxUXBxcHFwcXBxcHFwcXBxcHERcXBxcnFyMXIxcjFyMXIxcjFyMXIxcnFyMXIxcnFycXIxcnFyMXIxcjFycVATcnMzcnMzcnMzcnMycXNycXJxczJzM3JzMnMzMnMycXNycXJzMzJzMnFyczJxczJxcnFzcXEQcRNycCNEL+UQEEBAUEBQQBBQ0GBwcHBgcHBwYHBgYGBwYHBwcGBwcHBgcGBgYHBgYGBwYHBwcGBwcHCRABBQYFBQUFBQYFBQUFBQYFBQUFBQYFBQUFBQUFBQUFBgUFBAUFBQUFBAUEAcMLBQcHBwYHAwIBAgIDAwMDBAQEBAUFBgYGBgcHBwYHBwcGBwYGBgcGBgYHCywlCQIJAggBCAIJAggCCQIIAgkCCAIIAQgCCAEIAggCCQIIAgkCCAIIAgv+qgEBBwECCAECCAECCAIIAQIIAQcBAggBAggCCAECCAIIAQIIAggBAggCCAEHAQcBAgcCBQE//VAZFgYYFgUHBgYGBgcCRQEGBAYFBQUFBQYFBQUFBQYFBQUFBQYEBgQGBAYFBQUFBAYEBQUFBAUEAQEMGQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYHBwcHBwcHBwcHBwcHBxUjAQEHBQYEBgUCBwECBwEDBgEDBQIEBAMDBAMEAgQEAgQFAQQFAQQFBQUFBQUFBAYEBgQFBAH+DCQdAQkBCAgICAgHCAgIAQgICAEJAQgIAQgIBwcKAQEhAQcBBwEHAQcIAQEIAQkBCAEHCAgIAQEIAQgICAEICAEIAQgEATUBNRP+YgQVAAIACgABAvYDXAE0ATgAABM1FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FTMVIRUzBxcHFwcXNxcXBxUzNxUzEyMXJwcnBycHJwcnBycHJwcnIwcXBxcHFwcVFwcXFyMXFycVJwcnFScHJxUnFScHJxUnFScHJxUnFScVJwcnFScVJxUnFScVJxUnJwMHFRUnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwc1NQc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNzU3NSc3JzcnNyc3JzcnNyc3NSc3JzcnNzUnNzUnNyc3NSc3NSc3NSc3NSc3NSc3NSc3NSc3NSczNRM3JwcqBgUFBQUFBgUFBQUGBQUFBQUGBQUFBQUFBQYEBQUGBQUFBQQGBAUFBQQEAQGeBwYHBwcHAgECAgEBBAEQAgEHBQUGBQUFBQUFBQUGBQUBBAUHBwYGBgcGAgQChAkICAEICAEICAgBCAgIAQgICAgBCAgICAgIBAzNdgUBBQUBBAUBBAUBBAUBBQUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAUBBAQBBAUBBBoGBgYHBwcGBwcHBgYGBwcHBgYGBwcHBgYGBwcHBgYGBwcHBgYGBwcHDhMZBwcHBgYGBwcHBgYGBgYGBQYGBgYGBQUFBgYGBQUFBQUGBQUFBQUGBQXg7QXoA00PBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHCAcBBwUFBQYCAgQBAQEHBv48CAYHBwcHBwcHBwcHBwcHBgUDBQUFBQUBBAQCA7MMAQgCCAIIAggDCQMIAggCCAIIAwkDCAIIAggDCQMIAggCCAMIAggDCAYQARYG0i8GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYwxAEFBQUFBgUFBQUFBgUFBQUFBgUFBQUFBQUFBQUFBgUFBAUFBQUFBAUEAQEBnQEFBQUGBQUFBgQGBQUEAQUFBgUFBAEFBAEFBQYDAgUDAgUEAQUEAgQDAgUDAQUEAgQDAQQB/qMNiAEAAQAKABQC9QNJAQEAAAEXBRcHFwcXBxcHFwcXBxUXBxUXBxUXBwcXNxc3FzcHMwcHFwcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFyMVIwcHJycHJycHJycHJyMHJyMlIzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyczBTclJyc3JzcnNyc3JwcnJzc1Jzc1JzcnNzUnNyc3Jzc1JzcnNyc3Jyc3LwIXMzcXMzcnNyc3JzM3FzM3FzcXNxc3FzcXNxc3FzcXNxchNwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcjAQEPAdkHBwYHBQcGCAYHBQcGBwUGBQYBAwQDBgIGAgELIgIDAgUHBgYGBgYGBgcHBwcHBwcHBwYGBgYGBgYHBwcHBwcHBwcHBwYGMAMBBAMFAgMFAgMFAgMEAgj94wkHBgYGBgYGBgYGBwcHBwcHBwcHBgYGBgYGBgcHBwcHBwcHBwYGBgYFLgGUFf6BJgkHBQcGCAYHBQQwHQYFBQUGBgYGBwYGBgYGBgUGBgQBAwICCAcGAQMGAQMDBgUGBlsBBAQCBgQGBAYEBgMGBAYDBgMGAwYBrS8GBwcHBwYGBgYGBwcHBwcHBwYGBgcHBwcHBwcGBgYGBgcHBwcHBgYGLwJoRD0BBgYEBgQGBAYEBgQBBQQBBQQBBQMDAgMIBQgFByZ4AQIFBAUFBQUFBQUFBQUFBgUFBQUFBAYFBQUEBgUEBQYEBQUFBQUEBQILBAUBAwUBAwUBAwYDAwIFBgUFBQUFBgUFBQUFBQUGBQUFBQUFBQUFBQUFBgUEBQUFBQUEBQQFAk0yBQEEBgUGBAYEBgHNAQQCBAQBBgUFBAEGBQUFBQQBBgQGBQUDBAMBCiMcBAcFBgMEBQQFAwMFBQgFBwUIBggFBwUIBggFBxgBBwUFBQUFBgUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEBAAAAQAKABkC3ANLANUAAAE3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzM3FzM3FTc3BxcHFwcXBxcHFwcXBxcHFwcXBxcHFwcXBxcHFRcHFRcHFRcHFRcHFRcHFRcHFyMHEzcXJwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwcnIwc1Iyc1FQMHNSM3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnNyc3JzcnMzcHNzUBDQYFBQUFBQYFBQUGBQUFBQUFBQYFBQUFBQUFBQUGBQUFBAUFBQUEAQUDAQTZJAUGBgYGBwcHBwcHBwcHBwcGBgYGBgYGBgYHBwcGBgYGBgYGBgYGBgYG+AUBAggFBQEEBQEEBQIEBAMDBAMDBAMDBAMDAwQDAwQDAwQDAwQDAwUDAwQDAwQCAwUDAwMDAwQDAwQDAwMDAwQCAQEF+gcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHCiYBzwNEBwcHBwcHBwcHBwcHBwcHBwcHBwcGBgYGBgYGBgYGBgYGBgYGBgYGBQUHBAIHBQUGBQUFBQUFBgQGBAYFBQUFBQUFBQUFBQUBBAUBBAUBBAUBBAUBBAUBAwUEBf3OAS8FBgUFBQUFBQQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEGhIBAi8EAQUFBQUGBQUFBQUGBQUFBQUFBQUGBQUFBQUFBQUFBQUFBAYEBQUFBAQBAQQLAAIACgAAArwDRAC7AL4AABMXNxc3FzM3FzcXMzcXMzcXMzcXMzcXMzcXMzcXMzcXNxczNxczNxczNxczNxczNxc3FzM3FzM3FTMTNxM1Jxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxUDFScjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBycjBzUFIzc1JzcnBycjBycjAycXEzcjEwYFBQUEAQUGBQQBBQUBBQQBBQQBBQQCBAUCBAQCBAUFBAEFBAIEBQEEBQEEBAEFBQUEAQQDAQUBFfUBAgYFBQUFBQUGBQUFBQUGBQUFBQUFBQUGBQUFBAYEBgUFBQUEBQUFBQQFBgEGAgQFAQQFAgQFAQQFAQQFAQQFAgMFAgQFAQQFAQQFAQQFAQQFAQQFAQQFAQQFAQQFAQQFAQQFAQMFAQQEAQT+UgYFBgYGAQQCAwEBGgIEJAMBAz0GBgYHBwcGBgYHBgYGBgUGBgYFBgYGBgYFBgYGBgYFBgYGBgYGBwYGBv2VDgIzAS8HBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwYJ/NgFBQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYFCxgFAQUFBQIFBQUC9TAH/N8DAAABAAoACgLUA2EAnAAANycDNScXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXExM3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3BwcDIwcnBycHJwcnBycHJwcnBycHJwcnBycHJycHJycHJycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnI9sDygQHAwcDBwMHAwcDBwMHAwcDBwMHAwcDBwMHAwYEBgQGBAYDBgQGAwYDBgMGjJgHAwcDBwMHAwcDBwMHAwcCBwMHAwcDBwMHAwYDBwMHAwYDBwIHAwcCBgIHAgzhAQIEBwMHAwcDBwIHAwcDBgMHAwcCBwMHAgIFAwEGAQQEAQEHAwYDBwMHAwYEBgMHAwcDBgMHAwYCBwICATkMAtkCDQUHBQgFBwUIBQcFCAUIBggFCAYIBQgFBwUIBQcFCAUHBQgGCAUHBQgGCB3+CAHuGAgFCAUIBQgFCAUIBAcEBwQHBAcEBwQHBAcEBwUIBQgFCAUIBQgFCAUHBQcn/SwICAUIBAcECAUIBQgEBwQIBQgFCAQHBAYBBAYBBAMDAwEEBQcFCAUHBQgFBwUIBQcFCAYIBQcFCAYIBwABAAoAAwQsA20A+gAAATcnJxc3FzcXNxc3Nxc3FzM3Fxc1Nxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXExM3FzUXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcHAyMHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcVIwcnJwcnBycHJwcnJwc3AwMXFycHJwcnBwcnIwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnBycHJwcnJwc3NwMnFzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzcXNxc3FzMBQVAJBgcCCAIHAgMJAgMHAgIGAgIGAgIHAgcCCAIHAgcCBwIIAgcCBwIHAgcCBwIGBBGYZggBAwYEBgQGBAYEBwMHAwcDBwMHAwcDBwMHAwYEBgMHBAYDBgQGAwcDBgIHAsABAgQHAwcDBwQGAwcDBwMGBAcDBgQGAwcDBgQGBAYDBwMCAgMCAQEIAQcCBwUEBgIBj2oCCwkDBgQFCAIDAQYDBwMBAwMCAgYEBgMHAwYDBwMHAwYEBgMHAwYDBwMGAwYDBgYDFgQBAa8MBwMHAwcDBwMHBAYEBgQGBAYEBgQGBAYEBgMHAwYEBwMGAwYEBgQFBAUDAQEB1esXDQQIBAgECAIaBggEBwQHAQEEBgcECAQIBAgECAQIBAgECAQIBAgECAQIBQgEBy3+lQGnJwQDBwUIBggFBwUIBQcFCAYIBQcFCAYIBQcFCAUHBQcFCAUHBQcFCAYIBQcFCPzkBwgFBwUIBggFBwUIBggFBwUIBggFBwUIBggFBwUIBggBAgIFAQgECAUIBAgLDwIFAVX+ygggBAgFCAQUBggEBwQHAwECBQcFBwUIBQgFCAUHBQgFCAUIBQcFCAUIBQcFCAUHElICBQQCli4FBwUIBggFBwUHBQgGCAUHBQcFCAYIBQcFBwUHBQgGCAUHBQcFBwUHBQcGAAABAAr/6gLvA3QAugAABSc1AwcVBwc1BycHJwcnBycHNQcnBycHNQcnBycHNQc1BycHNQcnBzUHJwc1BzU3NTc3EwMnNxc3FzUXNRc1FzcXNxc3FzcXNRc1FzUXNxc1FzcXNxc1FzcXNxc1HwI/Axc3FzcXNxc3FzcVNxU3FTcXNxc3FzcXNxU3FzcXNxU3FzcVNxU3FQcDEzMfAgcnFScVJxUnBycHJxUnBycHJxUnBycVJxUnBycVJwcnFScHJxUnFScnAjkL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') format('truetype'); font-display: swap; } @font-face { font-family: 'HelveticaNeueLTStd'; font-weight: 400; src: url('data:font/opentype;base64,T1RUTwAMAIAAAwBAQkFTRT9iT7oAACM8AAAANENGRiAzqC29AAADjAAAH69HUE9T5RDwqAAAI3AAAAdQR1NVQla0VcMAACrAAAAC9k9TLzJZ8VS7AAABMAAAAGBjbWFwATUBtgAAAwgAAABiaGVhZAHojHAAAADMAAAANmhoZWEHZgNEAAABBAAAACRobXR4rf8NSgAALbgAAAF8bWF4cABfUAAAAAEoAAAABm5hbWUenio+AAABkAAAAXhwb3N0/7gAMgAAA2wAAAAgAAEAAAABB2xWALbMXw889QADA+gAAAAAuSPw1QAAAADl3FEJ/+n/SAPoAv4AAAADAAIAAAAAAAAAAQAAAsr+4gDIBA3/6f/1A+gAAQAAAAAAAAAAAAAAAAAAAF8AAFAAAF8AAAACAbwBkAADAAQCigJYAAAASwKKAlgAAAFeADIBNgAAAgsFBgMFAgMCBAAAAAEAAAAAAAAAAAAAAABBREJFAEAAIAB6Asr+4gDIA6QA1AAAAAEAAAAAAgUCygAgACAABAAAAAMAKgADAAEECQAAARQAAAADAAEECQABACwBFAADAAEECQACAA4BQABDAG8AcAB5AHIAaQBnAGgAdAAgAKkAIAAxADkAOQAwACwAIAAyADAAMAAyACAAQQBkAG8AYgBlACAAUwB5AHMAdABlAG0AcwAgAEkAbgBjAG8AcgBwAG8AcgBhAHQAZQBkAC4AIAAgAEEAbABsACAAUgBpAGcAaAB0AHMAIABSAGUAcwBlAHIAdgBlAGQALgAgAKkAIAAxADkAOAAxACwAIAAyADAAMAAyACAASABlAGkAZABlAGwAYgBlAHIAZwBlAHIAIABEAHIAdQBjAGsAbQBhAHMAYwBoAGkAbgBlAG4AIABBAEcALgAgAEEAbABsACAAcgBpAGcAaAB0AHMAIAByAGUAcwBlAHIAdgBlAGQALgBIAGUAbAB2AGUAdABpAGMAYQBOAGUAdQBlAEwAVAAgAFMAdABkACAAQwBuAFIAZQBnAHUAbABhAHIAAAACAAAAAwAAABQAAwABAAAAFAAEAE4AAAAMAAgAAgAEACEAKQA6AFoAev//AAAAIAAjACsAPwBh////4QAA/97/2v/UAAEAAAAKAAAAAAAAAAAAAwAEAAUABgBPAAcACAAAAAMAAAAAAAD/tQAyAAAAAAAAAAAAAAAAAAAAAAAAAAABAAQCAAEBARZIZWx2ZXRpY2FOZXVlTFRTdGQtQ24AAQEBKfgPAPgbAfgcDAD4HQL4HgP4GQR0+0z6fPmSBRwEkA/LHBcxEhwExxEABAIAAQDmBAAEIgQ3Q29weXJpZ2h0IDE5OTAsIDIwMDIgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuIEhlbHZldGljYSBpcyBhIHRyYWRlbWFyayBvZiBIZWlkZWxiZXJnZXIgRHJ1Y2ttYXNjaGluZW4gQUcsIGV4Y2x1c2l2ZWx5IGxpY2Vuc2VkIHRocm91Z2ggTGlub3R5cGUgTGlicmFyeSBHbWJILCBhbmQgbWF5IGJlIHJlZ2lzdGVyZWQgaW4gY2VydGFpbiBqdXJpc2RpY3Rpb25zLiBUaGUgZGlnaXRhbGx5IGVuY29kZWQgbWFjaGluZSByZWFkYWJsZSBzb2Z0d2FyZSBmb3IgcHJvZHVjaW5nIHRoZQogVHlwZWZhY2VzIGxpY2Vuc2VkIHRvIHlvdSBpcyBjb3B5cmlnaHRlZCAoYykgMTk5MCwgMjAwMiBBZG9iZSBTeXN0ZW1zLgogQWxsIFJpZ2h0cyBSZXNlcnZlZC4gVGhpcyBzb2Z0d2FyZSBpcyB0aGUgcHJvcGVydHkgb2YgQWRvYmUgU3lzdGVtcwogSW5jb3Jwb3JhdGVkIGFuZCBpdHMgbGljZW5zb3JzLCBhbmQgbWF5IG5vdCBiZSByZXByb2R1Y2VkLCB1c2VkLAogZGlzcGxheWVkLCBtb2RpZmllZCwgZGlzY2xvc2VkIG9yIHRyYW5zZmVycmVkIHdpdGhvdXQgdGhlIGV4cHJlc3MKIHdyaXR0ZW4gYXBwcm92YWwgb2YgQWRvYmUuCiAKIFRoZSBkaWdpdGFsbHkgZW5jb2RlZCBtYWNoaW5lIHJlYWRhYmxlIG91dGxpbmUgZGF0YSBmb3IgcHJvZHVjaW5nIHRoZSBUeXBlZmFjZXMgCiBwcm92aWRlZCBhcyBwYXJ0IG9mIHlvdXIgbGFzZXIgcHJpbnRlciBpcyBjb3B5cmlnaHRlZCAoYykgMTk4MSwgMjAwMiBIZWlkZWxiZXJnZXIgRHJ1Y2ttYXNjaGluZW4gQUcuIAogQWxsIHJpZ2h0cyByZXNlcnZlZC4gVGhpcyBkYXRhIGlzIHRoZSBwcm9wZXJ0eSBvZiBIZWlkZWxiZXJnZXIgRHJ1Y2ttYXNjaGluZW4gQUcsIAogYW5kIG1heSBub3QgYmUgcmVwcm9kdWNlZCwgdXNlZCwgZGlzcGxheWVkLCBtb2RpZmllZCwgZGlzY2xvc2VkIG9yIHRyYW5zZmVycmVkIAogd2l0aG91dCB0aGUgZXhwcmVzcyB3cml0dGVuIGFwcHJvdmFsIG9mIEhlaWRlbGJlcmdlciBEcnVja21hc2NoaW5lbiBBRy4gSGVsdmV0aWNhIE5ldWUgTFQgU3RkIDU3IENvbmRlbnNlZEhlbHZldGljYSBOZXVlIExUIFN0ZAAAAQABAQAEAwAJAQAMDwAgGwBCGQBoAABtAgB5AQCJAACLAACPAACWAACbAACeAACjAQCmAACpAABfAgABAE0AUABuALwBYwGSAi4CXwKQArICuAK6AsMC0gMjA0wDnQQVBEEEkQUCBTkFtwYnBjoGmwdAB08HpgfjCAIIBwgVCGsIlAiZCMkI8Aj+CTcJUwldCXMJtgocCjsKVQpaCoEKxAr5CwELCgsiC2oLkQvfC+UL8wxrDIUMkQzMDPsNBQ1JDVgNXg10DcQN/g4SDkgOVg58DsAO8A75DwIPEA8jDzMPRg9oD7EPxRBFEH8QpBDZERYRZBF5EYURqI+LvfjsvQGLvfgkvQOLBPiI+VD8iAb3jvvFFfs+95MF9+gG+yD7wBX3PveTBfySB/wGXhX3PveT9z77kwX8Bvi/Ffc++5P7PvuTBQ77lA77govr+P53mAru904VE+DHBpv4pG8K/V4E5+svBg57oHb3Yc33Ls33X3cBovhGA9oWzQal92EF9QZx+2EFzQal92EF5s04Bp73LgXizT2KCiGKCitJ4gZ4+y4FMUndBuj3cBX1Bnj7LgUhBg57+wD3Olh2+R73FlF3EqDjPOfqtefjQ+cTWoD3l/fGFcd1u2xBGhOmgEZdXE2GHmH37xVVoGKqzxrMrbHIkx4TloDTBPs1gXH7C0wa+x3sbeVuHvuaBxOagCOVh9jUGjMGE1qA+yO4OPcrhR4TmoAttQcTaoDpB+uR8773Khr3JPsAoi+qHveJBxNrANCEolpJGuMGE1sAifcOU837DpEIE2qAxWEHDvebcwr3I5YKE7/3RfgONwqU/ByRChPf4f0wNwoTv/wp97AVMwoT3/gp++YVMwoOx33TZnb5HM0SpON+2fcj2bjZE7YTrveC+FkVeqMFdax2r6satKeotrWpbmJba29rbB73B/vsFWRpZW1TGxO2RU654ta4wcStH8e5FaWhBby0vLjRGuxOsjEeE646SFM3WaVjpWMfoWcFE7ZXZAVRXmRJQRpKsfsZ90LYt6i/wh4TdrtIBeoGL/cVBaauqvcNvxo9BoZMgmN9ZwgOmgq23wP3UfleFSz7Flj7NPszGvsyv/s26fsVHrsGQfcjZ/ck9zYa9y+o9zXc9xkeDpoK9wbfA7/7TBXq9xa+9zT3Mxr3Mlf3Ni33FR5bBtX7I6/7JPs2Gvsvbvs1OvsZHg7zoHb3cM0B95/NA/efFs33cPdwzftw93BJ+3D7cEn3cAYO+5SLQwoOXQr7lItgChaACg6FCoF9Fc0G93z5egVJBg57fc344s0BseP3eOMD94R9FfdTlvdk9yr3QoD3UvtT+1OA+2T7MPs8lvtS91Mf+wb3+hX3MJH3IvcA9wCR+yL7MPsphfsj+wD7AIX3I/cpHg57oHb4qMdP90QS927fE9DO+KgV9yv8qN8GE7D5WE8HE9CHJzmAMoYIDnuL2fjC0wG34/dr4wP4StkV+8QGlbqntLKs7+IY2s+4xPcAGslx9xP7OPslUzD7Gh7jBrOO9wX3AdemSU49ZmBSWh5RWgU8R0Ex+xga+CAGDnt9zfetzYV296LNErLjPuO19xah40jjE9aA90j34RW4BuOzVzj7DE5xVx8TuoA6a9bMHzOCBmyW+zr3UvcczOX3Fe1YvjubHo0HE7cA1Z2vytIa2mn0+yj7F1I4+w0e4wa/lOHoz6NWSh4T1wBEalVAHhPWgF8GDnugdvc/0/hldwH3st8D97D4zhWN+9v7SAY/khU895T7P9/3P9vTO/hlNwcOe33N9+zN9y7ZAbPj93TjA8X33xXXhwWcsr/I5Kg5PUN7+wQnLX3osB4zBlKl+x/3PPcoxfcD9xj3KUPfIVtceWhuHomNp/dhBfeN2fvQBg57fc333NP3Us0SruP3buND4xP0E/j4QfiuFax99x37Ofthgft0+zb7J5n7UfdYHhP09xjP9Pcd9xlN5vsPPWBWcX0ficMGsJL3RPcKHhP4x6xeUB/7ZPvWFdWd5ekeE/TpnTFBQXMxMx8T+DNz5dUfDnugdvj82QGx+CgDsfj8FffYBkYxUidhI18ibvsCfiAI7QaY9yWy9xC49wG39cPhsr4I1PwoBw57fc33uM33fM0SsONJ4/dO40njE/Kw91cVLrf7CPcz9zO39wjo6mPGNqceE+zSqKu51xr3BkbN+wT7BEZJ+wY/q13Sbh4T8jZvY1AsGhPs91/4UxXLqFpISW5ZS0pvvc3Op7zMHxPy+wf8UBXerMrd3axMODhqTDk5asreHg57fc33UtP33M0SruND4/du4xP0E+y+9zAVapn7Hfc592GV93T3NvcmffdS+1geE/T7GEci+x37Gckw9w/ZtsClmR+NUwZnhPtF+woeE+xParnFH/dk99YVQHkyLR4T9C155NbWo+TjHxPs46MyQB8O+5SL9fe6YAr4JBWACvyOBIAKDleL6/i+0xKu37nnNdnT4xP09wv4jBW8k+zszKtXUF6EcHRtHhPsdG1UVHRgCHhni1xjGtmeBqmSsaSrHpSWxsyVlwirsp2+vhr2R9z7DPsVUif7Ch4T9PcW/IwV5+svBg73xH3H5sf3zMfuxwGozdrN+GXNA/eE97kV6NL3D+y+qVReP037HC5VY7PDHvew91YViQbIdl+gWhv7IS77JPseMtBO1MaupquqH40GYpCkebMb9wr3IPcB90H3SPsv9xX7bHsKfAr3LvcIyPcCyx9MBkJVLWX7Dxv7QPsZ9xn3RvdD9xn3HPdA9z/3GiX7K/sDPyAweIGXmZqPmJCcH9/3rgVTBg5BChKD+JgT2CgKE+g4Cg6ioAoSxeP3cudG5xP09yb36BX0BtjKZSlGa0wuH/sMBjNDFfdWBvcp3cb3JeNkzjOgH40HE/jMnrLMzBr3HzG3Lh77bwbjQxXuBuGwYEH7AjeCZh8mBg6iTwoSu+f3lec15xPwE+j4J/eJFWQKE/DmpUY6jR/nBvcgh07d+yZnCvtIpvtT918fE+j3MMD3EPcbkx8Ox4vT+M7TAc7j95nnA/cv+RYV5wZ3Ci8GM0MVZQoGDlEKNAoOV6B29+J1ClUK9+I6Cg60fZ8K94XT97HTErvn95XnSc0TuhO8+H34mBWwiob3Q/thZwr7VKz7R/dOHxO62cS9yJ4fjQYTeirN+Af7cUP3IQcTuiyC+yb7Di0KHhO84qdKQI8fDrSgdvfs2fe4dwHF4/eJ4wP4c/leFTP7uPuJ97gz/V7j9+z3ifvs4wYOVApTCg5FfdP5JHcBod/3QuMD+AT5XhUz/I4GKX9XO1B0s8UevzdQBzW7PvcL9yer5/cTHg6PVApVCveHBtXw91X77AXtBvt++DT3bPe+BSkG+4v77gWJ9+4zBg6QCsUW+A7Z+7b5EDMGDvdkoHb5BOUBx+P4LOMDxxbj+QSNBvcy/QQF4wb3MvkEBY39BOP5XvsoBvsj/MqNCvsj+MoF+ygGDseL9woqiAoSxeP3nOMTXMUW4wYTbHYKE5yGCg7HTwoBcQoDIAoOfKB298LT96DTjgr3wnIK+0oG40N0CsdPCgFxCgP4bWAVvL9DzQW605b28hr3SGr3U/tZNQq+tJiiqh5RwBWAenWFcRstCvcOm/sa+zkwhjp1VR9Jx1pVBQ6ioHb30tP3kNMSxeP3eOc15xP0xRbj99L3CwYT+LjBhSmSH5H7A41oklaafBn1BnaYfp+H2oX3DhiHyGi+TZIIjQcT9N6fpt3ZGvcFRM37BB77ewbjQxX0Bt26X0X7HiyLVx80Bg6PTwqSChPUE9hmChPUeQoT5GIKE9R6ChPY36ZXQB8OaqB2+RDZpAr3p/kQFfdI2fxTPfdH/RDjBg5uCioKDmmL8DthChKJ+GYTcPdAFvcEBvdI+V5vChOw+yD8+Y0K+yD4+W8KDvd2i/cW+wGIChKT+VYTWPcqFvYGE2jy+NYFjQbt/NYF9gb3J54KMwYTmPsB/NyNCib43AUhBib83I0K+wH43AUzBg58VAoBjfhxA/dU9/8V+1L7/wXnBvcl97L3IvuyBe0G+1L3//dG9/NvCvsX+5/7FvefBSkGDmlUCqQKPgoOaovZ+MLZTAoOQAppCvdD3xO2JwoTujAKE3YiChO6KwoOhAqlChO89xr3oBXznfXl2Z85+xT7DnczPTF57/cCHhN8PPugFdsGE7zNjQdjlrpjxRv3EL73F/cr9wR59z77JVVYbl14H4wKRX3N9+p29wPNAavj91LfA/ge+AkVyXL3B/smOQr3GrX3B+AeYwoOhAqu4/dd3xO89w/3oBX3FJ/d2eWdISP7DnwzLj133fcUHvex+FIVN/uDiQa5eFioWxv7K3n7PvsE+z27+wX3E8W6s7OWH40GE3xJ2wcOV00KJAoO+4GjCvcG0wHb3wM9Cg5q+0zN9wrT+CrFUdMSruNC3/dS3xPa93H4chXlnSEj+wJ5NTA3fvcB4vcUn93ZHxPq90/FFTsGE9pHiQe1gFyzURv7HGT7HfslRJX7WfcwwL2muJ0fjUUGZo84+wAeE9ZfZZ68hx83BvsamfcVi6wb9wDVxfc0Hw5qoHb4cqYKAcLf903fA0QK+x5bUGxfdR6MClwK8etGCt0E3+uXCvtM01t2+WF38esSx98TuPck+KwVN/zCBlmLY1eBgI2MgR4TeEMHE7iKmJiJmBvmsLfjH/mSBDcr3wYOV1wK91p3AcLfA/ec9+IV9zf3XgUpBvtQ+4sFifg9N/1e3/dJBtDf9yn7nQXtBg6gdvleoQr5XpcK93aHChLK3/dA3/dA3xQcE7zKFt/4BgbfyKOy0F4K+AYH38ijstBaCvshVFtlXHMeyHpmo00bV1NvWnUfiQYT3Mo7Bw5qhwpSChO4SgoT2Mo7Bw5XWAolCg6CCqUKE9xCClFcY2OAH4kGE+zNOwcOggqu4/dd3xPc9933oBUjeSExPXfd9x73Cp/d2eiaM/sOHob8UBXfBhPs+Vw7BxPcSYkHs4Bcs1Eb+xNb+wX7M/smr/sm9x+7uKi5nh+NBg77XKB2+GbffXendxLC3xPIwhbf9+cG5M+xtaaViIqTHhOY3QcTyI+Df416G09rYFhzH4kGE6jbNwcOMlgKjwoT1BPYWQoT5EkKE9h4Cg77gYXT+CjNAdvfA9v4rBU9Sdn8BgZFoGfirqGPjZYe0AeKgoGJeRtfgJy2H/fs6M0u9zA3Bw5XClIKE7gmChN4TNsHDjGL9TZ2+Kx3EpX4FhNw9y8W6wb3JfisbwoTsCf8Qo0KJ/hCbwoO9yyL7T52+Erti3cSlfkIE1j3GxbtBhNo5fhKBY0G6fxKBecG9xP4rAUzBhOYOPxKjQoy+EoFKAYw/EqNCjX4SgUzBg4xXAoBkfgeA/ct96sV+yf7qwXnBvL3aPb7aAXnBvsl96v3IPeVbwop+1Mq91NvCg6JCgGV+BYvCg4gi9P4HNNLCg77lJsKE2AToOL4YJQKDmqjCt3rRQr4rDcGE+zdBN/rlwpqowr3BstFCgYT7PleNwcOj/eM0wGL+IgD94wE+IjT/IgGDviMi/UB9w3n94Xn94XnFHD3DRaACvfhIRWACvfhIRWACg74sXMK9wSWCrqWChPfwBPAwPnwszcKE5gA/UdVkQoTPAD7wvveNwoTwMD5P/wcFTMKEzwA/T/35hUzChPDAPgK+7A3ClUEMwoO+Iz3jNMBi/p8A/eMBPp80/58Bg77Y/gDtWG794m7EpPNU8f3BccTbPeP+PgVrYvJIS5paz0ex48Glou6xq2ffm10i4BlgB4TdEJ3BVh9dm1bGlWsZMmxrZyomx6NBmmMon+lG5+ZjYyPHxOstQeKiYeJhBt6i5mYHxN0T60VcGhvZ2l/oqWllJSalR6im72Nn58IDvtj+AO794m7AZvN9xHNA/cj+VgVJXI5NDGkOfHzpd3l4nLdIh/7uQRZgMvHxZfKvMCWTFFPf0tXHw77TPfBdvfNu1v3BxL3FM0TsPcU96wVzfhAWgYT0JMKE7Bb6wcO93WLx/eFduPHmQr3Es33d9P3FNMT64DVbBXHBhPngPhGfwoT64D8cosKE/OAkwr5H/0VPAr3dYv3LVXB9yh2xeWZCvcUzfdiwfcEzRN1wPha9y0VcAoTtcAozQcTc8CiCvxngwoTdcD8g4sKE3nAkwoO93WL9y1VwfcMwZblucH3EsGcdxKfnAr3DsH3BM0TbEz4cPctFRN8THAKE6xMKM0HE3pMogr8SYMK/F/7jxUTbVxIChNs7FAKE2xMcwYO+0z3rMf3yMcBn9P3FNMD9673rDwK8/dwzX4K93AVbQoO+0z3pcH3J8H3EsESm5wKE+T3CPhuFRP1SAoT7lAKE+RzBg59mflemftUmfckmQb3pZLikvzCkwd6nPlenPtqlwj3pZLvkvzplwnNCt8Lx5GRkacMDMejj48MDfdgFPiEFcsTAIgCAAEAKwBYAIYAqwC1ALoAzQDnAQABJQEvAUUBWwFiAXQBpwG6AcYB0QHnAewB9gIFAhgCJQIzAkECSQKAAp4CuwLBAswC2AMPAxUDIwM2Az0DRwNrA44DmwO9A94D5wPvA/UEFAQcBCMEKAQsBDIEOgQ/BEUEXgRnBG0EcwSIBJAEmASfBKQEugTQBNoE7wUEBQgFDgUTBRkFHwUlBSwFMwU3BUkFTwVgBW8FfgWDBZEFoQWxBcAFzwXYBeEF6AXvBfUF+gX/BggGEgYcBiUGMgY6BkIGSgZWBmIGZwZrBnYGgQaKBpUGoAanBq4Gswa4BrsGxQbPBtkG4wbtBvEG9Qb5BwIHBgcPBxUHGwchByYHKveq+WwVNQr3Waz3U/dI90hq91P7WR9DBPcOm/sa+zn7OXv7GvsOLQofC6j3oBU2CvcrZfcX+y/7LmT7F/srHvdT+2wVNXrv9wj3CJ3v4OWcJ/sIWwofC0aPs4urG6Chj4yRH8cHiIeGiYAbcYugoR/3vwfDi+37N/sUV1X7Dh73l/twFQv3FEcK49VoCgfjSRWtB2sK+zg5CvcmrfcZxB43BmOANzskagoLAbDj91bjAyMKC1YKIQoLLAr8EAdMiyD3Ib/Dp7yhHo0GC/cS+AoVkAeei+Hnw6luWV6Lek54HvsFaQULgxbnBsD3WAX3eAa++1gF5wb7VJ4K+woGC733aBX7J8089yP3INHk9x0e+Ioz/IoHJ29VLTRpvPQe+IozBwsBveP3h+MDKQoLVFZcVFJ4scG6maCmnB6xotWSqqwIC/gs+KwVN/wGBj1ObV4/iM60HvgGNwv7DjIK9w4Lt3MGY4J3aHoeXAfhopHP1xoLA/c8gBV7XAVugXp0ZBt2e4yNfx9JB4qZmYmsG/ChzdWfH/cv+NBvCi38Qo0KIfhCbwoLRnZrV0AaK7lP772/qLumHo0GC8UW+BHZ+7n3lDoKC3v3Gvc59zmb9xoL9wuX5+/vf+f7C/sLfy8nJ5cv9wsfC5UKMQoLOwr7SKz7U/dZC/srsfsX9y/3LrL3F/crCxVTiMPd3Y7Dw8OOUzk5iFNTHwvDJhWNBub77QX7VAYL+zlx+y/7GvtMwjD3Fwv3ndn7nfd0963Z/AUGC/tZavtT+0gLFcf7SAeSn5mhpaDJvRi/tKitzRrXU7E+I2hQPh7TBqSQvsS7nXJoXHNxZW0eZm0FWGFaVjsaDtsW3/hq580vygawnZmvHrLTTgY6aGE6H0w9SdkHC/dP96wV+6zj96wH91H4Rm8K+yH74vsc9+IFKgYLLgriLwcLnQpRx/fpdvcCzQuPoHb3WNP37fCLdwv3GvegFfcOmuPo2Z85+wr7Hnc5PTF59fMePPxQFd/3gY0GXZ64brsb9x+v9z73DvczW/cF+xMLYAoWPwoLwhbf+AYG2cipuNdaCgtL0xLb3/cv3xPcPQr3g/xqFd8LTgr4rDcGC/fYFZ8Hq5X3AAunBsGlbl5SZHtwWXexqh9DhgZ4lij3Gei2wNnHZKlSlB6NBwvMdc18Qxo/TX5wOXnGzB43BlSN+xv3Su/UwvcF9UmiSqEeC0QK+yFXU29adR6JBgsB96LnA7L4ZBX3ewb7h/wiBUn34dP7ggf3hPgeBdH71wcLAaLn93nnA6IW+DXZ+9kG99X4vwXc/B8998MH+9X8xgULfc33Ys33NM0LAcffA8cW3wt90/jq0wvClqixthq7dcokKGZZQh7TBqKRucOwnXBtZHNtWx4LaovZ95R1CgsSwt/3Td8LVQqBCgugYQoLlQrFFuMLAajj92bjAwtqfWwKC33N+ETNC/gF+A8VyoqF9wD7MBsuPVsn+wPOeMx1HwteCvgQB8qL9gv7CHknMgugdvisdwv7JPeJ2QHB94gDwfeJFfeI2fuIBg6OSGIe/AbfC2r7L3b3NtML9QHV5wPVC3b5XncL+xWG4dsfMwb7LLw19zvw9w269zkeCzcGUXs/QyaK9yDR91jApb/LoFBXHgs0iHwnIBstCh8L91wG91i490X3SPdZb/c0+3If+1ML+FX4pRX3F4lNz/scG/tJb/sXSR8LGzsKC55ETx5uC6cKQN8Li/cQ3R4L9wd89yMLnwr4cncL+I7N/I4GC6J90/kkdwsFLwYL9wL3TQWN+00G+zqRFU/3OgcLu+f3qOcL9wEG9w3g1fcZ92H7M4tNHwt9wfeowV3B96jBErmWCgsV7gbisFg9LFVfSx8iBg7Z93TZC/jWjQf3efzWBfcNgQoL9zSU+yj7HvsUevsw+ywfC0mhSZfKGtbHkqbInWZHHgv7mvfl9wn7Xho/VVlFHgv3mfvl+wz3XRrXt7PVHgv7Yfs6+zr7YQv7Yfc6+zr3YQuSdvl6dwELAbr4jgO6C/mIBU8GC+f1LwYL+V4zBgtfCvg4xVHTEgv8XxXHBvhGfwoLan2fCvg4pgoSC/tufQqB974DC/zoiQf7gPjoBfsGBgugdvhyxVHTC3b41vcci3cLMftEzfkadwsGpPdfBUkGcvtfBQv7GBXr+83N+EBaBguJ94OXCgWJBgsBxeP3c+cDxRbjCxKk30Hf9zrfRN8LV4vZ+RB3lQoLFdEG98r5ZgVFBgsSquM85/d540PnC0+JVYRSGwsVzfeSSQYLAcXjAwvT9wrTCzcGDhLe5zfXE+AT0Av3Obtb9wecdxIL+5P7N3b6FncBC/hg95KLdxLizQvTStOg35fTT9MLV33NC/leBQvTUcULi9P3oM33gNMLd04KC+66wVz3p0MHC6B2+GrNCwH3T+MDC8Lf913jC9P3OHcLEqjjCwAAAQAAAAgAAAAEAA4AAmlkZW9yb21uAAFsYXRuAAgABgAAAAAAAQACAAgADAAB/1YAAQAAAAEAAAAKAB4ALAABbGF0bgAIAAQAAAAA//8AAQAAAAFrZXJuAAgAAAABAAAAAQAEAAIAAAACAAoAKgABABAABAAAAAMAGgAaABoAAQADAAoADAAYAAEAAf/bAAIFjAAEAAAFyAZoABoAGwAAAAoACgAKAAoACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAK/8n/7P/s/8kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/7P/sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+z/yv/o/+7/7P/s/5H/kQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/2AAAAAAAAAAD/7AAAAAAAAP/sAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/6L/tv+2/6QAAP/bAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+7/2//uAAD/7gAA/3//fwAAAAAAAAAAAAAAAAAAAAAAAAAAABIAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAAAAAAA/7b/tgAAAAD/2wAAAAAAAAAAAAAAAAAAAAAAAAAA/+4AAAAU/+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/tgAAAAAAAAAAAAAAAP/J/7b/yf+2/+7/tv+2/6T/pP+2AAD/yQAA/7YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8n/yQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+7/2//uAAD/7gAA/6T/pP/uAAD/7gAA/+4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9v/2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+7/7v/uAAD/7gAA/7b/tgAAAAD/7gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAA/8n/yQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/7X/yf+1/+L/tQAA/5H/kf/EAAD/tgAA/9sAAAAAAAAAAAAAAAAAAAAA/9v/2//b/9sAAAAAAAD/2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABABwAAQAbAB4AIAAlACYAKQAqACwALgAwADEAMwA1ADcAOAA6ADsAQABCAEMARgBHAEoASwBNAFAAUQACABoAAQABABkAGwAbAAEAHgAeAAQAIAAgAAYAJQAlAAgAJgAmAAoAKQApAA0AKgAqAA4ALAAsABAALgAuABIAMAAwABQAMQAxABYAMwAzABgANwA3AAIAOAA4AAMAOgA6AAUAOwA7AAcAQABAAAkAQgBCAAsAQwBDAAwARgBGAA8ARwBHABEASgBKABMASwBLABUATQBNABcAUABRAAUAAQAKAEQAEwAXABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAABwAYAAgACQAWAAoAAAANAAAAAAAAAA8AAAABAAAAEAAAAAAACwAAAAAAEQACAAAAEgAaAAMAFQAEAAUAAAAMAAEAAAAKADQAggABbGF0bgAIAAoAAVRVUiAAGgAA//8ABQAAAAEAAgAEAAUAAP//AAEAAwAGYWFsdAAmZnJhYwAubGlnYQA0bGlnYQA8b3JkbgBCc3VwcwBIAAAAAgAAAAEAAAABAAIAAAACAAMABAAAAAEABAAAAAEABQAAAAEABgAKABYASABmAPQBDgEuAbwB6gI4AloAAQAAAAEACAACABYACABTAFgAXABeAFYAVwBWAFcAAQAIAAwADwAQABEAGwApADUAQwADAAAAAQAIAAEAEAABAAgAAwBSAFUAXQABAAEACwAGAAAABQAQACYAOgBOAGgAAwAAAAQB0gByAdIB0gAAAAEAAAAHAAMAAAADAbwAXAG8AAAAAQAAAAgAAwAAAAMArgBIAE4AAAABAAAABwADAAAAAwCaADQAFAAAAAEAAAAHAAEAAQAQAAMAAAADABQAGgAgAAAAAQAAAAcAAQABABEAAQABAA0AAQABABIABAAAAAEACAABACwAAQAIAAEABABQAAIAPQAEAAAAAQAIAAEAEgABAAgAAQAEAFEAAgBAAAEAAQA6AAYAAAAFABAAJgA4AEoAZAADAAIAEAAQAAEATgAAAAAAAQABAA8AAwABAFIAAQA4AAAAAQAAAAkAAwABAEAAAQBQAAAAAQAAAAkAAwACAC4AOAABABQAAAABAAAACQABAAEANQADAAIAFAAeAAEAJAAAAAEAAAAJAAIAAQAOABcAAAABAAEADAABAAEAQwABAAAAAQAIAAIAFAAHAFgAXABeAFYAVwBWAFcAAQAHAA8AEAARABsAKQA1AEMABAAAAAEACAABADwAAwAMABoAMAABAAQAVAAEAA0ADgAOAAIABgAOAFkAAwANABAAWgADAA0AEgABAAQAWwADAA0AEgABAAMADgAPABEABAAAAAEACAABAAgAAQAOAAEAAQAOAAEABAAFAAMADQAOAAEAAAABAAgAAgAKAAIAVgBXAAEAAgA1AEMAAAH0AAAA8AAAAQIAUwHgABcB4AAVAvcALgIsABkA8QArAPEABAJYAC8A8ABKAWAANgDwAEoBFv/2AeAAJgHgAEMB4AAqAeAAJwHgAB4B4AAoAeAAIwHgACYB4AAlAeAAIwDwAEoBvAAjAyAAHQH0//gCBwA6AgcAMAIsAEMBzwA6AbwAOgIZADACGQA6AMwAOgGqABYB9AA6AbwAOgLAADwCLAA6AiwAMAHhADoCLAAwAgcAOgH0AB8BzwAIAgcAMgHO//4C0gAIAeEAAgHO//4BzwAXAbwAHQHPADcBqgAgAc8AIwG8ACUBAwACAc8AIwHPADcAzAA8AMz/6QG8ADcAzAA8AtIAPwHPADcBvAAdAc8ANwHPACMBKAA3AZcAGQEDAAIBzwA3AZYACgKIAAoBlgAGAZYACgGFABsA8ABXAc8AAgHPAAIB9AAAA+gAeQQNAC4D6AAAASEACAEhABABOAAgAtEAHgLRACAC0QAUATgAFAJYAC8BOAAQ') format('opentype'); font-display: swap; }";
if(!document.head.querySelector('style[data-gyg-fonts]')){_fs.setAttribute("data-gyg-fonts","1");document.head.appendChild(_fs);}
const FC="'HelveticaNeueLTStd','HelveticaNeue-CondensedBold','Helvetica Neue','Arial Narrow',sans-serif";
const FB="'HelveticaNeueLTStd','Helvetica Neue',Helvetica,Arial,sans-serif";
const FG="'GuzmanBoldCaps','HelveticaNeue107','HelveticaNeueLTStd','Impact',sans-serif";
const F107="'HelveticaNeue107','HelveticaNeueLTStd','Impact',sans-serif";

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────
const animStyle=document.createElement("style");
animStyle.textContent=`
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.anim-fade-up{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both}
.anim-fade-in{animation:fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) both}
.anim-scale-in{animation:scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both}
.anim-slide-up{animation:slideUp 0.7s cubic-bezier(0.16,1,0.3,1) both}
.anim-d1{animation-delay:0.08s}.anim-d2{animation-delay:0.18s}.anim-d3{animation-delay:0.3s}.anim-d4{animation-delay:0.42s}.anim-d5{animation-delay:0.55s}
.view-enter{animation:fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) both}
.splash-logo{animation:scaleIn 0.8s cubic-bezier(0.16,1,0.3,1) both}
.splash-title{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both}
.splash-sub{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both}
.splash-btn1{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.45s both}
.splash-btn2{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.55s both}
.splash-footer{animation:fadeIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both}
.loading-logo{animation:scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both}
.loading-text{animation:fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both}
.loading-bar{height:2px;width:120px;border-radius:2px;margin-top:12px;background:linear-gradient(90deg,transparent,#FFD300,transparent);background-size:200% 100%;animation:shimmer 1.5s infinite linear,fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both}
.btn-hover{transition:transform 0.2s cubic-bezier(0.16,1,0.3,1),box-shadow 0.2s ease}
.btn-hover:active{transform:scale(0.97)!important}
.card-anim{transition:transform 0.25s cubic-bezier(0.16,1,0.3,1),box-shadow 0.25s ease}
.card-anim:active{transform:scale(0.98)!important}
textarea::placeholder,input::placeholder{color:#ccc!important;opacity:1}
textarea:focus,input:focus{outline:none;border-color:#FFD300!important;transition:border-color 0.2s}
.huddle-field{transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
`;
document.head.appendChild(animStyle);

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const BY={padding:"16px 32px",background:"#FFD300",color:"#000",border:"none",borderRadius:14,fontSize:17,fontWeight:800,fontFamily:FC,letterSpacing:1.5,cursor:"pointer",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",minWidth:220};
const BO={padding:"16px 32px",background:"transparent",color:"#000",border:"2px solid #000",borderRadius:14,fontSize:17,fontWeight:800,fontFamily:FC,letterSpacing:1.5,cursor:"pointer",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",minWidth:220};
const BA={background:"none",border:"none",fontSize:28,fontWeight:300,color:"#000",cursor:"pointer",padding:"0 8px",lineHeight:1};
const TBar={display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",paddingTop:"max(12px, env(safe-area-inset-top))",borderBottom:"1px solid #e8e8e3",background:"#fff"};
const TT={fontFamily:FC,fontWeight:800,fontSize:17,letterSpacing:1.5,color:"#000"};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null);
  const[view,setView]=useState("splash");
  const[prevView,setPrevView]=useState(null);
  const[users,setUsers]=useState([]);
  const[challenges,setChallenges]=useState(null);
  const[lunchConfig,setLunchConfigState]=useState(null);
  const[comps,setComps]=useState([]);
  const[sel,setSel]=useState(null);
  useEffect(()=>{const scrollTop=()=>{window.scrollTo({top:0,left:0,behavior:"instant"});document.documentElement.scrollTop=0;document.body.scrollTop=0;};scrollTop();requestAnimationFrame(scrollTop);setTimeout(scrollTop,50);setTimeout(scrollTop,200);},[view,sel]);
  // Get challenges/activities for a program based on active quarter
  const getCh=(prog)=>{const q=activityConfig.activeQuarter?.[prog]||"Q1";const all=challenges||DEFAULT_CHALLENGES;if(q==="Q1")return all[prog]||[];const qKey=`${prog}_${q}`;return all[qKey]||DEFAULT_CHALLENGES[qKey]||all[prog]||[];};
  const getActs=(prog)=>{const q=activityConfig.activeQuarter?.[prog]||"Q1";if(q==="Q1")return DEFAULT_ACTIVITIES[prog]||[];const qKey=`${prog}_${q}`;return DEFAULT_ACTIVITIES[qKey]||DEFAULT_ACTIVITIES[prog]||[];};
  const[loading,setLoading]=useState(true);
  const[toast,setToast]=useState(null);
  const flash=useCallback((m,ok=true)=>{setToast({m,ok});setTimeout(()=>setToast(null),3000);},[]);
  const[activityComps,setActivityComps]=useState([]);
  const[batchControl,setBatchControlState]=useState(null);
  const[coolroomImgs,setCoolroomImgs]=useState({});
  const[activityConfig,setActivityConfigState]=useState({});
  const getInitialView=(u,bc,ac)=>{const acts=getActs(u.program);if(!acts||!acts.length)return "dashboard";const bk=(bc||{})[u.batch];if(!bk)return "activities";if(bk.skipActivities)return "dashboard";const userDone=(ac||[]).filter(c=>c.userId===u.id).map(c=>c.activityId);const allDone=acts.every(a=>userDone.includes(a.id));if(!allDone)return "activities";if(!bk.challengesUnlocked)return "waiting";return "dashboard";};

  useEffect(()=>{(async()=>{let s=getSession();const ch2=await getChallenges();if(ch2){
      // One-time migration: add type fields and update to latest challenge definitions (version 6)
      if(!ch2._v||ch2._v<6){
        ch2.lse=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES.lse));
        ch2.essentials=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES.essentials));
        ch2.nextgen=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES.nextgen));
        ch2.elite=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES.elite));
        ch2._v=6;
        try{await dbSetChallenges(ch2);}catch(e){}
      }
      // Seed Q2/Q3/Q4 challenges if not present
      let needsSave=false;["essentials","nextgen","elite"].forEach(prog=>{["Q2","Q3"].forEach(q=>{const key=`${prog}_${q}`;if(!ch2[key]&&DEFAULT_CHALLENGES[key]){ch2[key]=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES[key]));needsSave=true;}});});
      if(needsSave){try{await dbSetChallenges(ch2);}catch(e){}}
      setChallenges(ch2);
    }else setChallenges(JSON.parse(JSON.stringify(DEFAULT_CHALLENGES)));const lc=await getLunchConfig();if(lc)setLunchConfigState(lc);let ac=[];let bc=await getBatchControl();if(bc)setBatchControlState(bc);
    // Seed test users if not exist
    if(!await getUserByUsername("test2")){const t2={id:"test-user-2",name:"Test Two",email:"test2@gyg.com",username:"test2",password:"test2",position:"Shift Leader",program:"essentials",restaurant:"Sydney CBD",batch:"GYG-LE-WK13-26",lunchType:"burrito",lunchFilling:"grilled_chicken",createdAt:new Date().toISOString()};await addUser(t2);}
    if(!await getUserByUsername("test")){const tu={id:"test-user-1",name:"Test User",email:"test@gyg.com",username:"test",password:"test",position:"Shift Leader",program:"essentials",restaurant:"Sydney CBD",batch:"GYG-LE-WK13-26",lunchType:"burrito",lunchFilling:"grilled_chicken",createdAt:new Date().toISOString()};await addUser(tu);
      const tac={id:"ac-test-1",userId:"test-user-1",activityId:"le-act-1",program:"essentials",batch:"GYG-LE-WK13-26",data:{type:"huddle_builder",focus:"sales",subFocus:"combos",script:["Team, combo sales dropped 12% last week - that is money we are leaving on the table.","When I watched our best performer yesterday, she asked every single guest one question.","Instead of waiting for the guest to order, try this -","Right after they pick their main, say: Want to make it a combo? You get chips and a drink for just $4 more.","The difference is timing - ask BEFORE they finish, not after.","Make it a combo - it is the easiest yes in the restaurant.","Let us smash it today. First person to land 10 combos, let me know - I want to hear about it."],assembledScript:"",crewLine:"Make it a combo - it is the easiest yes in the restaurant.",partnerName:"Sarah",partnerFeedback:{buyIn:"yes",repeatable:"yes",voiceMatch:"yes",buyInNote:"",repeatableNote:"",voiceMatchNote:""},allYes:true},completedAt:new Date().toISOString()};try{await addActivityCompletion(tac);}catch(e){}ac=[...ac,tac];setActivityComps(ac);
      if(!bc){bc={"GYG-LE-WK13-26":{activities:{"le-act-1":"completed"},completedActivities:["le-act-1"],challengesUnlocked:true}};try{await dbSetBatchControl(bc);}catch(e){}setBatchControlState(bc);}
    }
    // Seed nextgen test user
    if(!await getUserByUsername("test3")){const t3={id:"test-user-3",name:"Test NGL",email:"test3@gyg.com",username:"test3",password:"test3",position:"Assistant Restaurant Manager",program:"nextgen",restaurant:"Sydney CBD",batch:"GYG-NGL-WK13-26",lunchType:"burrito",lunchFilling:"grilled_chicken",createdAt:new Date().toISOString()};await addUser(t3);}
    // Seed NGL batch control if not set
    if(bc&&!bc["GYG-NGL-WK13-26"]){bc={...bc,"GYG-NGL-WK13-26":{activeActivity:"ng-act-1",completedActivities:[],challengesUnlocked:false}};try{await dbSetBatchControl(bc);}catch(e){}setBatchControlState(bc);}
    if(!bc){bc=bc||{};bc["GYG-NGL-WK13-26"]={activeActivity:"ng-act-1",completedActivities:[],challengesUnlocked:false};}
    // Seed LSE test user
    if(!await getUserByUsername("test4")){const t4={id:"test-user-4",name:"Test LSE",email:"test4@gyg.com",username:"test4",password:"test4",position:"Crew Member",program:"lse",restaurant:"Sydney CBD",batch:"GYG-LSE-WK13-26",lunchType:"burrito",lunchFilling:"grilled_chicken",createdAt:new Date().toISOString()};await addUser(t4);}
    // Seed LSE batch control if not set
    if(bc&&!bc["GYG-LSE-WK13-26"]){bc={...bc,"GYG-LSE-WK13-26":{activeActivity:"lse-act-1",completedActivities:[],challengesUnlocked:false}};try{await dbSetBatchControl(bc);}catch(e){}setBatchControlState(bc);}
    if(!bc["GYG-LSE-WK13-26"]){bc["GYG-LSE-WK13-26"]={activeActivity:"lse-act-1",completedActivities:[],challengesUnlocked:false};}
    // If activityComps empty but test user exists, use local seed data
    if(ac.length===0&&await getUserById("test-user-1")){const tac={id:"ac-test-1",userId:"test-user-1",activityId:"le-act-1",program:"essentials",batch:"GYG-LE-WK13-26",data:{type:"huddle_builder",focus:"sales",subFocus:"combos",script:["Team, combo sales dropped 12% last week - that is money we are leaving on the table.","When I watched our best performer yesterday, she asked every single guest one question.","Instead of waiting for the guest to order, try this -","Right after they pick their main, say: Want to make it a combo? You get chips and a drink for just $4 more.","The difference is timing - ask BEFORE they finish, not after.","Make it a combo - it is the easiest yes in the restaurant.","Let us smash it today. First person to land 10 combos, let me know - I want to hear about it."],assembledScript:"",crewLine:"Make it a combo - it is the easiest yes in the restaurant.",partnerName:"Sarah",partnerFeedback:{buyIn:"yes",repeatable:"yes",voiceMatch:"yes"},allYes:true},completedAt:new Date().toISOString()};ac=[tac];setActivityComps(ac);}
    if(!bc&&await getUserById("test-user-1")){bc={"GYG-LE-WK13-26":{activities:{"le-act-1":"completed"},completedActivities:["le-act-1"],challengesUnlocked:true}};setBatchControlState(bc);}
    // Load activity config
    const acfg=await getActivityConfig();if(acfg){
      // Clean up any blob URLs that don't persist across sessions
      if(acfg.hazard_hunt?.image&&acfg.hazard_hunt.image.startsWith("blob:"))delete acfg.hazard_hunt.image;
      setActivityConfigState(acfg);
    }
    // Load coolroom images for all known batches
    const batches=s&&s.id&&f?[f.batch].filter(Boolean):[];
    const crImgs={};
    for(const batch of batches){try{const imgs=await getCoolroomImages(batch);if(imgs)crImgs[batch]=imgs;}catch(e){}}
    setCoolroomImgs(crImgs);
    if(s&&s.id){const f=await getUserById(s.id);if(f){setUser(f);const uc=await getCompletionsByUser(f.id);setComps(uc);const uac=await getActivityCompletionsByUser(f.id);setActivityComps(uac);setView(getInitialView(f,bc,uac));}else{setSession(null);}}setLoading(false);})();},[]);

  // User list updates are handled per-operation via db.js
  // Completion updates are handled per-operation via db.js

  const reg=async d=>{
    d.username=d.username.toLowerCase();d.email=d.email.toLowerCase();
    const dup=await checkUsernameEmail(d.username,d.email);if(dup.usernameTaken||dup.emailTaken){flash("Email or username already taken",false);return;}
    const now=new Date().toISOString();
    const batch=generateBatch(d.program,now,d.state);
    const currentQ=activityConfig.activeQuarter?.[d.program]||"Q1";
    const{hash,salt}=await hashPassword(d.password);const nu={id:`u${Date.now()}`,...d,password:hash,passwordSalt:salt,batch,lastQuarter:currentQ,createdAt:now};
    await addUser(nu);setUsers([...users,nu]);
    // Tag batch with quarter if not already tagged
    const bc=batchControl||{};if(!bc[batch]||!bc[batch].quarter){const updated={...bc,[batch]:{...(bc[batch]||{activeActivity:null,completedActivities:[],challengesUnlocked:false}),quarter:currentQ}};setBatchControlState(updated);try{await dbSetBatchControl(updated);}catch(e){}}
    setUser(nu);setSession({id:nu.id});setView(getInitialView(nu,batchControl,activityComps));flash("Welcome to Challenge Hub!");
  };
  const login=async(un,pw)=>{
    const unl=un.toLowerCase();
    if(unl==="gyg-admin"&&pw==="devdays2026"){setUser({id:"admin",name:"Admin",isAdmin:true});setView("admin");return;}
    if(unl==="test-all"&&pw==="test"){setUser({id:"test-all",name:"Test All",program:"lse",batch:"TEST",position:"Tester",restaurant:"Test"});setView("testbed");return;}
    const f=await getUserByUsername(unl);
    if(!f){flash("Invalid credentials",false);return;}
    if(f.passwordSalt){const ok=await verifyPassword(pw,f.password,f.passwordSalt);if(!ok){flash("Invalid credentials",false);return;}}
    else{if(f.password!==pw){flash("Invalid credentials",false);return;}const{hash,salt}=await hashPassword(pw);await updateUser(f.id,{password:hash,passwordSalt:salt});f.password=hash;f.passwordSalt=salt;}
    const uc=await getCompletionsByUser(f.id);setComps(uc);
    const uac=await getActivityCompletionsByUser(f.id);setActivityComps(uac);
    // Check if quarter changed since last login - re-trigger lunch order
    const currentQ=activityConfig.activeQuarter?.[f.program]||"Q1";
    if(f.lastQuarter!==currentQ&&lunchConfig?.[f.program]?.enabled!==false){
      setUser(f);setSession({id:f.id});setView("reorder_lunch");flash(`Welcome back, ${f.name.split(" ")[0]}! New quarter - please update your lunch order.`);return;
    }
    setUser(f);setSession({id:f.id});setView(getInitialView(f,batchControl,activityComps));flash(`Hola, ${f.name.split(" ")[0]}!`);
  };
  const logout=async()=>{setUser(null);setSession(null);setView("splash");};
  const resetPassword=async(username,email,newPw)=>{
    const u=await getUserByUsernameAndEmail(username,email);
    if(!u){flash("No account found with those details",false);return false;}
    const{hash,salt}=await hashPassword(newPw);
    await updateUser(u.id,{password:hash,passwordSalt:salt});
    flash("Password updated - please sign in",true);
    setView("login");
    return true;
  };
  const isTestAll=user?.id==="test-all";
  const isDone=(cid)=>!isTestAll&&comps.some(c=>c.userId===user?.id&&c.challengeId===cid);
  const submit=async(cid,s)=>{
    if(!user){flash("Not logged in",false);return;}
    if(!isTestAll&&comps.find(c=>c.userId===user.id&&c.challengeId===cid)){flash("Already submitted!",false);return;}
    const ch=(getCh(user.program)||[]).find(c=>c.id===cid);
    const nc={id:`c${Date.now()}`,userId:user.id,challengeId:cid,program:user.program,batch:user.batch,submission:s,claimedBonus:s.claimedBonus||false,points:s.points!==undefined?s.points:ch.points,bonusClaimed:!!s.claimedBonus,bonusApproved:!!s.autoBonus,bonusPoints:ch.bonusPoints,submittedAt:new Date().toISOString()};
    const docSize=JSON.stringify(nc).length;if(docSize>900000){flash("Submission too large - try smaller photos",false);return;}if(!isTestAll)await addCompletion(nc);setComps([...comps,nc]);flash(`+${nc.points} PTS!${nc.bonusClaimed?(nc.bonusApproved?" +"+nc.bonusPoints+" BONUS!":" Bonus pending review."):""}`,true);setView(prevView||"dashboard");setPrevView(null);
  };
  const pts=(uid,p)=>uid?comps.filter(c=>c.userId===uid&&c.program===p).reduce((s,c)=>s+c.points+(c.bonusApproved?c.bonusPoints||0:0),0):0;
  const completeActivity=async(actId,data)=>{
    // Prevent duplicate completions (unless test user)
    if(!isTestAll&&activityComps.some(c=>c.userId===user.id&&c.activityId===actId)){setView(prevView||"activities");setPrevView(null);flash("Activity already completed!");return;}
    const nc={id:`ac${Date.now()}`,userId:user.id,activityId:actId,program:user.program,batch:user.batch,data,completedAt:new Date().toISOString()};if(!isTestAll)await addActivityCompletion(nc);const newAc=[...activityComps,nc];setActivityComps(newAc);setView(prevView||"activities");setPrevView(null);flash("Activity completed!");
  };

  const isAdmin=view==="admin";
  useEffect(()=>{if(!isAdmin)return;(async()=>{const[u,c,ac]=await Promise.all([getUsers(),getCompletions(),getActivityCompletions()]);setUsers(u);setComps(c);setActivityComps(ac);const batches=[...new Set(u.map(x=>x.batch).filter(Boolean))];const crImgs={};for(const batch of batches){try{const imgs=await getCoolroomImages(batch);if(imgs)crImgs[batch]=imgs;}catch(e){}}setCoolroomImgs(crImgs);})();},[isAdmin]);

  if(loading) return (<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5f5f0"}}><img src={LOADING_GIF} alt="Loading" style={{width:280,maxWidth:"80vw",objectFit:"contain"}}/><link rel="preload" as="video" href="/splash-bg.mp4"/><video src="/splash-bg.mp4" preload="auto" muted style={{position:"absolute",width:0,height:0,opacity:0}}/></div>);


  return (
    <div style={{width:"100%",maxWidth:isAdmin?1200:420,margin:"0 auto",minHeight:"100vh",background:"#f5f5f0",fontFamily:FB,color:"#1a1a1a",position:"relative",overflowX:"hidden"}}>
      {toast&&<div className="anim-scale-in" style={{position:"fixed",top:"50%",left:0,right:0,display:"flex",justifyContent:"center",transform:"translateY(-50%)",zIndex:9999,pointerEvents:"none"}}><div style={{padding:"16px 28px",borderRadius:14,color:"#fff",fontSize:16,fontWeight:700,fontFamily:FC,letterSpacing:1,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",background:toast.ok?"#007A33":"#E3000B",textAlign:"center",maxWidth:"80vw"}}>{toast.m}</div></div>}
      {view==="splash"&&<SplashV onL={()=>setView("login")} onR={()=>setView("register")}/>}
      {view==="login"&&<LoginV onL={login} onB={()=>setView("splash")} onForgot={()=>setView("forgot_password")}/>}
      {view==="forgot_password"&&<ForgotPasswordV onReset={resetPassword} onB={()=>setView("login")}/>}
      {view==="register"&&<RegV onR={reg} onB={()=>setView("splash")} lunchConfig={lunchConfig} />}
      {view==="reorder_lunch"&&user&&(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
        <div style={TBar}><span style={{width:32}}/><span style={TT}>ORDER LUNCH</span><span style={{width:32}}/></div>
        <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:"100%"}}/></div>
        <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
          <div style={{textAlign:"center",marginBottom:4}}>
            <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:1}}>CHOOSE YOUR LUNCH</div>
            <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:4}}>Welcome back! Select your meal for this session.</div>
          </div>
          <LunchReorder user={user} lunchConfig={lunchConfig} onDone={async(lt,lf)=>{const updated={...user,lunchType:lt,lunchFilling:lf,lastQuarter:activityConfig.activeQuarter?.[user.program]||"Q1"};await updateUser(updated.id,{lunchType:lt,lunchFilling:lf,lastQuarter:activityConfig.activeQuarter?.[user.program]||"Q1"});setUser(updated);setView(getInitialView(updated,batchControl,activityComps));flash("Lunch order updated!");}}/>
        </div>
      </div>)}

      {view==="dashboard"&&user&&user.id&&<DashV u={user} ch={getCh(user.program)||[]} co={comps.filter(c=>c.userId===user.id)} wk={getUserWeek(user.createdAt)} sc={pts(user.id,user.program)} onCh={c=>{setSel(c);setView("challenge");}} onBd={()=>setView("leaderboard")} onPr={()=>setView("profile")} actComps={activityComps.filter(c=>c.userId===user.id)} acts={getActs(user.program)||[]} activeQuarter={activityConfig.activeQuarter?.[user.program]||"Q1"}/>}
      {view==="challenge"&&sel&&user&&(
        sel.type==="hazard_hunt"?<HazardHunt ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig.hazard_hunt}/>:
        sel.type==="shift_in_chaos"?<ShiftInChaos ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} comps={comps} actCfg={activityConfig.shift_in_chaos}/>:
        sel.type==="spot_the_moment"?<SpotTheMoment ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} comps={comps} actCfg={activityConfig}/>:
        sel.type==="thirty_second_sell"?<ThirtySecondSell ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="recovery_race"?<RecoveryRace ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="guest_dollar_trail"?<GuestDollarTrail ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="triage_call"?<TriageCall ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="rm_brief"?<RMBrief ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="numbers_dont_lie"?<NumbersDontLie ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="waste_audit"?<WasteAudit ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user}/>:
        sel.type==="teach_it"?<TeachIt ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user}/>:
        sel.type==="shift_leader_lens"?<ShiftLeaderLens ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="shift_call"?<ShiftCall ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="make_the_call"?<MakeTheCall ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="swap_the_shift"?<SwapTheShift ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="bench_builder"?<BenchBuilder ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="perm_or_pass"?<PermOrPass ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} actCfg={activityConfig}/>:
        sel.type==="your_restaurant"?<YourRestaurant ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user} comps={comps} actCfg={activityConfig}/>:
        <ChV ch={sel} done={isDone(sel.id)} onS={s=>submit(sel.id,s)} onB={()=>{setView(prevView||"dashboard");setPrevView(null);}} user={user}/>
      )}
      {view==="leaderboard"&&user&&<LbV cu={user} onB={()=>setView("dashboard")} onP={()=>setView("profile")} defaultProg={user.program} defaultBatch={user.batch}/>}
      {view==="profile"&&user&&<PrV u={user} co={comps.filter(c=>c.userId===user.id)} sc={pts(user.id,user.program)} onO={logout} onB={()=>setView("dashboard")} onBd={()=>setView("leaderboard")}/>}
      {view==="activities"&&user&&<ActivitiesV u={user} acts={getActs(user.program)||[]} batchControl={batchControl} actComps={activityComps.filter(c=>c.userId===user.id)} onAct={a=>{setSel(a);setView("activity");}} onB={logout}/>}
      {view==="activity"&&sel&&user&&sel.type==="self_assessment"&&<SelfAssessment act={sel} u={user} onComplete={d=>completeActivity(sel.id,d)} onB={()=>{setView(prevView||"activities");setPrevView(null);}} actCfg={activityConfig}/>}
      {view==="activity"&&sel&&user&&sel.type==="huddle_builder"&&<HuddleBuilder act={sel} u={user} onComplete={d=>completeActivity(sel.id,d)} onB={()=>{setView(prevView||"activities");setPrevView(null);}}/>}
      {view==="activity"&&sel&&user&&sel.type==="coolroom_countdown"&&<CoolRoomCountdown act={sel} u={user} onComplete={d=>completeActivity(sel.id,d)} onB={()=>{setView(prevView||"activities");setPrevView(null);}} coolroomImgs={coolroomImgs[user.batch]}/>}
      {view==="activity"&&sel&&user&&sel.type==="roster_reality"&&<RosterReality act={sel} u={user} onComplete={d=>completeActivity(sel.id,d)} onB={()=>{setView(prevView||"activities");setPrevView(null);}}/>}
      {view==="waiting"&&user&&<WaitingV u={user} onB={logout}/>}
      {view==="testbed"&&user&&(<div style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
        <div style={{background:"#000",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><img src={GYG_LOGO} alt="" style={{width:28,height:28}}/><span style={{fontFamily:F107,fontWeight:900,fontSize:16,color:"#fff"}}>TEST MODE</span></div>
          <button onClick={()=>{setUser(null);setView("splash");}} style={{padding:"6px 14px",background:"#333",border:"none",borderRadius:8,color:"#888",fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer"}}>EXIT</button>
        </div>
        <div style={{display:"flex",gap:6,padding:"12px 16px",overflowX:"auto",background:"#fff",borderBottom:"1px solid #e8e8e3"}}>
          {[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=>(<button key={p.id} onClick={()=>setUser(u=>({...u,program:p.id}))} style={{padding:"10px 18px 8px",borderRadius:24,border:"none",background:user.program===p.id?"#FFD300":"#f0f0eb",color:user.program===p.id?"#000":"#888",fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",lineHeight:1}}>{p.short}</button>))}
        </div>
        <div style={{padding:"16px 16px 0"}}>
          {/* Activities */}
          {(getActs(user.program)||[]).length>0&&(<>
            <div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5,color:"#999",marginBottom:10}}>ACTIVITIES</div>
            {(getActs(user.program)||[]).map(act=>(<button key={act.id} onClick={()=>{setSel(act);setPrevView("testbed");setView("activity");}} style={{display:"flex",alignItems:"center",width:"100%",padding:16,background:"#fff",borderRadius:14,marginBottom:8,border:"none",cursor:"pointer",textAlign:"left",fontFamily:FB,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",marginRight:14,flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
              <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{act.title}</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{act.subtitle}</div></div>
              <span style={{fontSize:11,fontFamily:FC,fontWeight:700,padding:"5px 10px 4px",borderRadius:8,lineHeight:1,background:"#FFF8E0",color:"#B8860B"}}>ACTIVITY</span>
            </button>))}
          </>)}
          {/* Challenges */}
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5,color:"#999",marginBottom:10,marginTop:16}}>CHALLENGES</div>
          {(getCh(user.program)||[]).map(ch=>(<button key={ch.id} onClick={()=>{setSel(ch);setPrevView("testbed");setView("challenge");}} style={{display:"flex",alignItems:"center",width:"100%",padding:16,background:"#fff",borderRadius:14,marginBottom:8,border:"none",cursor:"pointer",textAlign:"left",fontFamily:FB,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",marginRight:14,flexShrink:0}}><span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#FFD300"}}>{ch.week}</span></div>
            <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{ch.title}</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{ch.subtitle}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><span style={{fontSize:11,fontFamily:FC,fontWeight:700,padding:"5px 10px 4px",borderRadius:8,lineHeight:1,background:"#f5f5f0",color:"#999"}}>CHALLENGE</span><div style={{fontSize:12,fontFamily:FC,fontWeight:800,color:"#000",marginTop:4}}>UP TO {ch.points} PTS</div></div>
          </button>))}
        </div>
      </div>)}
      {view==="admin"&&<AdminDash us={users} co={comps} ch={challenges} onB={logout} lunchConfig={lunchConfig} onUpdateLunchConfig={async(cfg)=>{setLunchConfigState(cfg);await dbSetLunchConfig(cfg);}} onUpdateComps={async(updated)=>{setComps(updated);for(const c of updated){await addCompletion(c);}}} onUpdateCh={async(updated)=>{setChallenges(updated);await dbSetChallenges(updated);}} onDeleteUser={async(uid)=>{await dbDeleteUser(uid);setUsers(users.filter(u=>u.id!==uid));setComps(comps.filter(c=>c.userId!==uid));}} onChangePass={async(uid,np)=>{const{hash,salt}=await hashPassword(np);await updateUser(uid,{password:hash,passwordSalt:salt});setUsers(users.map(u=>u.id===uid?{...u,password:hash,passwordSalt:salt}:u));}} batchControl={batchControl} activityComps={activityComps} onUpdateBatchControl={async(cfg)=>{setBatchControlState(cfg);await dbSetBatchControl(cfg);}} coolroomImgs={coolroomImgs} onUpdateCoolroomImg={async(batch,key,b64)=>{await setCoolroomImage(batch,key,b64);const existing=coolroomImgs[batch]||{};const updated=b64?{...existing,[key]:b64}:{...existing};if(!b64)delete updated[key];setCoolroomImgs(prev=>({...prev,[batch]:updated}));}} flash={flash} onPreviewActivity={act=>{setSel(act);setPrevView("admin");setView("activity");}} onPreviewChallenge={ch=>{setSel(ch);setPrevView("admin");setView("challenge");}} activityConfig={activityConfig} onUpdateActivityConfig={async(cfg)=>{setActivityConfigState(cfg);try{await dbSetActivityConfig(cfg);flash("Activity config saved!",true);}catch(e){flash("Failed to save config",false);}}}/>}
    </div>
  );
}

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────
function IF({l,v,onChange,p,t="text",ac,nm}){return (<div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>{l}</label><input style={{padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,color:"#1a1a1a",fontSize:15,fontFamily:FB,outline:"none"}} type={t} value={v} onChange={e=>onChange(e.target.value)} placeholder={p} autoComplete={ac||"off"} name={nm||undefined}/></div>);}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function BNav({active,onH,onB,onP}){return (
  <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,zIndex:100}}>
    <div style={{position:"absolute",bottom:44,left:"50%",transform:"translateX(-50%)",zIndex:101}}>
      <button style={{width:120,height:52,background:"#FFD300",borderRadius:16,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 20px rgba(255,211,0,0.5)",fontSize:20,fontFamily:FG,fontWeight:900,letterSpacing:1,color:"#000"}} onClick={onB}>BOARD</button>
    </div>
    <div style={{display:"flex",alignItems:"center",padding:"10px 0 22px",background:"#fff",borderTop:"1px solid #e8e8e3"}}>
      <button style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 0"}} onClick={onH}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active==="home"?"#000":"#999"} strokeWidth="2.5"><path d="M3 12L12 3l9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg><span style={{fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:0.5,color:active==="home"?"#000":"#999"}}>HOME</span></button>
      <div style={{width:120}}/>
      <button style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 0"}} onClick={onP}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active==="profile"?"#000":"#999"} strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg><span style={{fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:0.5,color:active==="profile"?"#000":"#999"}}>MY GYG</span></button>
    </div>
  </div>
);}

// ─── VIDEO BG WRAPPER ────────────────────────────────────────────────────────
function VidBg({children}){return (
  <div style={{position:"relative",minHeight:"100vh",overflow:"hidden",background:"#000"}}>
    <video autoPlay muted loop playsInline style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}><source src="/splash-bg.mp4" type="video/mp4"/></video>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)"}}/>
    <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column"}}>{children}</div>
  </div>
);}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
function SplashV({onL,onR}){return (
  <VidBg>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <img className="splash-logo" src={LD_LOGO} alt="GYG L&D" style={{width:200,height:200,objectFit:"contain",display:"block",margin:"0 auto 24px",filter:"brightness(1.1)"}}/>
      <div className="splash-title" style={{fontSize:56,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:2,lineHeight:0.9,textAlign:"center"}}>CHALLENGE<br/>HUB</div>
      <p className="splash-sub" style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.6,maxWidth:260,textAlign:"center",marginTop:16}}>Post-workshop challenges.<br/>Real results in your restaurant.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320,marginTop:32}}>
        <button className="splash-btn1 btn-hover" style={{...BY,width:"100%"}} onClick={onR}>GET STARTED</button>
        <button className="splash-btn2 btn-hover" style={{...BO,width:"100%",borderColor:"rgba(255,255,255,0.3)",color:"#fff"}} onClick={onL}>SIGN IN</button>
      </div>
      <div className="splash-footer" style={{fontSize:11,fontWeight:600,fontFamily:FC,color:"rgba(255,255,255,0.3)",letterSpacing:1,marginTop:24}}>GUZMAN Y GOMEZ &middot; LEARNING & DEVELOPMENT</div>
    </div>
  </VidBg>
);}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginV({onL,onB,onForgot}){const[un,sU]=useState("");const[pw,sP]=useState("");return (
  <VidBg>
    <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center"}}><button style={{...BA,background:"rgba(255,255,255,0.1)"}} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 28px"}}>
      <img src={GYG_LOGO} alt="GYG" style={{width:90,height:90,objectFit:"contain",display:"block",margin:"0 auto 8px"}}/>
      <div style={{fontSize:28,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:1,textAlign:"center",marginBottom:32}}>SIGN IN</div>
      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"rgba(255,255,255,0.5)",letterSpacing:1}}>USERNAME</label><input style={{padding:"14px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"#fff",fontSize:15,fontFamily:FB,outline:"none"}} value={un} onChange={e=>sU(e.target.value)} placeholder="Enter username" autoComplete="username" name="username"/></div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"rgba(255,255,255,0.5)",letterSpacing:1}}>PASSWORD</label><input style={{padding:"14px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"#fff",fontSize:15,fontFamily:FB,outline:"none"}} type="password" value={pw} onChange={e=>sP(e.target.value)} placeholder="Enter password" autoComplete="current-password" name="password"/></div>
        <button style={{...BY,width:"100%",marginTop:8}} onClick={()=>onL(un,pw)}>SIGN IN</button>
        <button onClick={onForgot} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:13,fontFamily:FC,fontWeight:700,letterSpacing:1,textAlign:"center",padding:"4px 0",textDecoration:"underline"}}>FORGOT PASSWORD?</button>
      </div>
    </div>
  </VidBg>
);}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
function ForgotPasswordV({onReset,onB}){
  const[step,setStep]=useState(1);
  const[un,sU]=useState("");
  const[em,sE]=useState("");
  const[np,sNP]=useState("");
  const[cp,sCP]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  const handleVerify=()=>{
    if(!un||!em){setErr("Please enter both your username and email");return;}
    setErr("");
    setStep(2);
  };

  const handleReset=async()=>{
    if(!np||!cp){setErr("Please enter and confirm your new password");return;}
    if(np.length<6){setErr("Password must be at least 6 characters");return;}
    if(np!==cp){setErr("Passwords do not match");return;}
    setErr("");setLoading(true);
    const ok=await onReset(un.toLowerCase(),em.toLowerCase(),np);
    setLoading(false);
    if(!ok){setStep(1);setErr("No account found with those details - check your username and email");}
  };

  const inputStyle={padding:"14px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"#fff",fontSize:15,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"};
  const labelStyle={fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:1};

  return(
    <VidBg>
      <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center"}}><button style={{...BA,background:"rgba(255,255,255,0.1)"}} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 28px"}}>
        <img src={GYG_LOGO} alt="GYG" style={{width:90,height:90,objectFit:"contain",display:"block",margin:"0 auto 8px"}}/>
        <div style={{fontSize:24,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:1,textAlign:"center",marginBottom:8}}>RESET PASSWORD</div>
        {step===1&&<div style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:24,fontFamily:FB}}>Enter your username and email to verify your account.</div>}
        {step===2&&<div style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",marginBottom:24,fontFamily:FB}}>Account verified. Set your new password below.</div>}
        <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:16}}>
          {step===1&&<>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={labelStyle}>USERNAME</label>
              <input style={inputStyle} value={un} onChange={e=>sU(e.target.value)} placeholder="Enter your username" autoComplete="username"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input style={inputStyle} value={em} onChange={e=>sE(e.target.value)} placeholder="Enter your email" type="email" autoComplete="email"/>
            </div>
            {err&&<div style={{color:"#ff6b6b",fontSize:13,fontFamily:FB,textAlign:"center"}}>{err}</div>}
            <button style={{...BY,width:"100%",marginTop:4,opacity:loading?0.6:1}} disabled={loading} onClick={handleVerify}>{loading?"CHECKING...":"VERIFY ACCOUNT"}</button>
          </>}
          {step===2&&<>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={labelStyle}>NEW PASSWORD</label>
              <input style={inputStyle} value={np} onChange={e=>sNP(e.target.value)} placeholder="Enter new password" type="password" autoComplete="new-password"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <label style={labelStyle}>CONFIRM PASSWORD</label>
              <input style={inputStyle} value={cp} onChange={e=>sCP(e.target.value)} placeholder="Confirm new password" type="password" autoComplete="new-password"/>
            </div>
            {err&&<div style={{color:"#ff6b6b",fontSize:13,fontFamily:FB,textAlign:"center"}}>{err}</div>}
            <button style={{...BY,width:"100%",marginTop:4,opacity:loading?0.6:1}} disabled={loading} onClick={handleReset}>{loading?"SAVING...":"SET NEW PASSWORD"}</button>
          </>}
          <button onClick={onB} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:13,fontFamily:FC,fontWeight:700,letterSpacing:1,textAlign:"center",padding:"4px 0",textDecoration:"underline"}}>BACK TO SIGN IN</button>
        </div>
      </div>
    </VidBg>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
function LunchReorder({user,lunchConfig,onDone}){
  const[lt,setLt]=useState(user.lunchType||"");const[lf,setLf]=useState(user.lunchFilling||"");
  const lc=lunchConfig||{};const progCfg=lc[user.program]||{};
  const enabledTypes=(progCfg.types||LUNCH_MENU.types.map(t=>t.id)).filter(tid=>LUNCH_MENU.types.some(t=>t.id===tid));
  const enabledFillings=(progCfg.fillings||LUNCH_MENU.fillings.map(fl=>fl.id)).filter(fid=>LUNCH_MENU.fillings.some(fl=>fl.id===fid));
  const visTypes=LUNCH_MENU.types.filter(t=>enabledTypes.includes(t.id));
  const visFillings=LUNCH_MENU.fillings.filter(fl=>enabledFillings.includes(fl.id));
  return(<div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>MEAL TYPE</label>
      <div style={{display:"grid",gridTemplateColumns:visTypes.length>1?"1fr 1fr":"1fr",gap:10}}>
        {visTypes.map(t=>(
          <button key={t.id} onClick={()=>setLt(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"18px 12px",background:lt===t.id?"#FFF8E0":"#fff",border:`2px solid ${lt===t.id?"#FFD300":"#e0e0db"}`,borderRadius:14,cursor:"pointer",textAlign:"center",color:"#000"}}>
            {LUNCH_IMAGES[t.id]&&<img src={LUNCH_IMAGES[t.id]} alt={t.name} style={{width:80,height:80,objectFit:"contain"}}/>}
            <div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:1,color:"#000"}}>{t.name}</div>
          </button>
        ))}
      </div>
    </div>
    {lt&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:14,fontWeight:800,fontFamily:FC,color:"#333",letterSpacing:1}}>CHOOSE MAIN FILLING</label>
      <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:14,overflow:"hidden",border:"1px solid #e0e0db"}}>
        {visFillings.map((fl,i)=>(
          <button key={fl.id} onClick={()=>setLf(fl.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:lf===fl.id?"#FFF8E0":"#fff",border:"none",borderBottom:i<visFillings.length-1?"1px solid #f0f0eb":"none",cursor:"pointer",width:"100%",textAlign:"left",color:"#1a1a1a"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {LUNCH_IMAGES[fl.id]&&<img src={LUNCH_IMAGES[fl.id]} alt="" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:lf===fl.id?"2px solid #FFD300":"2px solid transparent"}}/>}
              <span style={{fontFamily:FC,fontSize:15,fontWeight:700,color:"#1a1a1a"}}>{fl.name}</span>
            </div>
            <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${lf===fl.id?"#FFD300":"#ddd"}`,background:lf===fl.id?"#FFD300":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{lf===fl.id&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
          </button>
        ))}
      </div>
    </div>}
    <button style={{...BY,width:"100%",marginTop:8,opacity:lt&&lf?1:0.4}} disabled={!lt||!lf} onClick={()=>onDone(lt,lf)}>UPDATE ORDER</button>
  </div>);
}
function RegV({onR,onB,lunchConfig}){const[st,setSt]=useState(1);const[f,sF]=useState({name:"",email:"",username:"",password:"",position:"",program:"",restaurant:"",state:"",lunchType:"",lunchFilling:""});const[err,setErr]=useState("");const[unErr,setUnErr]=useState("");const[emErr,setEmErr]=useState("");
  const valTimer=useRef(null);
  const u=(k,v)=>{
    if(k==="username"||k==="email")v=v.toLowerCase();
    sF(p=>({...p,[k]:v}));
    if(k==="username"){if(!v.trim()){setUnErr("");return;}clearTimeout(valTimer.current);valTimer.current=setTimeout(async()=>{const r=await checkUsernameEmail(v.toLowerCase(),"");setUnErr(r.usernameTaken?"Username taken":"");},400);}
    if(k==="email"){if(!v.trim()){setEmErr("");return;}clearTimeout(valTimer.current);valTimer.current=setTimeout(async()=>{const r=await checkUsernameEmail("",v.toLowerCase());setEmErr(r.emailTaken?"Email already registered":"");},400);}
  };
  const pos=["Crew Member","Crew Trainer","Cook","Senior Cook","Head Cook","Shift Leader","Assistant Restaurant Manager","Restaurant Manager"];
  const STATES=[{id:"NSW",name:"New South Wales"},{id:"VIC",name:"Victoria"},{id:"QLD",name:"Queensland"},{id:"WA",name:"Western Australia"},{id:"SA",name:"South Australia"},{id:"TAS",name:"Tasmania"},{id:"ACT",name:"ACT"},{id:"NT",name:"Northern Territory"}];
  const previewBatch=f.program?generateBatch(f.program,null,f.state):null;
  return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
    <div style={TBar}><button style={BA} onClick={()=>st===1?onB():setSt(st-1)}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{st===3?"ORDER LUNCH":"JOIN CHALLENGE HUB"}</span><span style={{width:32}}/></div>
    <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:st===1?"33%":st===2?"66%":"100%",transition:"width 0.3s"}}/></div>
    {st===1?(
      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
        <IF l="FULL NAME" v={f.name} onChange={v=>u("name",v)} p="Your full name" ac="name" nm="name"/>
        <div>
          <IF l="EMAIL" v={f.email} onChange={v=>u("email",v)} p="your.email@gyg.com.au" t="email" ac="email" nm="email"/>
          {emErr&&<div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#E3000B",marginTop:4}}>{emErr} - try signing in</div>}
        </div>
        <div>
          <IF l="USERNAME" v={f.username} onChange={v=>u("username",v)} p="Choose a username" ac="username" nm="username"/>
          {unErr&&<div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#E3000B",marginTop:4}}>{unErr} - choose another</div>}
          {f.username&&!unErr&&<div style={{fontSize:11,fontFamily:FC,fontWeight:600,color:"#999",marginTop:4}}>Usernames are lowercase</div>}
        </div>
        <IF l="PASSWORD" v={f.password} onChange={v=>u("password",v)} p="Create a password" t="password" ac="new-password" nm="password"/>
        {err&&<div style={{background:"#FDE8E8",border:"1px solid #E3000B",borderRadius:10,padding:"10px 14px",fontSize:13,fontFamily:FC,fontWeight:700,color:"#E3000B",letterSpacing:0.5}}>{err}</div>}
        <button style={{...BY,width:"100%",marginTop:12,opacity:(!unErr&&!emErr)?1:0.4}} onClick={()=>{if(!f.name||!f.email||!f.username||!f.password){setErr("All fields are required");return;}if(unErr||emErr){setErr(unErr||emErr);return;}setErr("");setSt(2);}}>NEXT</button>
      </div>
    ):st===2?(
      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>POSITION</label>
          <select style={{padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,color:"#1a1a1a",fontSize:15,fontFamily:FB,outline:"none"}} value={f.position} onChange={e=>u("position",e.target.value)}>
            <option value="">Select position</option>{pos.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>PROGRAM</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=>(
              <button key={p.id} onClick={()=>u("program",p.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"14px 8px",background:f.program===p.id?"#FFF8E0":"#fff",border:`2px solid ${f.program===p.id?"#FFD300":"#e0e0db"}`,borderRadius:12,cursor:"pointer",fontFamily:FC}}>
                <img src={LOGOS[p.id]} alt={p.short} style={{height:44,maxWidth:"100%",objectFit:"contain"}}/>
                <div style={{fontSize:12,fontWeight:700,color:"#888",letterSpacing:1,textAlign:"center"}}>{p.name}</div>
              </button>
            ))}
          </div>
        </div>
        <IF l="RESTAURANT" v={f.restaurant} onChange={v=>u("restaurant",v)} p="e.g. Capalaba, Logan City"/>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>STATE</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {STATES.map(s=>(
              <button key={s.id} onClick={()=>u("state",s.id)} style={{padding:"10px 4px",background:f.state===s.id?"#FFF8E0":"#fff",border:`2px solid ${f.state===s.id?"#FFD300":"#e0e0db"}`,borderRadius:10,cursor:"pointer",fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:0.5,color:f.state===s.id?"#000":"#666",transition:"all 0.15s"}}>{s.id}</button>
            ))}
          </div>
        </div>
        {previewBatch&&f.state&&<div style={{background:"#000",borderRadius:12,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#888",letterSpacing:1}}>YOUR BATCH CODE</div><div style={{fontSize:20,fontWeight:900,fontFamily:FC,color:"#FFD300",letterSpacing:1,marginTop:4}}>{previewBatch}</div></div>
          <div style={{fontSize:12,color:"#666",fontFamily:FC,letterSpacing:1,textAlign:"right"}}>AUTO-ASSIGNED<br/>BASED ON PROGRAM<br/>STATE {"&"} WEEK</div>
        </div>}
        <button style={{...BY,width:"100%",marginTop:4}} onClick={()=>{
          if(!f.position||!f.program||!f.restaurant){setErr("All fields are required");return;}
          if(!f.state){setErr("Please select your state");return;}
          setErr("");const lc=lunchConfig||{};const progCfg=lc[f.program];
          if(progCfg&&progCfg.enabled===false){onR(f);}else{setSt(3);}
        }}>NEXT</button>
      </div>
    ):(
      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{textAlign:"center",marginBottom:4}}><div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:1}}>CHOOSE YOUR LUNCH</div><div style={{fontSize:13,color:"#888",marginTop:4}}>Select your meal for today's workshop</div></div>
        {(()=>{const lc=lunchConfig||{};const progCfg=lc[f.program]||{};const enabledTypes=(progCfg.types||LUNCH_MENU.types.map(t=>t.id)).filter(tid=>LUNCH_MENU.types.some(t=>t.id===tid));const enabledFillings=(progCfg.fillings||LUNCH_MENU.fillings.map(fl=>fl.id)).filter(fid=>LUNCH_MENU.fillings.some(fl=>fl.id===fid));const visTypes=LUNCH_MENU.types.filter(t=>enabledTypes.includes(t.id));const visFillings=LUNCH_MENU.fillings.filter(fl=>enabledFillings.includes(fl.id));return(<>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>MEAL TYPE</label>
          <div style={{display:"grid",gridTemplateColumns:visTypes.length>1?"1fr 1fr":"1fr",gap:10}}>
            {visTypes.map(t=>(
              <button key={t.id} onClick={()=>u("lunchType",t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"18px 12px",background:f.lunchType===t.id?"#FFF8E0":"#fff",border:`2px solid ${f.lunchType===t.id?"#FFD300":"#e0e0db"}`,borderRadius:14,cursor:"pointer",textAlign:"center",color:"#000"}}>
                <img src={LUNCH_IMAGES[t.id]} alt={t.name} style={{width:80,height:80,objectFit:"contain"}}/>
                <div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:1,color:"#000"}}>{t.name}</div>
              </button>
            ))}
          </div>
        </div>
        {f.lunchType&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:14,fontWeight:800,fontFamily:FC,color:"#333",letterSpacing:1}}>CHOOSE MAIN FILLING</label>
          <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:14,overflow:"hidden",border:"1px solid #e0e0db"}}>
            {visFillings.map((fl,i)=>(
              <button key={fl.id} onClick={()=>u("lunchFilling",fl.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:f.lunchFilling===fl.id?"#FFF8E0":"#fff",border:"none",borderBottom:i<visFillings.length-1?"1px solid #f0f0eb":"none",cursor:"pointer",width:"100%",textAlign:"left",color:"#1a1a1a"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <img src={LUNCH_IMAGES[fl.id]||LUNCH_IMAGES.burrito} alt="" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:f.lunchFilling===fl.id?"2px solid #FFD300":"2px solid transparent"}}/>
                  <span style={{fontFamily:FC,fontSize:15,fontWeight:700,color:"#1a1a1a"}}>{fl.name}</span>
                </div>
                <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${f.lunchFilling===fl.id?"#FFD300":"#ddd"}`,background:f.lunchFilling===fl.id?"#FFD300":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{f.lunchFilling===fl.id&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
              </button>
            ))}
          </div>
        </div>}
        </>);})()}
        <button style={{...BY,width:"100%",marginTop:8,opacity:f.lunchType&&f.lunchFilling?1:0.4}} onClick={()=>{if(f.lunchType&&f.lunchFilling)onR(f);}}>START CHALLENGES</button>
      </div>
    )}
  </div>
);}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function DashV({u,ch,co,wk,sc,onCh,onBd,onPr,actComps,acts,activeQuarter}){const did=co.map(c=>c.challengeId);const pg=PROGRAMS[u.program];const[expandedAct,setExpandedAct]=useState(null);const doneActs=actComps||[];const workshopName=QUARTERLY_WORKSHOPS[u.program]?.[activeQuarter||"Q1"]?.name||null;return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:90}}>
    <div style={{margin:"16px 16px 0",background:"#000",borderRadius:16,padding:"16px 20px 14px",color:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:22,fontWeight:900,fontFamily:FG,letterSpacing:1}}>HOLA, {u.name.split(" ")[0].toUpperCase()}!</div>{workshopName&&<div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:0.5,marginTop:2}}>{workshopName.toUpperCase()}</div>}
          <div style={{marginTop:8,padding:"6px 12px",background:"rgba(255,211,0,0.1)",borderRadius:8,display:"inline-block"}}><span style={{fontSize:13,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:1}}>{u.batch}</span></div>
        </div>
        {LOGOS[u.program]&&<img src={LOGOS[u.program]} alt={pg?.name} style={{height:52,objectFit:"contain"}}/>}
      </div>
      <div style={{marginTop:10,display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#888",letterSpacing:0.5,marginBottom:5}}>WEEK {wk} OF 4 &middot; {did.length}/{ch.length} COMPLETED</div><div style={{height:5,background:"#333",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#FFD300",borderRadius:3,width:`${(did.length/Math.max(ch.length,1))*100}%`,transition:"width 0.4s"}}/></div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:36,fontWeight:900,fontFamily:FC,color:"#FFD300",lineHeight:1}}>{sc}</div><div style={{fontSize:12,fontWeight:600,fontFamily:FC,color:"#888",letterSpacing:0.5,marginTop:1}}>PTS</div></div>
      </div>
    </div>
    <div style={{padding:"12px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,fontSize:17}}>Challenges</span><span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#888",letterSpacing:0.5}}>{did.length}/{ch.length} DONE</span></div>
      {ch.map(c=>{const d=did.includes(c.id);const prevDone=c.week===1?true:did.includes(ch.find(x=>x.week===c.week-1)?.id);const ul=c.week<=wk&&prevDone;
        // Calculate unlock date for locked challenges from batch code
        let unlockDateStr=null;
        if(!ul&&!d&&u.batch){const bm=u.batch.match(/WK(\d+)-(\d+)/);if(bm){const batchWk=parseInt(bm[1]);const batchYr=parseInt(bm[2])+2000;const unlockWk=batchWk+(c.week-1);const jan1=new Date(batchYr,0,1);const days=(unlockWk-1)*7-(jan1.getDay()||7)+1;const unlockDate=new Date(batchYr,0,1+days);const now=new Date();const diffDays=Math.ceil((unlockDate-now)/(1000*60*60*24));unlockDateStr=diffDays>0?`Unlocks ${unlockDate.toLocaleDateString("en-AU",{day:"numeric",month:"short"})}`:prevDone?null:"Complete Week "+(c.week-1)+" first";}}
        if(!ul&&!d&&!unlockDateStr){unlockDateStr=prevDone?`Unlocks Week ${c.week}`:`Complete Week ${c.week-1} first`;}
        return (
        <button key={c.id} style={{display:"flex",alignItems:"center",width:"100%",padding:16,background:d?"#f8f8f5":"#fff",border:d?"1px solid #d4e8d4":"1px solid #e8e8e3",borderRadius:14,marginBottom:6,cursor:(ul&&!d)?"pointer":"default",textAlign:"left",fontFamily:FB,color:"#1a1a1a",opacity:(ul||d)?1:0.4}} onClick={()=>ul&&!d&&onCh(c)} disabled={!ul||d}>
          <div style={{marginRight:14}}><div style={{width:36,height:36,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:800,fontSize:15,color:"#000",background:d?"#007A33":ul?"#FFD300":"#ccc"}}>{d?"\u2713":c.week}</div></div>
          <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:16,letterSpacing:0.5}}>{c.title}</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{c.subtitle}</div>{!ul&&!d&&unlockDateStr&&<div style={{fontSize:11,fontFamily:FC,fontWeight:600,color:"#FFB800",marginTop:4}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5" style={{verticalAlign:"middle",marginRight:4}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>{unlockDateStr}</div>}</div>
          <div style={{textAlign:"right",marginLeft:12}}>{d?<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#007A33",letterSpacing:0.5}}>DONE</div>:<><div style={{fontFamily:FC,fontWeight:600,fontSize:11,color:"#999",letterSpacing:0.5}}>UP TO</div><div style={{fontFamily:FC,fontWeight:900,fontSize:18}}>{c.points+c.bonusPoints}<span style={{fontSize:13,fontWeight:600,color:"#999"}}> PTS</span></div></>}</div>
          {!d&&ul&&<div style={{fontSize:22,color:"#ccc",marginLeft:8,fontWeight:300}}>{"\u203A"}</div>}
        </button>
      );})}
    </div>
    {acts.length>0&&doneActs.length>0&&(
    <div style={{padding:"20px 16px 0"}}>
      <div style={{borderTop:"1px solid #e8e8e3",paddingTop:16,marginBottom:8}}>
        <span style={{fontWeight:600,fontSize:15,color:"#999"}}>Workshop Activities</span>
      </div>
      {/* Deduplicate by activityId - show only the latest completion per activity */}
      {Object.values(doneActs.reduce((acc,ac)=>{if(!acc[ac.activityId]||new Date(ac.completedAt)>new Date(acc[ac.activityId].completedAt))acc[ac.activityId]=ac;return acc;},{})).map(ac=>{const actDef=acts.find(a=>a.id===ac.activityId);const isOpen=expandedAct===ac.id;const d=ac.data||{};return (
        <div key={ac.id} style={{marginBottom:8}}>
          <button onClick={()=>setExpandedAct(isOpen?null:ac.id)} style={{display:"flex",alignItems:"center",width:"100%",padding:14,background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,cursor:"pointer",textAlign:"left",fontFamily:FB,color:"#1a1a1a",opacity:0.7}}>
            <div style={{marginRight:14}}><div style={{width:36,height:36,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:800,fontSize:15,color:"#fff",background:"#007A33"}}>{"\u2713"}</div></div>
            <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:15,letterSpacing:0.5,color:"#999"}}>{actDef?.title||"Activity"}</div><div style={{fontSize:12,color:"#bbb",marginTop:2}}>Completed {new Date(ac.completedAt).toLocaleDateString()}</div></div>
            <div style={{fontSize:22,color:"#ccc",marginLeft:8,fontWeight:300,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}>{"\u203A"}</div>
          </button>
          {isOpen&&d.type==="huddle_builder"&&(
          <div className="anim-fade-up" style={{background:"#000",borderRadius:16,padding:20,color:"#fff",margin:"6px 0 4px"}}>
            <div style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#FFD300",letterSpacing:0.5,marginBottom:6}}>YOUR HUDDLE SCRIPT</div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {d.focus&&<span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"#FFD300",color:"#000",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[d.focus]?.label||"").toUpperCase()}</span>}
              {d.subFocus&&<span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"rgba(255,211,0,0.15)",color:"#FFD300",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[d.focus]?.subs.find(s=>s.id===d.subFocus)?.label||"").toUpperCase()}</span>}
            </div>
            {d.script&&HUDDLE_STEPS.map((st,i)=>(
              <div key={i} style={{marginBottom:8}}>
                <span style={{fontSize:15,fontFamily:FB,fontWeight:400,color:"#fff",lineHeight:1.5}}>{st.prefix?st.prefix+" ":""}{d.script[i]}</span>
              </div>
            ))}
            {d.crewLine&&<div style={{marginTop:10,background:"#FFD300",borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#000",letterSpacing:1,marginBottom:2}}>THE LINE THEY REMEMBER</div><div style={{fontSize:16,fontWeight:800,fontFamily:FB,color:"#000"}}>{d.crewLine}</div></div>}
            {d.partnerName&&<div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #333",fontSize:12,fontWeight:700,fontFamily:FC,color:"#666",letterSpacing:0.5}}>PARTNER: {d.partnerName.toUpperCase()}{d.allYes&&<span style={{marginLeft:8,color:"#007A33"}}>ALL GOOD</span>}</div>}
          </div>
          )}
        </div>
      );})}
    </div>
    )}
    <BNav active="home" onH={()=>{}} onB={onBd} onP={onPr}/>
  </div>
);}

// ─── SHARED CHALLENGE INTRO ─────────────────────────────────────────────────
// Every activity/challenge uses this for its briefing screen
const ChallengeIntro=({icon,title,subtitle,description,points,bonusPoints,bonusCondition,tip,onStart,onB,startLabel="START"})=>(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{title}</span><span style={{width:32}}/></div>
    <div style={{padding:"28px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:18,flex:1,maxWidth:440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
      {icon&&<div style={{width:72,height:72,borderRadius:36,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4}}>{typeof icon==="string"?<img src={icon} alt="" style={{width:40,height:40,objectFit:"contain",filter:"brightness(0) invert(1)"}}/>:icon}</div>}
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:1,lineHeight:1.2}}>{title}</div>
        {subtitle&&<div style={{fontFamily:FC,fontWeight:600,fontSize:14,color:"#888",marginTop:6}}>{subtitle}</div>}
      </div>
      {description&&<div style={{fontSize:15,color:"#555",fontFamily:FB,lineHeight:1.7,textAlign:"center",maxWidth:480}}>{description}</div>}
      {/* Points card - always present */}
      <div style={{width:"100%",background:"#000",borderRadius:14,padding:"18px 20px"}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#FFD300",letterSpacing:1,marginBottom:10}}>HOW POINTS WORK</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontFamily:FC,fontSize:13,color:"#ccc"}}>Complete challenge</span>
          <span style={{fontFamily:FC,fontWeight:900,fontSize:18,color:"#fff"}}>Up to {points} pts</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid #333"}}>
          <span style={{fontFamily:FC,fontSize:13,color:"#FFD300",fontWeight:700}}>Bonus</span>
          <span style={{fontFamily:FC,fontWeight:900,fontSize:18,color:"#FFD300"}}>Up to +{bonusPoints} pts</span>
        </div>
        {bonusCondition&&<div style={{fontFamily:FC,fontSize:12,color:"#999",marginTop:6,fontStyle:"italic"}}>{bonusCondition}</div>}
      </div>
      {/* Tip card */}
      {tip&&<div style={{width:"100%",background:"#f0f8f0",border:"1px solid #d4e8d4",borderRadius:14,padding:16}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#007A33",letterSpacing:1,marginBottom:6}}>PRO TIP</div>
        <div style={{fontSize:14,color:"#666",fontFamily:FB,lineHeight:1.5}}>{tip}</div>
      </div>}
      <button style={{...BY,width:"100%",marginTop:8}} onClick={onStart}>{startLabel}</button>
    </div>
  </div>
);

// ─── Challenge-specific SVG icons (professional line art) ───────────────────
const CI={
  // LSE
  hazard_hunt:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  // Warning triangle
  shift_in_chaos:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M7 10v4M17 10v4M10 7h4M10 17h4"/></svg>,
  // Grid with arrows (reorder)
  waste_audit:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  // Trash/audit
  teach_it:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  // People/teach
  spot_the_moment:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  // Camera
  thirty_second_sell:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  // Clock/timer
  recovery_race:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  // Recovery/refresh
  shift_leader_lens:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><circle cx="11" cy="11" r="3"/></svg>,
  // Magnifying glass with focus
  shift_call:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
  // Phone
  make_the_call:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><line x1="6" y1="11" x2="6" y2="11.01"/><line x1="18" y1="11" x2="18" y2="11.01"/></svg>,
  // Roster/schedule
  perm_or_pass:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  // Speech bubble/conversation
  your_restaurant:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  // Bar chart
  guest_dollar_trail:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  // Dollar sign
  triage_call:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94"/><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg>,
  // Phone ringing
  rm_brief:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  // Document/brief
  numbers_dont_lie:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  // Chart line (P&L)
  self_assessment:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>,
};

// ─── Comprehensive Icon Library (SVG functions returning JSX) ────────────────
const ICON_LIBRARY_DEFS={
  // --- GYG Brand Icons (reference ICONS base64) ---
  fries:{cat:"gyg",label:"Fries"},
  churros:{cat:"gyg",label:"Churros"},
  taco:{cat:"gyg",label:"Taco"},
  burrito:{cat:"gyg",label:"Burrito"},
  bag:{cat:"gyg",label:"Bag"},
  fire_burrito:{cat:"gyg",label:"Fire Burrito"},
  socks:{cat:"gyg",label:"Socks"},
  sticky_tape:{cat:"gyg",label:"Sticky Tape"},
  churro:{cat:"gyg",label:"Churro"},
  sundae:{cat:"gyg",label:"Sundae"},
  lime:{cat:"gyg",label:"Lime"},
  guac:{cat:"gyg",label:"Guac"},
  avocado:{cat:"gyg",label:"Avocado"},
  under_construction:{cat:"gyg",label:"Under Construction"},
  // --- Activity Icons (from CI) ---
  hazard_hunt:{cat:"activity",label:"Hazard Hunt"},
  shift_in_chaos:{cat:"activity",label:"Shift in Chaos"},
  waste_audit:{cat:"activity",label:"Waste Audit"},
  teach_it:{cat:"activity",label:"Teach It"},
  spot_the_moment:{cat:"activity",label:"Spot the Moment"},
  thirty_second_sell:{cat:"activity",label:"30 Second Sell"},
  recovery_race:{cat:"activity",label:"Recovery Race"},
  shift_leader_lens:{cat:"activity",label:"Shift Leader Lens"},
  shift_call:{cat:"activity",label:"Shift Call"},
  make_the_call:{cat:"activity",label:"Make the Call"},
  perm_or_pass:{cat:"activity",label:"Perm or Pass"},
  your_restaurant:{cat:"activity",label:"Your Restaurant"},
  guest_dollar_trail:{cat:"activity",label:"Guest Dollar Trail"},
  triage_call:{cat:"activity",label:"Triage Call"},
  rm_brief:{cat:"activity",label:"RM Brief"},
  numbers_dont_lie:{cat:"activity",label:"Numbers Don't Lie"},
  self_assessment:{cat:"activity",label:"Self Assessment"},
  // --- General Icons (new SVGs) ---
  star:{cat:"general",label:"Star"},
  heart:{cat:"general",label:"Heart"},
  lightning:{cat:"general",label:"Lightning"},
  target:{cat:"general",label:"Target"},
  trophy:{cat:"general",label:"Trophy"},
  medal:{cat:"general",label:"Medal"},
  flag:{cat:"general",label:"Flag"},
  compass:{cat:"general",label:"Compass"},
  rocket:{cat:"general",label:"Rocket"},
  lightbulb:{cat:"general",label:"Lightbulb"},
  shield:{cat:"general",label:"Shield"},
  key:{cat:"general",label:"Key"},
  lock:{cat:"general",label:"Lock"},
  gear:{cat:"general",label:"Gear"},
  wrench:{cat:"general",label:"Wrench"},
  clipboard:{cat:"general",label:"Clipboard"},
  checklist:{cat:"general",label:"Checklist"},
  megaphone:{cat:"general",label:"Megaphone"},
  eye:{cat:"general",label:"Eye"},
  hand:{cat:"general",label:"Hand"},
  thumbs_up:{cat:"general",label:"Thumbs Up"},
  fire:{cat:"general",label:"Fire"},
  sparkle:{cat:"general",label:"Sparkle"},
  crown:{cat:"general",label:"Crown"},
  diamond:{cat:"general",label:"Diamond"},
  puzzle:{cat:"general",label:"Puzzle"},
  brain:{cat:"general",label:"Brain"},
  muscle:{cat:"general",label:"Muscle"},
  handshake:{cat:"general",label:"Handshake"},
  timer:{cat:"general",label:"Timer"},
  calendar:{cat:"general",label:"Calendar"},
  map_pin:{cat:"general",label:"Map Pin"},
  users:{cat:"general",label:"Users"},
  user_check:{cat:"general",label:"User Check"},
  trending_up:{cat:"general",label:"Trending Up"},
  award:{cat:"general",label:"Award"},
  zap:{cat:"general",label:"Zap"},
  book:{cat:"general",label:"Book"},
  mic:{cat:"general",label:"Mic"},
  video:{cat:"general",label:"Video"},
  edit:{cat:"general",label:"Edit"},
  layers:{cat:"general",label:"Layers"},
};

const ICON_SVG=(key,color="#333",size=24)=>{
  const p={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:color,strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"};
  const svgs={
    // Activity icons (same paths as CI)
    hazard_hunt:<svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shift_in_chaos:<svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><path d="M7 10v4M17 10v4M10 7h4M10 17h4"/></svg>,
    waste_audit:<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
    teach_it:<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    spot_the_moment:<svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    thirty_second_sell:<svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    recovery_race:<svg {...p}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
    shift_leader_lens:<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><circle cx="11" cy="11" r="3"/></svg>,
    shift_call:<svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>,
    make_the_call:<svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><line x1="6" y1="11" x2="6" y2="11.01"/><line x1="18" y1="11" x2="18" y2="11.01"/></svg>,
    perm_or_pass:<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    your_restaurant:<svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    guest_dollar_trail:<svg {...p}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    triage_call:<svg {...p}><path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94"/><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.35 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.35 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg>,
    rm_brief:<svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    numbers_dont_lie:<svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    self_assessment:<svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>,
    // General icons (new)
    star:<svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    heart:<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    lightning:<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    target:<svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    trophy:<svg {...p}><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
    medal:<svg {...p}><path d="M12 15l-3.5 6.5 1-3.5-3-2h4L12 12"/><path d="M12 15l3.5 6.5-1-3.5 3-2h-4L12 12"/><circle cx="12" cy="8" r="6"/></svg>,
    flag:<svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    compass:<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    rocket:<svg {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 3 0 3 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-3 0-3"/></svg>,
    lightbulb:<svg {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M4.93 4.93l.71.71"/><path d="M2 12h1"/><path d="M19.07 4.93l-.71.71"/><path d="M22 12h-1"/><path d="M15.54 8.46a5 5 0 10-7.08 0C9.53 9.54 10 11 10 12h4c0-1 .47-2.46 1.54-3.54z"/></svg>,
    shield:<svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    key:<svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
    lock:<svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    gear:<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    wrench:<svg {...p}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    clipboard:<svg {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    checklist:<svg {...p}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>,
    megaphone:<svg {...p}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>,
    eye:<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    hand:<svg {...p}><path d="M18 11V6a2 2 0 00-4 0"/><path d="M14 10V4a2 2 0 00-4 0v7"/><path d="M10 10.5V6a2 2 0 00-4 0v8"/><path d="M18 11a2 2 0 014 0v3a8 8 0 01-8 8h-2c-2.76 0-3.89-1-5.69-2.84L3.65 16.4a2 2 0 012.76-2.91L8 15"/></svg>,
    thumbs_up:<svg {...p}><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
    fire:<svg {...p}><path d="M12 22c4-3 8-6.58 8-12a8 8 0 00-16 0c0 5.42 4 9 8 12z" fill="none"/><path d="M12 22c-2 0-4-3.58-4-8a4 4 0 018 0c0 4.42-2 8-4 8z" fill="none"/></svg>,
    sparkle:<svg {...p}><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M19 17l.75 2.25L22 20l-2.25.75L19 23l-.75-2.25L16 20l2.25-.75L19 17z"/><path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z"/></svg>,
    crown:<svg {...p}><path d="M2 20h20"/><path d="M4 17l2-11 4 4 2-6 2 6 4-4 2 11H4z"/></svg>,
    diamond:<svg {...p}><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41L13.7 2.71a2.41 2.41 0 00-3.41 0L2.7 10.3z"/></svg>,
    puzzle:<svg {...p}><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.61a2.404 2.404 0 01-1.705.707 2.402 2.402 0 01-1.704-.706l-1.568-1.568a1.026 1.026 0 00-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 11-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 00-.289-.877l-1.568-1.568A2.402 2.402 0 011.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 01.837-.276c.47.07.802.48.968.925a2.501 2.501 0 103.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 01.276-.837l1.61-1.61a2.404 2.404 0 011.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 113.237 3.237c-.464.18-.894.527-.967 1.02z"/></svg>,
    brain:<svg {...p}><path d="M9.5 2A5.5 5.5 0 005 7.5c0 .96.246 1.87.683 2.66"/><path d="M14.5 2A5.5 5.5 0 0120 7.5c0 .96-.246 1.87-.683 2.66"/><path d="M4.683 10.16A5.5 5.5 0 005 18.5V22h6v-3"/><path d="M19.317 10.16A5.5 5.5 0 0019 18.5V22h-6v-3"/><path d="M12 2v5M12 12v10"/></svg>,
    muscle:<svg {...p}><path d="M6.5 6.5c1.5-1 3-1 4 0s1.5 3 1.5 5"/><path d="M17.5 6.5c-1.5-1-3-1-4 0s-1.5 3-1.5 5"/><path d="M2 11.5c0 4 3 7.5 7 8V22h6v-2.5c4-.5 7-4 7-8 0-2-1-3.5-2.5-4.5"/><path d="M5 11.5c0-1.5.5-3 2.5-4.5"/></svg>,
    handshake:<svg {...p}><path d="M11 17l-1.5 1.5a2.12 2.12 0 01-3-3L9 13"/><path d="M13 7l1.5-1.5a2.12 2.12 0 013 3L15 11"/><path d="M2 7l4.5 4.5"/><path d="M17.5 12.5L22 17"/><path d="M2 17l5-5 2.12 2.12"/><path d="M22 7l-5 5-2.12-2.12"/></svg>,
    timer:<svg {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3l2.5 2.5"/><path d="M19 3l-2.5 2.5"/><path d="M10 2h4"/></svg>,
    calendar:<svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    map_pin:<svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    users:<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    user_check:<svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
    trending_up:<svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    award:<svg {...p}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    zap:<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    book:<svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    mic:<svg {...p}><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    video:<svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    edit:<svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    layers:<svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  };
  return svgs[key]||null;
};

// Helper: resolve icon for a challenge - checks ch.icon in ICON_LIBRARY, then CI[ch.type], then ICONS[ch.icon]
// GYG food icons that were default placeholders - ignore these in favor of activity icons
const GYG_FOOD_ICONS=new Set(["fries","churros","taco","burrito","bag","fire_burrito","socks","sticky_tape","churro","sundae","cap","lime","guac","avocado"]);
const resolveChIcon=(ch)=>{
  // If admin explicitly set a non-food icon, use it
  if(ch.icon&&ch.icon!=="none"&&!GYG_FOOD_ICONS.has(ch.icon)){
    const libSvg=ICON_SVG(ch.icon,"#FFD300",32);
    if(libSvg)return libSvg;
    if(ch.customIcon)return <img src={ch.customIcon} alt="" style={{width:32,height:32,objectFit:"contain"}}/>;
  }
  // Use type-based activity icon (always appropriate for the activity)
  return CI[ch.type]||null;
};

// ─── IconPicker Component ───────────────────────────────────────────────────
function IconPicker({onSelect,onClose,current}){
  const[search,setSearch]=useState("");
  const[tab,setTab]=useState("all");
  const cats={all:"ALL",gyg:"GYG",activity:"ACTIVITY",general:"GENERAL"};
  const entries=Object.entries(ICON_LIBRARY_DEFS).filter(([k,v])=>{
    if(tab!=="all"&&v.cat!==tab)return false;
    if(search){const q=search.toLowerCase();return k.toLowerCase().includes(q)||v.label.toLowerCase().includes(q);}
    return true;
  });
  return(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:480,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
      {/* Header */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid #e8e8e3",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:FC,fontWeight:800,fontSize:16,letterSpacing:0.5}}>CHOOSE ICON</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:4}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      {/* Search */}
      <div style={{padding:"12px 20px 8px"}}>
        <div style={{position:"relative"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search icons..." style={{width:"100%",padding:"10px 14px 10px 36px",border:"1px solid #e8e8e3",borderRadius:10,fontFamily:FB,fontSize:14,outline:"none",boxSizing:"border-box",background:"#f8f8f5"}}/>
        </div>
      </div>
      {/* Tabs */}
      <div style={{padding:"4px 20px 8px",display:"flex",gap:6}}>
        {Object.entries(cats).map(([k,label])=><button key={k} onClick={()=>setTab(k)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:tab===k?"#1a1a1a":"#f5f5f0",color:tab===k?"#fff":"#666",fontFamily:FC,fontWeight:700,fontSize:11,letterSpacing:0.5,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>)}
      </div>
      {/* Grid */}
      <div style={{padding:"8px 20px 20px",overflowY:"auto",flex:1}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
          {/* No icon option */}
          <button onClick={()=>{onSelect("none");onClose();}} style={{width:48,height:48,borderRadius:10,border:current==="none"||!current?"2px solid #FFD300":"1px solid #e8e8e3",background:current==="none"||!current?"#FFF8E0":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s",padding:0}} title="No icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {entries.map(([k,v])=>{
            const isSel=current===k;
            const isGYG=v.cat==="gyg";
            return(<button key={k} onClick={()=>{onSelect(k);onClose();}} title={v.label} style={{width:48,height:48,borderRadius:10,border:isSel?"2px solid #FFD300":"1px solid #e8e8e3",background:isSel?"#FFF8E0":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s",padding:0}}>
              {isGYG?<img src={ICONS[k]} alt={v.label} style={{width:32,height:32,objectFit:"contain"}}/>:ICON_SVG(k,isSel?"#B8960A":"#333",22)}
            </button>);
          })}
        </div>
        {entries.length===0&&<div style={{textAlign:"center",padding:24,color:"#999",fontFamily:FB,fontSize:14}}>No icons match your search</div>}
      </div>
    </div>
  </div>);
}

// ─── Shared interactive styles ──────────────────────────────────────────────
const qStyle={fontFamily:FC,fontWeight:800,fontSize:16,color:"#000",marginBottom:12};
const bodyStyle={fontSize:15,color:"#555",fontFamily:FB,lineHeight:1.6};
const optCard=(sel)=>({padding:16,background:sel?"#FFF8E0":"#fff",border:`2px solid ${sel?"#FFD300":"#e8e8e3"}`,borderRadius:14,cursor:"pointer",transition:"all 0.15s",fontFamily:FB,fontSize:15});
const binBtn=(isRight)=>({flex:1,minHeight:70,display:"flex",alignItems:"center",justifyContent:"center",background:isRight?"#FFD300":"#1a1a1a",color:isRight?"#000":"#fff",fontFamily:FC,fontWeight:900,fontSize:16,borderRadius:14,border:"none",cursor:"pointer",letterSpacing:0.5});
const scenarioBox={background:"#000",padding:20,borderRadius:16,color:"#fff"};
const scenarioBadge={display:"inline-block",padding:"4px 12px",background:"#FFD300",color:"#000",borderRadius:8,fontFamily:FC,fontWeight:800,fontSize:12,letterSpacing:0.5};
const resultCorrect={background:"#f0f8f0",border:"2px solid #007A33",borderRadius:14,padding:16};
const resultWrong={background:"#fef0f0",border:"2px solid #E3000B",borderRadius:14,padding:16};
const selectStyle={padding:"14px 16px",background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,fontFamily:FB,fontSize:14,color:"#1a1a1a",width:"100%",boxSizing:"border-box",appearance:"auto"};

// ─── SELF ASSESSMENT (LSE Activity) ─────────────────────────────────────────
const ASSESSMENT_CATEGORIES = [
  {id:"communication",title:"Communication Skills",items:[
    {id:"comm_1",text:"I effectively break down key information to my team"},
    {id:"comm_2",text:"I actively listen to my team members"},
    {id:"comm_3",text:"I am open to giving and receiving feedback"},
    {id:"comm_4",text:"I facilitate transparent and constructive communication within the team"},
    {id:"comm_5",text:"I encourage collaboration and idea-sharing among team members"},
    {id:"comm_6",text:"I foster an environment where everyone feels heard and valued"},
  ]},
  {id:"decision",title:"Decision-Making",items:[
    {id:"dec_1",text:"I make informed decisions considering various perspectives"},
    {id:"dec_2",text:"I am decisive and able to take calculated risks"},
    {id:"dec_3",text:"I analyse situations before making conclusions"},
  ]},
  {id:"operations",title:"Operations Management",items:[
    {id:"ops_1",text:"I motivate and inspire my team to follow food and guest procedures"},
    {id:"ops_2",text:"I communicate tasks efficiently and trust my team's abilities"},
    {id:"ops_3",text:"I lead by example and uphold standards, policies and procedures"},
  ]},
  {id:"accountability",title:"Accountability",items:[
    {id:"acc_1",text:"I am flexible and adapt when handling change"},
    {id:"acc_2",text:"I embrace challenges as learning opportunities"},
    {id:"acc_3",text:"I adjust strategies based on evolving situations"},
  ]},
  {id:"conflict",title:"Conflict Resolution",items:[
    {id:"con_1",text:"I handle conflicts diplomatically and seek win-win solutions"},
    {id:"con_2",text:"I am skilled at resolving disputes within the team"},
    {id:"con_3",text:"I promote a positive and inclusive work environment"},
  ]},
  {id:"empowerment",title:"Empowerment and Support",items:[
    {id:"emp_1",text:"I encourage individual growth and provide necessary resources"},
    {id:"emp_2",text:"I recognise and appreciate team members' contributions"},
    {id:"emp_3",text:"I offer guidance and mentorship when needed"},
  ]},
  {id:"goals",title:"Goal Alignment / Shift Goals",items:[
    {id:"goal_1",text:"I ensure team goals are clear and align with organisational objectives"},
    {id:"goal_2",text:"I assist team members in setting SMART goals"},
    {id:"goal_3",text:"I regularly review and adjust team goals based on evolving priorities and feedback"},
  ]},
  {id:"performance",title:"Performance Management",items:[
    {id:"perf_1",text:"I ensure all individuals in my team have a clear understanding of their role and responsibilities"},
    {id:"perf_2",text:"I address performance issues promptly and constructively"},
    {id:"perf_3",text:"I support team members in their aspirations and development"},
  ]},
  {id:"innovation",title:"Innovation and Continuous Improvement",items:[
    {id:"inn_1",text:"I encourage creative thinking and welcome new ideas"},
    {id:"inn_2",text:"I actively seek ways to improve processes and workflows"},
    {id:"inn_3",text:"I stay informed about industry trends and best practices"},
  ]},
];

const SCORE_BANDS = [
  {min:0,max:27,color:"#E3000B",title:"Minimal evidence of displaying the assessed leadership behaviours - substantial room for improvement.",feedback:["Foster transparent communication to create an environment where everyone feels heard and valued.","Actively listen to team members and be more open to giving and receiving feedback.","Make more informed decisions considering various perspectives and analyse situations thoroughly.","Motivate and inspire your team, delegate tasks efficiently, and lead by example with integrity.","Handle conflicts diplomatically and promote a positive and inclusive work environment."]},
  {min:28,max:54,color:"#FFD300",title:"Opportunities for growth and refinement - further practice could help a more consistent application.",feedback:["Foster transparent communication within the team and encourage collaboration and idea-sharing.","Consistent provision of feedback, recognising achievements, and address performance issues promptly.","More consistent decision-making considering various perspectives and thorough analysis of situations.","Ensure team goals align with GYG Aspirations and regularly review and adjust these goals.","Consistent flexibility in embracing challenges as learning opportunities and adjusting based on the situation."]},
  {min:55,max:81,color:"#007A33",title:"High level of proficiency, reliability, and consistency - competent and reliable leaders with some opportunity.",feedback:["Ensure consistent support and encouragement to individuals on the team for their growth and development.","Maintain a high standard in handling conflicts diplomatically and actively promote a positive, inclusive work environment.","Embrace a continuous improvement mindset, consistently seek ways to further enhance leadership.","Actively set strategic goals that contribute to the growth of GYG.","Consistently demonstrate the ability to drive initiatives that align with GYG Aspirations, including follow up."]},
];

function SelfAssessment({act,u,onComplete,onB,actCfg}){
  const cfg=actCfg?.self_assessment||{};
  const cats=cfg.categories||ASSESSMENT_CATEGORIES;
  const bands=cfg.bands||SCORE_BANDS;
  const instructions=cfg.instructions||[
    {bold:"Read each statement carefully.",desc:"Take your time to understand the specific statement."},
    {bold:"Evaluate yourself.",desc:"Select the number that most reflects your behaviour (1: never, 2: sometimes, 3: always)."},
    {bold:"Be Honest.",desc:"Evaluate yourself based on your experiences as a leader. Consider how you demonstrate each behaviour."},
    {bold:"Be Open to Feedback.",desc:"Consider seeking input from peers, mentors, or supervisors to gain additional perspectives on your leadership style."},
  ];
  const rqs=cfg.reflectionQs||{};
  const[screen,setScreen]=useState(1);
  const[scores,setScores]=useState({});
  const[q1,setQ1]=useState("");
  const[q2,setQ2]=useState("");
  const[q3,setQ3]=useState("");
  const[q4,setQ4]=useState("");

  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);

  const totalScore=Object.values(scores).reduce((s,v)=>s+v,0);
  const maxScore=cats.reduce((s,c)=>s+c.items.length*3,0);
  const band=bands.find(b=>totalScore>=b.min&&totalScore<=b.max)||bands[0];
  const catScores=cats.map(cat=>({id:cat.id,title:cat.title,score:cat.items.reduce((s,it)=>s+(scores[it.id]||0),0),max:cat.items.length*3}));
  const allItems=cats.flatMap(c=>c.items);
  const allDone=allItems.every(it=>scores[it.id]);

  // Screen 1: Instructions
  if(screen===1)return(
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
      <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{act.title}</span><span style={{width:32}}/></div>
      <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:`${(1/(cats.length+3))*100}%`,transition:"width 0.3s"}}/></div>
      <div style={{padding:"28px 28px",display:"flex",flexDirection:"column",alignItems:"center",gap:18,maxWidth:440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        <div style={{width:72,height:72,borderRadius:36,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{CI.self_assessment}</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:1}}>{act.title}</div>
          <div style={{fontFamily:FC,fontWeight:600,fontSize:14,color:"#888",marginTop:6}}>{act.subtitle}</div>
        </div>
        <div style={{width:"100%",background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:"20px"}}>
          {instructions.map((inst,i)=>(
            <div key={i} style={{marginBottom:i<instructions.length-1?16:0,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:28,height:28,borderRadius:14,background:"#000",color:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:13,flexShrink:0,marginTop:2,lineHeight:1}}>{i+1}</div>
              <div><span style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{inst.bold}</span><span style={{fontFamily:FB,fontSize:14,color:"#555"}}> {inst.desc}</span></div>
            </div>
          ))}
        </div>
        <button style={{...BY,width:"100%"}} onClick={()=>setScreen(2)}>BEGIN ASSESSMENT</button>
      </div>
    </div>
  );

  // Screens 2-10: Categories
  if(screen>=2&&screen<=cats.length+1){
    const catIdx=screen-2;
    const cat=cats[catIdx];
    const catComplete=cat.items.every(it=>scores[it.id]);
    return(
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
      <div style={TBar}><button style={BA} onClick={()=>setScreen(screen-1)}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{catIdx+1} OF {cats.length}</span><span style={{width:32}}/></div>
      <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:`${((screen)/(cats.length+3))*100}%`,transition:"width 0.3s"}}/></div>
      <div style={{padding:"20px",maxWidth:440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:4}}>{cat.title.toUpperCase()}</div>
        <div style={{fontSize:13,color:"#888",fontFamily:FC,fontWeight:600,marginBottom:16}}>{cat.items.length} statements</div>

        {/* Rating scale header */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:0,marginBottom:8,paddingRight:4}}>
          {["1","2","3"].map(n=>(
            <div key={n} style={{width:40,textAlign:"center",fontFamily:FC,fontWeight:800,fontSize:12,color:"#999"}}>{n}</div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:0,marginBottom:12,paddingRight:4}}>
          {["Never","Some-\ntimes","Always"].map((l,i)=>(
            <div key={i} style={{width:40,textAlign:"center",fontFamily:FC,fontWeight:600,fontSize:9,color:"#bbb",lineHeight:1.2,whiteSpace:"pre-line"}}>{l}</div>
          ))}
        </div>

        {cat.items.map((item,i)=>(
          <div key={item.id} style={{background:i%2===0?"#fff":"#f5f5f0",border:"1px solid #e8e8e3",borderRadius:12,padding:"14px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,fontSize:14,fontFamily:FB,lineHeight:1.5,color:"#333"}}>{item.text}</div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              {[1,2,3].map(v=>(
                <button key={v} onClick={()=>setScores(p=>({...p,[item.id]:v}))} style={{width:36,height:36,borderRadius:18,border:`2px solid ${scores[item.id]===v?"#FFD300":"#ddd"}`,background:scores[item.id]===v?"#FFD300":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s",padding:0}}>
                  <span style={{fontFamily:FC,fontWeight:800,fontSize:14,color:scores[item.id]===v?"#000":"#999",lineHeight:1,marginTop:1}}>{v}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button style={{...BY,width:"100%",marginTop:16,opacity:catComplete?1:0.4}} disabled={!catComplete} onClick={()=>setScreen(screen+1)}>
          {screen<cats.length+1?"NEXT":"SEE RESULTS"}
        </button>
        <button onClick={()=>{const newScores={...scores};cat.items.forEach(it=>delete newScores[it.id]);setScores(newScores);}} style={{background:"none",border:"none",color:"#999",fontFamily:FC,fontWeight:600,fontSize:12,letterSpacing:0.5,cursor:"pointer",display:"block",margin:"12px auto 0",padding:"8px 16px"}}>CLEAR RESPONSES</button>
      </div>
    </div>);
  }

  // Screen 11: Results
  const resultsScreen=cats.length+2;const reflectionScreen=cats.length+3;const totalScreens=cats.length+3;
  if(screen===resultsScreen)return(
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column"}}>
      <div style={TBar}><button style={BA} onClick={()=>setScreen(cats.length+1)}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>YOUR RESULTS</span><span style={{width:32}}/></div>
      <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:`${((resultsScreen)/totalScreens)*100}%`,transition:"width 0.3s"}}/></div>
      <div style={{padding:"24px 20px",maxWidth:440,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        {/* Score display */}
        <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#ccc",letterSpacing:1,marginBottom:8}}>YOUR SCORE</div>
          <div><span style={{fontFamily:FC,fontWeight:900,fontSize:56,color:band.color}}>{totalScore}</span><span style={{fontFamily:FC,fontWeight:600,fontSize:24,color:"#999"}}>/{maxScore}</span></div>
        </div>

        {/* Score bands */}
        {SCORE_BANDS.map((b,i)=>{
          const isActive=b===band;
          return(
            <div key={i} style={{background:isActive?"#fff":"#f9f9f6",border:`${isActive?"2":"1"}px solid ${isActive?b.color:"#e8e8e3"}`,borderLeft:`4px solid ${b.color}`,borderRadius:14,padding:isActive?"18px 16px":"14px 16px",marginBottom:10,opacity:isActive?1:0.6,transition:"all 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:b.color}}>{b.min} - {b.max}</span>
                {isActive&&<span style={{fontFamily:FC,fontWeight:800,fontSize:10,background:b.color,color:b.color==="#FFD300"?"#000":"#fff",padding:"4px 10px 3px",borderRadius:10,letterSpacing:0.5,lineHeight:1,display:"inline-flex",alignItems:"center"}}>YOU</span>}
              </div>
              <div style={{fontFamily:FC,fontWeight:700,fontSize:isActive?14:12,color:"#333",marginBottom:isActive?10:0,lineHeight:1.4}}>{b.title}</div>
              {isActive&&<div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                {b.feedback.map((f,fi)=>(
                  <div key={fi} style={{fontSize:13,fontFamily:FB,color:"#555",lineHeight:1.5,paddingLeft:12,borderLeft:"2px solid "+b.color}}>{f}</div>
                ))}
              </div>}
            </div>
          );
        })}

        {/* Category breakdown */}
        <div style={{marginTop:20}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:14,letterSpacing:1,marginBottom:12}}>CATEGORY BREAKDOWN</div>
          {catScores.map(cs=>(
            <div key={cs.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#333",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cs.title}</div>
                <div style={{height:6,background:"#e8e8e3",borderRadius:3,marginTop:4}}>
                  <div style={{height:"100%",background:cs.score/cs.max>=0.8?"#007A33":cs.score/cs.max>=0.5?"#FFD300":"#E3000B",borderRadius:3,width:`${(cs.score/cs.max)*100}%`,transition:"width 0.5s"}}/>
                </div>
              </div>
              <div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#333",flexShrink:0,width:42,textAlign:"right"}}>{cs.score}/{cs.max}</div>
            </div>
          ))}
        </div>

        <button style={{...BY,width:"100%",marginTop:20}} onClick={()=>setScreen(reflectionScreen)}>CONTINUE TO REFLECTION</button>
      </div>
    </div>
  );

  // Screen 12: Reflection
  return(
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",display:"flex",flexDirection:"column",paddingBottom:40}}>
      <div style={TBar}><button style={BA} onClick={()=>setScreen(resultsScreen)}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>REFLECTION</span><span style={{width:32}}/></div>
      <div style={{height:3,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:"100%"}}/></div>
      <div style={{padding:"24px 20px",maxWidth:440,margin:"0 auto",width:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",gap:18}}>
        <div style={{background:"#000",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:FC,fontWeight:900,fontSize:24,color:band.color}}>{totalScore}/{maxScore}</span>
          <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#888"}}>YOUR SCORE</span>
        </div>

        {[
          {val:q1,set:setQ1,label:rqs.q1||'I believe my two strengths are (based on the self-assessment or your own conclusion) and why:',rows:4,ph:"Your two strengths and why..."},
          {val:q2,set:setQ2,label:rqs.q2||'How does this make me feel? Are your results a surprise to you?',rows:3,ph:"Your honest reflection..."},
          {val:q3,set:setQ3,label:rqs.q3||'I believe my two opportunities are (based on the self-assessment or your own conclusion) and why:',rows:4,ph:"Your two opportunities and why..."},
          {val:q4,set:setQ4,label:rqs.q4||'How does this make me feel? Are your results a surprise to you?',rows:3,ph:"Your honest reflection..."},
        ].map((q,qi)=>(
          <div key={qi}>
            <label style={{fontFamily:FC,fontWeight:700,fontSize:13,color:"#333",display:"block",marginBottom:6,lineHeight:1.5}}>{q.label}</label>
            <textarea value={q.val} onChange={e=>q.set(e.target.value)} rows={q.rows} placeholder={q.ph} style={{width:"100%",padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,fontSize:15,fontFamily:FB,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
        ))}

        <button style={{...BY,width:"100%",opacity:(q1.trim()&&q2.trim()&&q3.trim()&&q4.trim())?1:0.4}} disabled={!(q1.trim()&&q2.trim()&&q3.trim()&&q4.trim())} onClick={()=>{
          const categoryBreakdown={};
          cats.forEach(cat=>{categoryBreakdown[cat.id]=cat.items.reduce((s,it)=>s+(scores[it.id]||0),0);});
          onComplete({
            type:"self_assessment",
            scores,
            totalScore,
            maxScore,
            band:band.title,
            bandColor:band.color,
            categoryScores:categoryBreakdown,
            reflection:{strengths:q1,strengthsFeel:q2,opportunities:q3,opportunitiesFeel:q4}
          });
        }}>COMPLETE ACTIVITY</button>
      </div>
    </div>
  );
}

// ─── HAZARD HUNT (LSE Week 1) ───────────────────────────────────────────────
const HAZARD_FEEDBACK={
  wet_floor:{hazard:true,title:"WET FLOOR - NO SIGNAGE",desc:"Slip risk. Wet floor sign must go up immediately - before mopping, not after."},
  hair_down:{hazard:true,title:"HAIR NOT SECURED",desc:"Food safety violation. Hair must be tied back and under a cap at all times on the line."},
  chemical_near_food:{hazard:true,title:"CHEMICAL NEAR FOOD",desc:"Cross-contamination risk. Chemicals must be stored in the designated chemical area - never near food prep."},
  grill_brush:{hazard:true,title:"WORN GRILL BRUSH",desc:"Wire bristle risk. Worn brushes shed bristles into food. Replace immediately."},
  blocked_exit:{hazard:true,title:"BLOCKED EXIT",desc:"Emergency access blocked. Exit paths must be clear at all times - move stock immediately."},
  decoy:{hazard:false,title:"NOT A HAZARD",desc:"This item is correctly stored according to GYG standards. Going fast isn't the same as going right."},
  gloves_missing:{hazard:true,title:"NO GLOVES AT PREP STATION",desc:"Food handling violation. Gloves must be available and used at every prep station."},
};
// Hazard zones as yaw/pitch in radians (positions on the 360 sphere)
const HAZARD_ZONES=[
  {id:"wet_floor",yaw:0.0,pitch:-0.3,size:48},
  {id:"hair_down",yaw:0.8,pitch:0.1,size:44},
  {id:"chemical_near_food",yaw:-0.7,pitch:-0.15,size:44},
  {id:"grill_brush",yaw:1.5,pitch:0.0,size:40},
  {id:"blocked_exit",yaw:-1.6,pitch:-0.2,size:48},
  {id:"decoy",yaw:2.3,pitch:0.15,size:40},
  {id:"gloves_missing",yaw:-2.5,pitch:0.1,size:40},
];
// Project a yaw/pitch point onto screen given camera yaw/pitch
function projectToScreen(zoneYaw,zonePitch,camYaw,camPitch,w,h){
  // Zone world direction (same convention as shader: Ry(yaw)*Rx(pitch)*(0,0,-1))
  const czp=Math.cos(zonePitch),szp=Math.sin(zonePitch);
  const czy=Math.cos(zoneYaw),szy=Math.sin(zoneYaw);
  const wx=-szy*czp, wy=szp, wz=-czy*czp;
  // Inverse camera: screen = Rx(-pitch)*Ry(-yaw)*world
  const cy=Math.cos(camYaw),sy=Math.sin(camYaw);
  const vx=cy*wx-sy*wz, vy=wy, vz=sy*wx+cy*wz;
  const cp=Math.cos(camPitch),sp=Math.sin(camPitch);
  const fx=vx, fy=cp*vy+sp*vz, fz=-sp*vy+cp*vz;
  if(fz>=-0.05)return null; // behind camera
  const px=fx/(-fz), py=fy/(-fz);
  const hfov=Math.tan(40*Math.PI/180);const aspect=w/h;
  const sx=(px/(2*hfov*aspect)+0.5)*w;
  const sy2=(0.5-py/(2*hfov))*h;
  const scale=1/(-fz);
  return{x:sx,y:sy2,scale:Math.min(2,Math.max(0.3,scale))};
}
function HazardHunt({ch,done,onS,onB,user,actCfg}){
  const cfgZones=actCfg?.zones||HAZARD_ZONES;
  const cfgFeedback=actCfg?.feedback||HAZARD_FEEDBACK;
  const cfgImg=(actCfg?.image&&!actCfg.image.startsWith("blob:"))?actCfg.image:HAZARD_IMG;
  const cfgOpacity=actCfg?.hotspotOpacity!==undefined?actCfg.hotspotOpacity:1;
  const cfgTimer=actCfg?.timerDuration||90;
  const cfgPtsPerHz=actCfg?.ptsPerHazard||20;
  const cfgSpeedThresh=actCfg?.speedThreshold||60;
  const cfgSpeedPts=actCfg?.speedBonusPts||20;
  const cfgDecoyAvoid=actCfg?.decoyAvoidPts||10;
  const cfgDecoyPen=actCfg?.decoyPenalty||10;
  const cfgTextPts=actCfg?.textResponsePts||20;
  const cfgQuestion=actCfg?.openQuestion||"What's the first thing you'd say to your crew about what you just saw?";
  const[screen,setScreen]=useState(1);
  const[countdown,setCountdown]=useState(0);// 3,2,1 countdown before timer starts
  const[timeLeft,setTimeLeft]=useState(cfgTimer);
  const[found,setFound]=useState([]);
  const[decoyTapped,setDecoyTapped]=useState(false);
  const[feedback,setFeedback]=useState(null);
  const[answer,setAnswer]=useState("");
  const[camYP,setCamYP]=useState({yaw:0,pitch:0});
  const[animScore,setAnimScore]=useState(0);// for count-up animation
  const timerRef=useRef(null);
  const viewRef=useRef(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);
  const realHazards=cfgZones.filter(z=>(cfgFeedback[z.id]||{}).hazard);
  const allRealFound=found.filter(id=>(cfgFeedback[id]||{}).hazard).length>=realHazards.length;
  const allTapped=allRealFound||found.length>=cfgZones.length;
  const hazardsFoundCount=found.filter(id=>(cfgFeedback[id]||{}).hazard).length;
  const score=(()=>{let s=hazardsFoundCount*cfgPtsPerHz;if(hazardsFoundCount>=realHazards.length&&(cfgTimer-timeLeft)<=cfgSpeedThresh)s+=cfgSpeedPts;if(!decoyTapped)s+=cfgDecoyAvoid;if(answer.trim().length>0)s+=cfgTextPts;return Math.max(0,s-(decoyTapped?cfgDecoyPen:0));})();
  const speedBonus=hazardsFoundCount>=realHazards.length&&(cfgTimer-timeLeft)<=cfgSpeedThresh;
  // Countdown 3,2,1 before timer starts
  useEffect(()=>{if(screen===2&&countdown>0){const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);}
    if(screen===2&&countdown===0&&timeLeft>0&&!allTapped){timerRef.current=setInterval(()=>setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);return 0;}return t-1;}),1000);return()=>clearInterval(timerRef.current);}
    if(timerRef.current)clearInterval(timerRef.current);},[screen,countdown,timeLeft,allTapped]);
  useEffect(()=>{if((timeLeft===0||allTapped)&&screen===2&&countdown===0)setScreen(3);},[timeLeft,allTapped,screen,countdown]);
  // Score count-up animation
  useEffect(()=>{if(screen===3&&animScore<score){const t=setTimeout(()=>setAnimScore(s=>Math.min(s+Math.ceil(score/20),score)),40);return()=>clearTimeout(t);}},[screen,animScore,score]);
  const tapZone=(zone)=>{if(found.includes(zone.id))return;const fb=cfgFeedback[zone.id]||{};if(!fb.hazard)setDecoyTapped(true);setFound(p=>[...p,zone.id]);setFeedback({...fb,id:zone.id});setTimeout(()=>setFeedback(null),2000);};
  if(done)return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);
  if(screen===1)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>{setCountdown(3);setScreen(2);}} startLabel="START HAZARD HUNT"/>;
  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {screen===2&&(
      <div style={{position:"relative",height:"calc(100vh - 48px)",display:"flex",flexDirection:"column"}}>
        {/* Countdown overlay */}
        {countdown>0&&(<div style={{position:"absolute",inset:0,zIndex:50,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:120,fontWeight:900,fontFamily:F107,color:"#FFD300",lineHeight:1}}>{countdown}</div>
          <div style={{fontSize:18,fontFamily:FC,fontWeight:700,color:"#fff",marginTop:12,letterSpacing:1}}>GET READY</div>
        </div>)}
        {/* Timer bar */}
        <div style={{background:"rgba(0,0,0,0.8)",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:10,flexShrink:0}}>
          <div style={{fontSize:28,fontWeight:900,fontFamily:FG,color:timeLeft<=10?"#E3000B":timeLeft<=30?"#FFD300":"#fff"}}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,fontFamily:FC,fontWeight:700,color:"#ccc"}}>{hazardsFoundCount}/{realHazards.length}</span>
            <span style={{fontSize:16,fontWeight:900,fontFamily:FC,color:"#FFD300"}}>{score} PTS</span>
          </div>
        </div>
        {/* 360 viewer */}
        <div style={{flex:1,position:"relative",overflow:"hidden"}} ref={viewRef}>
          <PanoViewer imgSrc={cfgImg} onYawPitch={(y,p)=>setCamYP({yaw:y,pitch:p})}/>
          {countdown===0&&cfgZones.map(z=>{const tapped=found.includes(z.id);const fb=cfgFeedback[z.id]||{};
            const vw=viewRef.current?.clientWidth||400;const vh=viewRef.current?.clientHeight||600;
            const proj=projectToScreen(z.yaw,z.pitch,camYP.yaw,camYP.pitch,vw,vh);
            if(!proj)return null;
            const sz=z.size*proj.scale;
            return(
            <div key={z.id} onClick={()=>!tapped&&countdown===0&&tapZone(z)} style={{position:"absolute",left:proj.x-sz/2,top:proj.y-sz/2,width:sz,height:sz,zIndex:5,borderRadius:"50%",cursor:tapped?"default":"pointer",opacity:tapped?1:cfgOpacity,border:tapped?(fb.hazard?"3px solid #007A33":"3px solid #E3000B"):(cfgOpacity>0?"2px solid rgba(255,211,0,"+cfgOpacity*0.4+")":"none"),background:tapped?(fb.hazard?"rgba(0,122,51,0.4)":"rgba(227,0,11,0.4)"):(cfgOpacity>0?"rgba(255,211,0,"+cfgOpacity*0.08+")":"transparent"),display:"flex",alignItems:"center",justifyContent:"center",transition:"border 0.3s, background 0.3s",boxShadow:tapped?"none":(cfgOpacity>0?"0 0 12px rgba(255,211,0,"+cfgOpacity*0.2+")":"none")}}>
              {tapped&&<span style={{fontSize:Math.max(16,sz*0.5),color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>{fb.hazard?"\u2713":"\u2717"}</span>}
            </div>
          );})}
        </div>
        {/* Bottom hint - no overlap */}
        <div style={{background:"rgba(0,0,0,0.8)",padding:"10px 16px",fontSize:11,fontFamily:FC,fontWeight:600,color:"rgba(255,255,255,0.5)",letterSpacing:0.5,textAlign:"center",flexShrink:0}}>DRAG TO LOOK AROUND - TAP HAZARDS</div>
        {/* Feedback popup - centered in viewport */}
        {feedback&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div className="anim-scale-in" style={{background:feedback.hazard?"#007A33":"#E3000B",color:"#fff",borderRadius:16,padding:"18px 24px",maxWidth:300,width:"calc(100% - 48px)",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",pointerEvents:"auto"}}>
              <div style={{fontSize:16,fontWeight:900,fontFamily:FC,letterSpacing:1,marginBottom:6}}>{feedback.title}</div>
              <div style={{fontSize:13,lineHeight:1.5,opacity:0.9}}>{feedback.desc}</div>
              {!feedback.hazard&&<div style={{marginTop:8,fontSize:14,fontWeight:800,fontFamily:FC,color:"#FFD300"}}>-{cfgDecoyPen} PTS</div>}
            </div>
          </div>
        )}
      </div>
    )}
    {screen===3&&(
      <div style={{padding:"24px 20px"}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
        <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300",transition:"all 0.1s"}}>{animScore}</div>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>POINTS EARNED</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#000",letterSpacing:0.5,marginBottom:12}}>SCORE BREAKDOWN</div>
          {realHazards.map(z=>{const f=found.includes(z.id);return(
            <div key={z.id} style={{display:"flex",justifyContent:"space-between",fontSize:14,fontFamily:FB,color:f?"#555":"#999",marginBottom:4}}>
              <span>{f?"\u2713 ":"\u2717 "}{(cfgFeedback[z.id]||{}).title||z.id}</span><span style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{f?`+${cfgPtsPerHz}`:"0"}</span>
            </div>
          );})}
          <div style={{borderTop:"1px solid #e8e8e3",marginTop:8,paddingTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontFamily:FB,color:speedBonus?"#555":"#999",marginBottom:4}}><span>{speedBonus?"\u2713":"\u2717"} Speed bonus (under {cfgSpeedThresh}s)</span><span style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{speedBonus?`+${cfgSpeedPts}`:"0"}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontFamily:FB,color:!decoyTapped?"#555":"#E3000B",marginBottom:4}}><span>{!decoyTapped?"\u2713":"\u2717"} Decoy avoided</span><span style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{!decoyTapped?`+${cfgDecoyAvoid}`:`-${cfgDecoyPen}`}</span></div>
          </div>
        </div>
        {decoyTapped&&<div style={{background:"#FFF8E0",border:"1px solid #FFD300",borderRadius:14,padding:16,marginBottom:16}}><div style={{fontSize:15,fontWeight:700,fontFamily:FB,color:"#000",lineHeight:1.5}}>You tapped the decoy. It looked wrong but it was fine. Going fast isn't the same as going right.</div></div>}
        <div style={{marginBottom:16}}>
          <label style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#333",letterSpacing:0.5,display:"block",marginBottom:6}}>{cfgQuestion.toUpperCase()}</label>
          <textarea style={{width:"100%",padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,color:"#1a1a1a",fontSize:15,fontFamily:FB,outline:"none",height:80,resize:"vertical",boxSizing:"border-box"}} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Your response..."/>
        </div>
        <button style={{...BY,width:"100%",fontSize:17,opacity:answer.trim()?"1":"0.5"}} disabled={!answer.trim()} onClick={()=>{const finalScore=score;onS({text:answer,hazardsFound:found.filter(id=>(cfgFeedback[id]||{}).hazard),decoyTapped,timeUsed:90-timeLeft,score:finalScore,speedBonus,claimedBonus:speedBonus&&!decoyTapped,autoBonus:speedBonus&&!decoyTapped,points:finalScore});}}>SUBMIT</button>
      </div>
    )}
  </div>
);}

// ─── SHIFT IN CHAOS (LSE Week 2) ────────────────────────────────────────────
const CHAOS_PROBLEMS=[
  {id:1,text:"A crew member just cut their finger on a knife and is bleeding at the prep station",category:"safety"},
  {id:2,text:"The walk-in cool room temperature alarm is going off - reading 8C instead of 2-4C",category:"safety"},
  {id:3,text:"A customer is at the counter saying they're having an allergic reaction to something they just ate",category:"safety"},
  {id:4,text:"The fryer oil hasn't been changed and is smoking - crew are still cooking with it",category:"safety"},
  {id:5,text:"Drive-thru times have blown out to 12 minutes and there are 8 cars in the queue",category:"operational"},
  {id:6,text:"You're about to run out of chicken in 20 minutes and it's the middle of lunch rush",category:"operational"},
  {id:7,text:"Two crew members are having a loud argument in front of guests",category:"operational"},
  {id:8,text:"The POS system has frozen on one of the two registers",category:"operational"},
  {id:9,text:"A regular guest is complaining that their order was wrong for the second time this week",category:"operational"},
  {id:10,text:"There's a long queue and a crew member is on their phone in the back",category:"operational"},
  {id:11,text:"The dining area has 4 dirty tables and no one is clearing them",category:"cosmetic"},
  {id:12,text:"The menu board above the counter has a wrong price displayed",category:"cosmetic"},
];
const EXPERT_ORDER=[1,2,3,4,5,6,7,8,9,10,11,12];
function ShiftInChaos({ch,done,onS,onB,user,comps:myComps,actCfg}){const[users,setUsers]=useState([]);const[comps,setLocalComps]=useState(myComps||[]);useEffect(()=>{Promise.all([getUsersByBatch(user.batch),getCompletionsByBatch(user.batch)]).then(([u,c])=>{setUsers(u);setLocalComps(c);});},[user.batch]);
  const[screen,setScreen]=useState(1);
  const[ranking,setRanking]=useState(()=>{const shuffled=[...CHAOS_PROBLEMS];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}return shuffled;});
  const[showConfirm,setShowConfirm]=useState(false);
  const[answer,setAnswer]=useState("");
  const[dragIdx,setDragIdx]=useState(null);
  const[dragY,setDragY]=useState(0);
  const[dragStartY,setDragStartY]=useState(0);
  const[itemHeight,setItemHeight]=useState(60);
  const listRef=useRef(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);
  const catColor={safety:"#E3000B",operational:"#FFD300",cosmetic:"#999"};
  const totalDistance=ranking.reduce((sum,p,i)=>{const expertIdx=EXPERT_ORDER.indexOf(p.id);return sum+Math.abs(i-expertIdx);},0);
  const maxDistance=ranking.length*(ranking.length-1)/2;// theoretical max ~66 for 12 items
  const accuracy=Math.max(0,Math.round((1-totalDistance/maxDistance)*100));
  const earnedPts=Math.round(ch.points*(accuracy/100));
  const batchComps=comps.filter(c=>c.challengeId==="lse-w2"&&c.program==="lse");
  const distances=[...batchComps.map(c=>c.submission?.distanceFromExpert||999),totalDistance].sort((a,b)=>a-b);
  const topN=actCfg?.topN||3;
  const bonusThresh=actCfg?.bonusThreshold||80;
  const isTop3=distances.indexOf(totalDistance)<topN;
  const onDragStart=(i,e)=>{e.preventDefault();const t=e.touches?e.touches[0]:e;setDragIdx(i);setDragStartY(t.clientY);setDragY(0);
    if(listRef.current){const items=listRef.current.children;if(items[0])setItemHeight(items[0].getBoundingClientRect().height+6);}};
  const onDragMove=(e)=>{if(dragIdx===null)return;e.preventDefault();const t=e.touches?e.touches[0]:e;setDragY(t.clientY-dragStartY);};
  const onDragEnd=()=>{if(dragIdx===null)return;const offset=Math.round(dragY/itemHeight);const newIdx=Math.max(0,Math.min(ranking.length-1,dragIdx+offset));
    if(newIdx!==dragIdx){const n=[...ranking];const[item]=n.splice(dragIdx,1);n.splice(newIdx,0,item);setRanking(n);}
    setDragIdx(null);setDragY(0);};
  if(done)return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);
  if(screen===1)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setScreen(2)} startLabel="START RANKING"/>;
  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {screen===2&&(
      <div style={{padding:"12px 12px 24px",overflowY:"auto",overflowX:"hidden",maxHeight:"calc(100vh - 60px)",WebkitOverflowScrolling:"touch",boxSizing:"border-box"}} onTouchMove={onDragMove} onTouchEnd={onDragEnd} onMouseMove={onDragMove} onMouseUp={onDragEnd}>
        <div style={{fontSize:12,fontWeight:800,fontFamily:FC,color:"#999",letterSpacing:1,marginBottom:6,textAlign:"center"}}>HOLD AND DRAG TO REORDER</div>
        <div ref={listRef} style={{position:"relative",overflow:"hidden"}}>
          {ranking.map((p,i)=>{
            const isDragging=dragIdx===i;
            const dragOffset=isDragging?dragY:0;
            // Calculate if another item should visually shift
            let shift=0;
            if(dragIdx!==null&&!isDragging){
              const movingTo=Math.round(dragY/itemHeight);
              const targetIdx=dragIdx+movingTo;
              if(dragIdx<i&&targetIdx>=i)shift=-1;
              if(dragIdx>i&&targetIdx<=i)shift=1;
            }
            return(
            <div key={p.id}
              onTouchStart={e=>onDragStart(i,e)} onMouseDown={e=>onDragStart(i,e)}
              style={{display:"flex",alignItems:"center",width:"100%",padding:"10px 12px",background:isDragging?"#FFF8E0":"#fff",border:isDragging?"2px solid #FFD300":"1px solid #e8e8e3",borderRadius:10,marginBottom:4,cursor:"grab",textAlign:"left",fontFamily:FB,color:"#1a1a1a",fontSize:12,boxSizing:"border-box",overflow:"hidden",
                transform:`translateY(${isDragging?dragOffset:shift*itemHeight}px)`,
                transition:isDragging?"none":"transform 0.2s",
                zIndex:isDragging?10:1,
                boxShadow:isDragging?"0 4px 20px rgba(0,0,0,0.15)":"none",
                position:"relative",userSelect:"none",touchAction:"none"}}>
              {/* Drag handle */}
              <div style={{display:"flex",flexDirection:"column",gap:2,marginRight:10,flexShrink:0,opacity:0.3}}>
                <div style={{width:14,height:2,background:"#999",borderRadius:1}}/>
                <div style={{width:14,height:2,background:"#999",borderRadius:1}}/>
                <div style={{width:14,height:2,background:"#999",borderRadius:1}}/>
              </div>
              <div style={{width:24,height:24,borderRadius:12,background:"#000",color:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:11,flexShrink:0,marginRight:8}}>{i+1}</div>
              <div style={{flex:1,fontSize:14,fontFamily:FB,lineHeight:1.3,minWidth:0,wordBreak:"break-word"}}>{p.text}</div>
              <div style={{width:10,height:10,borderRadius:5,background:catColor[p.category],flexShrink:0,marginLeft:8}}/>
            </div>);
          })}
        </div>
        <div style={{display:"flex",gap:12,marginTop:8,justifyContent:"center"}}>
          {[["safety","#E3000B"],["operational","#FFD300"],["cosmetic","#999"]].map(([l,c])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}><div style={{width:8,height:8,borderRadius:4,background:c}}/>{l.toUpperCase()}</div>
          ))}
        </div>
        <button style={{...BY,width:"100%",marginTop:16}} onClick={()=>setShowConfirm(true)}>SUBMIT RANKING</button>
        {showConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:24,maxWidth:320,width:"100%",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,fontFamily:FC,marginBottom:8}}>ARE YOU SURE?</div>
              <p style={{fontSize:14,color:"#666",marginBottom:20}}>Once submitted, you can't change your ranking.</p>
              <div style={{display:"flex",gap:12}}>
                <button style={{...BO,flex:1,minWidth:0}} onClick={()=>setShowConfirm(false)}>GO BACK</button>
                <button style={{...BY,flex:1,minWidth:0}} onClick={()=>{setShowConfirm(false);setScreen(3);}}>CONFIRM</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    {screen===3&&(
      <div style={{padding:"16px 16px 24px"}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,marginBottom:12,textAlign:"center",color:"#000"}}>YOUR RANKING VS EXPERT</div>
        {ranking.map((p,i)=>{const expertIdx=EXPERT_ORDER.indexOf(p.id);const diff=Math.abs(i-expertIdx);const color=diff<=1?"#007A33":diff<=3?"#FFD300":"#E3000B";
          const otherRankings=batchComps.filter(c=>c.submission?.ranking).map(c=>{const r=c.submission.ranking;return r.indexOf(p.id);}).filter(x=>x>=0);
          const avg=otherRankings.length?Math.round(otherRankings.reduce((a,b)=>a+b,0)/otherRankings.length)+1:null;
          return(
          <div key={p.id} style={{display:"flex",alignItems:"center",padding:"10px 12px",background:"#fff",border:"1px solid #e8e8e3",borderRadius:10,marginBottom:4}}>
            <div style={{width:24,height:24,borderRadius:12,background:color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:12,flexShrink:0,marginRight:8}}>{i+1}</div>
            <div style={{flex:1,fontSize:14,fontFamily:FB,lineHeight:1.3,color:"#555"}}>{p.text}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:6}}>
              {avg!==null&&<span style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#bbb"}}>AVG:{avg}</span>}
              <span style={{fontSize:11,fontFamily:FC,fontWeight:700,color,letterSpacing:0.5}}>{diff===0?"EXACT":diff<=1?"CLOSE":diff<=3?"OFF":diff+"+ OFF"}</span>
            </div>
          </div>
        );})}
        <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginTop:12,marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{accuracy}%</div>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>ACCURACY</div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#fff",marginTop:8}}>{earnedPts} PTS EARNED</div>
          {(isTop3||accuracy>=bonusThresh)&&<div style={{fontSize:14,fontFamily:FC,fontWeight:800,color:"#FFD300",marginTop:8,padding:"6px 12px",background:"rgba(255,211,0,0.15)",borderRadius:8,display:"inline-block"}}>BONUS EARNED +{ch.bonusPoints} PTS{isTop3?` (Top ${topN} in batch)`:` (${accuracy}%+ accuracy)`}</div>}
          {!isTop3&&accuracy<bonusThresh&&<div style={{fontSize:13,fontFamily:FC,fontWeight:600,color:"#999",marginTop:4}}>Bonus requires {bonusThresh}%+ accuracy or top {topN} in batch</div>}
        </div>
        <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>setScreen(4)}>CONTINUE</button>
      </div>
    )}
    {screen===4&&(
      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,color:"#000"}}>PREVENTION QUESTION</div>
        <div style={{fontFamily:FB,fontSize:15,color:"#555",lineHeight:1.6}}>What's one thing that would have prevented this shift from getting to this point? Be specific about when it should have happened and who should have done it.</div>
        <textarea style={{width:"100%",padding:16,background:"#fff",border:"1px solid #e0e0db",borderRadius:12,color:"#1a1a1a",fontSize:15,fontFamily:FB,outline:"none",height:120,resize:"vertical",boxSizing:"border-box"}} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Your response..."/>
        <button style={{...BY,width:"100%",fontSize:17,opacity:answer.trim()?"1":"0.5"}} disabled={!answer.trim()} onClick={()=>{const matchedTop5=ranking.slice(0,5).filter(p=>EXPERT_ORDER.indexOf(p.id)<5).length;onS({text:answer,ranking:ranking.map(p=>p.id),distanceFromExpert:totalDistance,accuracy,earnedBadge:isTop3,matchedTop5,claimedBonus:isTop3||accuracy>=bonusThresh,autoBonus:isTop3||accuracy>=bonusThresh,points:earnedPts});}}>SUBMIT</button>
      </div>
    )}
  </div>
);}

// ─── SPOT THE MOMENT (LE Week 1) ─────────────────────────────────────────────
const SHOT_LIST=[
  {day:1,prompt:"The first thing a guest sees when they walk in"},
  {day:2,prompt:"The menu board from where a guest stands to decide"},
  {day:3,prompt:"The pickup area when it's busy"},
  {day:4,prompt:"The dining area from the best seat in the house"},
  {day:5,prompt:"The thing you walk past every shift but guests notice immediately"},
];
const SWIPE_WORDS=["welcoming","messy","warm","flat","busy","alive","ignored","clean"];
const DEFAULT_SEED_PHOTOS=[
  {id:"sp1",url:"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",caption:"Restaurant entrance - warm lighting"},
  {id:"sp2",url:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",caption:"Dining area - busy evening"},
  {id:"sp3",url:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",caption:"Counter pickup area"},
  {id:"sp4",url:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",caption:"Menu board view"},
  {id:"sp5",url:"https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&q=80",caption:"Kitchen pass - plating up"},
];

function SwipeCard({photo,caption,onSwipe,cardIdx,total}){
  const cardRef=useRef(null);
  const startX=useRef(0);const startY=useRef(0);const dx=useRef(0);const dragging=useRef(false);
  const[offset,setOffset]=useState(0);
  const[opacity,setOpacity]=useState(1);
  const[exiting,setExiting]=useState(null);// "left"|"right"|null
  const threshold=80;

  const onStart=(x)=>{startX.current=x;dragging.current=true;};
  const onMove=(x)=>{if(!dragging.current)return;dx.current=x-startX.current;setOffset(dx.current);};
  const onEnd=()=>{
    if(!dragging.current)return;dragging.current=false;
    if(Math.abs(dx.current)>threshold){
      const dir=dx.current>0?"right":"left";
      setExiting(dir);setOffset(dir==="right"?400:-400);setOpacity(0);
      setTimeout(()=>onSwipe(dir),250);
    }else{setOffset(0);}
    dx.current=0;
  };

  const rot=offset*0.08;
  const showLeft=offset<-20;const showRight=offset>20;

  if(exiting)return(
    <div style={{position:"relative",height:380,transition:"all 0.25s ease-out",transform:`translateX(${offset}px) rotate(${rot}deg)`,opacity}}>
      <div style={{width:"100%",height:"100%",borderRadius:20,overflow:"hidden",background:"#222"}}>
        <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </div>
    </div>
  );

  return(
    <div ref={cardRef} style={{position:"relative",height:380,transform:`translateX(${offset}px) rotate(${rot}deg)`,transition:dragging.current?"none":"transform 0.2s ease-out",cursor:"grab",userSelect:"none",touchAction:"none"}}
      onTouchStart={e=>onStart(e.touches[0].clientX)}
      onTouchMove={e=>onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={e=>{onStart(e.clientX);const mm=ev=>onMove(ev.clientX);const mu=()=>{onEnd();window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);};window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);}}>
      {/* Card */}
      <div style={{width:"100%",height:"100%",borderRadius:20,overflow:"hidden",background:"#222",boxShadow:"0 8px 30px rgba(0,0,0,0.15)",position:"relative"}}>
        <img src={photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        {/* Overlay labels */}
        {showRight&&<div style={{position:"absolute",top:24,left:20,padding:"8px 18px",border:"3px solid #007A33",borderRadius:10,color:"#007A33",fontFamily:FC,fontWeight:900,fontSize:22,letterSpacing:2,transform:"rotate(-15deg)",background:"rgba(255,255,255,0.85)"}}>COME BACK</div>}
        {showLeft&&<div style={{position:"absolute",top:24,right:20,padding:"8px 18px",border:"3px solid #E3000B",borderRadius:10,color:"#E3000B",fontFamily:FC,fontWeight:900,fontSize:22,letterSpacing:2,transform:"rotate(15deg)",background:"rgba(255,255,255,0.85)"}}>NOPE</div>}
        {/* Caption bar */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.7))",padding:"40px 20px 20px"}}>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#fff"}}>{caption}</div>
          <div style={{fontFamily:FB,fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4}}>{cardIdx+1} of {total}</div>
        </div>
      </div>
    </div>
  );
}

function SpotTheMoment({ch,done,onS,onB,user,comps:myComps,actCfg}){const[users,setUsers]=useState([]);const[comps,setLocalComps]=useState(myComps||[]);useEffect(()=>{Promise.all([getUsersByBatch(user.batch),getCompletionsByBatch(user.batch)]).then(([u,c])=>{setUsers(u);setLocalComps(c);});},[user.batch]);
  const[phase,setPhase]=useState("intro");// intro | upload | swipe | word | reveal | done
  const[photos,setPhotos]=useState([null,null,null,null,null]);const[submitting,setSubmitting]=useState(false);
  const[swipeIdx,setSwipeIdx]=useState(0);
  const[swipes,setSwipes]=useState([]);
  const[lastDir,setLastDir]=useState(null);
  const[animPts,setAnimPts]=useState(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);
  const uploadCount=photos.filter(Boolean).length;

  // Get photos to swipe - seed photos from admin + other users' photos
  const seedPhotos=(actCfg?.spot_the_moment?.seedPhotos||DEFAULT_SEED_PHOTOS).map(p=>({photo:p.url||p.photo,caption:p.caption||"",userId:"seed",idx:p.id}));
  const userPhotos=(comps||[]).filter(c=>c.challengeId===ch.id&&c.batch===user.batch&&c.userId!==user.id&&c.submission?.photos).flatMap(c=>(c.submission.photos||[]).filter(Boolean).map((p,i)=>({photo:p,caption:`Photo by ${(users||[]).find(u=>u.id===c.userId)?.name||"teammate"}`,userId:c.userId,idx:i})));
  const allSwipePhotos=[...seedPhotos,...userPhotos];

  const compressPhoto=(file)=>new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,1600/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",0.85));};img.src=URL.createObjectURL(file);});
  const uploadPhotos=async(photoArr)=>{const urls=[];for(let i=0;i<photoArr.length;i++){if(!photoArr[i])continue;try{const resp=await fetch(photoArr[i]);const blob=await resp.blob();const path=`images/${user.id}/${ch.id}_photo${i}_${Date.now()}.jpg`;const url=await uploadFile(blob,path);urls[i]=url;}catch(e){console.error("Photo upload failed:",e);urls[i]=photoArr[i];}}return urls;};

  const handleSwipe=(dir)=>{
    const card=allSwipePhotos[swipeIdx];
    const newSwipe={...card,right:dir==="right",word:null};
    setSwipes(p=>[...p,newSwipe]);
    setLastDir(dir);
    setPhase("word");
  };

  const handleWord=(w)=>{
    const ns=[...swipes];ns[ns.length-1].word=w;setSwipes(ns);
    setLastDir(null);
    const nextIdx=swipeIdx+1;
    if(nextIdx>=allSwipePhotos.length){setSwipeIdx(nextIdx);setPhase("reveal");}
    else{setSwipeIdx(nextIdx);setPhase("swipe");}
  };

  // Calculate bonus - per photo: each photo that passes peer review earns points (up to 50 total)
  const maxBonus=ch.bonusPoints||50;
  const perPhotoPts=maxBonus/5; // 10 pts per photo if 50 total
  const myPhotoSwipes=(comps||[]).filter(c=>c.challengeId===ch.id&&c.submission?.swipeResults).flatMap(c=>c.submission.swipeResults.filter(s=>s.userId===user.id));
  // Group swipes by photo index
  const photoResults=[0,1,2,3,4].map(i=>{const ps=myPhotoSwipes.filter(s=>s.idx===i);const total=ps.length;const comeBack=ps.filter(s=>s.right).length;const rate=total>0?Math.round(comeBack/total*100):0;return{total,comeBack,rate,passed:rate>=60};});
  const passedCount=photoResults.filter(p=>p.passed).length;
  const earnedBonusPts=Math.round(passedCount*perPhotoPts);
  const earnedBonus=earnedBonusPts>0;
  const approvalRate=myPhotoSwipes.length>0?Math.round(myPhotoSwipes.filter(s=>s.right).length/myPhotoSwipes.length*100):0;
  const bonusPts=maxBonus;

  const shotList=actCfg?.spot_the_moment?.shotList||SHOT_LIST;
  const swipeWords=actCfg?.spot_the_moment?.words||SWIPE_WORDS;

  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setPhase("upload")} startLabel="START CHALLENGE"/>;

  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>

    {/* Phase 1: Upload photos */}
    {phase==="upload"&&(<div style={{padding:"24px 20px"}}>
      <h2 style={{fontFamily:FC,fontWeight:900,fontSize:26,textAlign:"center",margin:"0 0 4px",letterSpacing:1}}>YOUR 5 SHOTS</h2>
      <p style={{textAlign:"center",color:"#888",fontSize:14,fontFamily:FB,marginBottom:20}}>Capture what guests really see at your restaurant</p>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>{shotList.map((_,i)=>(<div key={i} style={{width:12,height:12,borderRadius:6,background:photos[i]?"#007A33":"#ddd",transition:"background 0.3s"}}/>))}</div>
      {shotList.map((shot,i)=>{const hasPhoto=!!photos[i];return(
        <div key={i} style={{background:hasPhoto?"#f0f8f0":"#fff",border:hasPhoto?"1px solid #d4e8d4":"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:10,transition:"all 0.3s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:0.5}}>PHOTO {i+1}</div><div style={{fontSize:14,color:"#555",marginTop:4,fontFamily:FB}}>{shot.prompt}</div></div>
            {hasPhoto?<div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,marginLeft:12,position:"relative"}}>
              <img src={photos[i]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <button onClick={()=>{const np=[...photos];np[i]=null;setPhotos(np);}} style={{position:"absolute",top:-4,right:-4,width:20,height:20,borderRadius:10,background:"#E3000B",color:"#fff",border:"none",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
            </div>
            :<label style={{...BY,padding:"12px 20px",fontSize:14,minWidth:0,cursor:"pointer",flexShrink:0,marginLeft:12,letterSpacing:1}}>
              SNAP<input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const b=await compressPhoto(f);const np=[...photos];np[i]=b;setPhotos(np);}}/>
            </label>}
          </div>
        </div>
      );})}
      {uploadCount>=5&&(<button style={{...BY,width:"100%",marginTop:16,opacity:submitting?0.6:1}} disabled={submitting} onClick={async()=>{if(allSwipePhotos.length>0){setPhase("swipe");}else{setSubmitting(true);const urls=await uploadPhotos(photos);setSubmitting(false);onS({text:"Spot the Moment - photos uploaded",photos:urls,claimedBonus:false,autoBonus:false,points:ch.points});}}}>{ submitting?"UPLOADING PHOTOS...":"START THE SWIPE GAME ("+allSwipePhotos.length+" photos to review)"}</button>)}
      {uploadCount<5&&uploadCount>0&&<div style={{textAlign:"center",fontSize:12,color:"#999",fontFamily:FC,marginTop:8}}>{5-uploadCount} more to go</div>}
      {uploadCount>=5&&allSwipePhotos.length===0&&<div style={{textAlign:"center",fontSize:12,color:"#E3000B",fontFamily:FC,marginTop:8}}>No photos available to swipe yet - check back later or ask admin to add seed photos</div>}
    </div>)}

    {/* Phase 2: Swipe cards */}
    {phase==="swipe"&&swipeIdx<allSwipePhotos.length&&(<div style={{padding:"24px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999"}}>{swipeIdx+1}/{allSwipePhotos.length}</div>
        <div style={{height:4,flex:1,marginLeft:12,background:"#e8e8e3",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:"#FFD300",borderRadius:2,width:`${(swipeIdx/allSwipePhotos.length)*100}%`,transition:"width 0.3s"}}/></div>
      </div>
      <SwipeCard photo={allSwipePhotos[swipeIdx].photo} caption={allSwipePhotos[swipeIdx].caption} onSwipe={handleSwipe} cardIdx={swipeIdx} total={allSwipePhotos.length}/>
      <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:20}}>
        <button onClick={()=>handleSwipe("left")} style={{width:60,height:60,borderRadius:30,border:"2px solid #E3000B",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button onClick={()=>handleSwipe("right")} style={{width:60,height:60,borderRadius:30,border:"2px solid #007A33",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
      </div>
      <div style={{textAlign:"center",marginTop:12,fontSize:12,fontFamily:FC,fontWeight:600,color:"#bbb"}}>SWIPE OR TAP</div>
    </div>)}

    {/* Phase 3: Pick a word */}
    {phase==="word"&&(<div style={{padding:"24px 20px",textAlign:"center"}}>
      <div style={{marginBottom:12}}>{lastDir==="right"
        ?<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        :<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>}</div>
      <div style={{fontFamily:FC,fontWeight:900,fontSize:20,marginBottom:4,color:lastDir==="right"?"#007A33":"#E3000B"}}>{lastDir==="right"?"I'D COME BACK":"WOULDN'T COME BACK"}</div>
      <div style={{fontSize:14,color:"#888",fontFamily:FB,marginBottom:24}}>Now pick one word that describes this photo</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {swipeWords.map(w=>(<button key={w} className="btn-hover" onClick={()=>handleWord(w)} style={{padding:"14px",borderRadius:12,border:"1px solid #e8e8e3",background:"#fff",fontFamily:FC,fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s"}}>{w}</button>))}
      </div>
    </div>)}

    {/* Phase 4: Results */}
    {phase==="reveal"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:8}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:26,letterSpacing:0.5,color:"#000"}}>SWIPE RESULTS</div>
        <div style={{fontSize:14,color:"#999",fontFamily:FC,fontWeight:600,marginTop:4,letterSpacing:0.5}}>You swiped on {swipes.length} photos</div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{fontSize:32,fontFamily:F107,fontWeight:900,color:"#007A33"}}>{swipes.filter(s=>s.right).length}</div>
          <div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#999",marginTop:4}}>COME BACK</div>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{fontSize:32,fontFamily:F107,fontWeight:900,color:"#E3000B"}}>{swipes.filter(s=>!s.right).length}</div>
          <div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#999",marginTop:4}}>NOPE</div>
        </div>
      </div>

      {/* Word cloud */}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginBottom:24}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300",letterSpacing:0.5,marginBottom:12}}>YOUR WORD PICKS</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {Object.entries(swipes.reduce((a,s)=>{if(s.word){a[s.word]=(a[s.word]||0)+1;}return a;},{})).sort((a,b)=>b[1]-a[1]).map(([w,c])=>(
            <span key={w} style={{padding:"7px 14px 6px",borderRadius:20,lineHeight:1,background:"rgba(255,211,0,0.15)",color:"#FFD300",fontFamily:FC,fontWeight:700,fontSize:c>2?16:13}}>{w} ({c})</span>
          ))}
        </div>
      </div>

      {/* Chain effect info - per photo breakdown */}
      <div style={{background:"#f0f8f0",border:"1px solid #d4e8d4",borderRadius:14,padding:16,marginBottom:24}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#007A33",marginBottom:6}}>CHAIN EFFECT - BONUS POINTS</div>
        <div style={{fontSize:13,color:"#555",fontFamily:FB,lineHeight:1.5,marginBottom:12}}>Your photos are now in the deck for others to swipe. Each photo that 60%+ of swipers say "come back" to earns you +{Math.round(perPhotoPts)} bonus points (up to +{maxBonus} total).</div>
        {myPhotoSwipes.length>0&&(<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:8}}>
            {photoResults.map((pr,i)=>(<div key={i} style={{textAlign:"center",background:pr.total===0?"#f5f5f0":pr.passed?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",borderRadius:8,padding:"8px 4px"}}>
              <div style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#999",marginBottom:2}}>PHOTO {i+1}</div>
              {pr.total>0?<div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:pr.passed?"#007A33":"#E3000B"}}>{pr.rate}%</div>:<div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#bbb"}}>PENDING</div>}
              {pr.total>0&&<div style={{fontFamily:FC,fontWeight:700,fontSize:10,color:pr.passed?"#007A33":"#E3000B"}}>{pr.passed?`+${Math.round(perPhotoPts)}`:"0 PTS"}</div>}
            </div>))}
          </div>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:earnedBonus?"#007A33":"#888"}}>Total bonus: +{earnedBonusPts} / {maxBonus} PTS ({passedCount}/5 photos passed)</div>
        </div>)}
      </div>

      <button style={{...BY,width:"100%",fontSize:17,opacity:submitting?0.6:1}} disabled={submitting} onClick={async()=>{
        setSubmitting(true);const urls=await uploadPhotos(photos);setSubmitting(false);
        onS({text:"Spot the Moment completed",photos:urls,swipeResults:swipes,comeBackCount:swipes.filter(s=>s.right).length,nopeCount:swipes.filter(s=>!s.right).length,wordPicks:swipes.map(s=>s.word).filter(Boolean),claimedBonus:earnedBonus,autoBonus:earnedBonus,bonusPoints:earnedBonusPts,points:ch.points,pendingApproval:passedCount<5&&myPhotoSwipes.length<10,bonusApproved:earnedBonus?true:null,photoResults});
      }}>{submitting?"UPLOADING PHOTOS...":"SUBMIT CHALLENGE"}</button>
    </div>)}
  </div>);
}

// ─── THE 30-SECOND SELL (LE Week 2) ──────────────────────────────────────────
const SELL_ITEMS=[
  {id:"item_1",name:"Chicken Burrito",day:1},
  {id:"item_2",name:"Pulled Pork Bowl",day:3},
  {id:"item_3",name:"Chips & Guac",day:5},
];
function ThirtySecondSell({ch,done,onS,onB,user,actCfg}){
  const sellItems=actCfg?.thirty_second_sell?.items||SELL_ITEMS;
  const recDuration=actCfg?.thirty_second_sell?.timer||30;
  const[currentItem,setCurrentItem]=useState(0);
  const[phase,setPhase]=useState("intro");// intro | ready | countdown | recording | uploading | done
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);
  const[timer,setTimer]=useState(recDuration);
  const[countdown,setCountdown]=useState(3);
  const[items,setItems]=useState([]);
  const[uploading,setUploading]=useState(false);
  const videoRef=useRef(null);
  const mediaRef=useRef(null);
  const chunksRef=useRef([]);
  const timerRef=useRef(null);
  const streamRef=useRef(null);

  useEffect(()=>{if(phase==="countdown"&&countdown>0){const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);}if(phase==="countdown"&&countdown===0){setPhase("recording");startCamera();}},[phase,countdown]);
  useEffect(()=>{if(phase==="recording"&&timer>0){timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current);stopRecording();return 0;}return t-1;}),1000);return()=>clearInterval(timerRef.current);}},[phase]);
  useEffect(()=>()=>{if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());},[]);

  const startCamera=async()=>{
    try{
      const camDir=actCfg?.thirty_second_sell?.camera||"user";
      const res=actCfg?.thirty_second_sell?.resolution||360;
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:camDir,width:{ideal:res},height:{ideal:Math.round(res*16/9)}},audio:true});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
      chunksRef.current=[];
      const mr=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"});
      mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      mr.onstop=()=>{setUploading(true);setTimeout(()=>handleUpload(),500);};
      mr.start(100);
      mediaRef.current=mr;
    }catch(err){console.error("Camera error:",err);setPhase("ready");}
  };

  const stopRecording=()=>{
    if(mediaRef.current&&mediaRef.current.state!=="inactive")mediaRef.current.stop();
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;
  };

  const handleUpload=async()=>{
    const blob=new Blob(chunksRef.current,{type:"video/webm"});
    const newItem={itemId:sellItems[currentItem].id,itemName:sellItems[currentItem].name,duration:recDuration-timer,size:blob.size,recorded:true,recordedAt:new Date().toISOString()};
    try{
      const path=`videos/${user.id}/sell_${sellItems[currentItem].id}_${Date.now()}.webm`;
      const url=await uploadFile(blob,path);
      newItem.videoUrl=url;newItem.videoPath=path;
    }catch(e){console.error("Video upload failed:",e);newItem.uploadError=true;}
    const newItems=[...items,newItem];
    setItems(newItems);
    setUploading(false);
    if(currentItem<sellItems.length-1){setCurrentItem(c=>c+1);setPhase("ready");setTimer(recDuration);}
    else{onS({text:"The 30-Second Sell completed",items:newItems,videoCount:newItems.length,claimedBonus:false,autoBonus:false,points:ch.points});}
  };

  const beginRecording=()=>{setCountdown(3);setTimer(recDuration);setPhase("countdown");};

  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setPhase("ready")} startLabel="START RECORDING"/>;

  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px"}}>
      {phase==="ready"&&currentItem<sellItems.length&&(<div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>{sellItems.map((_,i)=>(<div key={i} style={{width:12,height:12,borderRadius:6,background:i<currentItem?"#007A33":i===currentItem?"#FFD300":"#ddd"}}/>))}</div>
        <div style={{background:"#000",borderRadius:16,padding:24,textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:14,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:1,marginBottom:8}}>ITEM {currentItem+1} OF {sellItems.length}</div>
          <div style={{fontSize:28,fontFamily:F107,fontWeight:900,color:"#fff"}}>{sellItems[currentItem].name.toUpperCase()}</div>
          <div style={{fontSize:14,color:"#888",marginTop:8}}>You have {recDuration} seconds to sell it on camera</div>
        </div>
        <div style={{background:"#f8f8f5",borderRadius:12,padding:14,marginBottom:20,fontSize:13,color:"#666",fontFamily:FB,lineHeight:1.5}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:6}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          Your front camera will open. Recording starts automatically after the countdown and stops at 0. The video uploads for admin review - no redo.
        </div>
        <button style={{...BY,width:"100%"}} onClick={beginRecording}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:8}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
          START RECORDING
        </button>
      </div>)}

      {phase==="countdown"&&(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column"}}>
        <div style={{fontSize:120,fontWeight:900,fontFamily:F107,color:countdown>0?"#FFD300":"#007A33"}}>{countdown>0?countdown:"GO!"}</div>
        <div style={{fontSize:16,fontFamily:FC,fontWeight:700,color:"#888",marginTop:12}}>SELL: {sellItems[currentItem].name.toUpperCase()}</div>
      </div>)}

      {phase==="recording"&&(<div>
        {/* Live camera preview */}
        <div style={{borderRadius:16,overflow:"hidden",marginBottom:16,position:"relative",background:"#000"}}>
          <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:320,objectFit:"cover",transform:"scaleX(-1)"}}/>
          <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:6,background:"rgba(227,0,11,0.9)",padding:"6px 12px",borderRadius:20}}>
            <div style={{width:8,height:8,borderRadius:4,background:"#fff",animation:"pulse 1s infinite"}}/>
            <span style={{fontSize:12,fontFamily:FC,fontWeight:800,color:"#fff",letterSpacing:1}}>REC</span>
          </div>
          <div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.7)",padding:"7px 14px 6px",borderRadius:20,lineHeight:1}}>
            <span style={{fontSize:18,fontWeight:900,fontFamily:FG,color:timer<=5?"#E3000B":timer<=10?"#FFD300":"#fff"}}>{timer}s</span>
          </div>
        </div>
        <div style={{fontSize:18,fontFamily:FC,fontWeight:800,textAlign:"center",color:"#555",marginBottom:8}}>SELL: {sellItems[currentItem].name.toUpperCase()}</div>
        <div style={{textAlign:"center",fontSize:12,color:"#999",fontFamily:FB}}>Recording stops automatically at 0</div>
      </div>)}

      {uploading&&(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column"}}>
        <div style={{width:48,height:48,border:"4px solid #e8e8e3",borderTop:"4px solid #FFD300",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:16}}/>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:16,letterSpacing:1}}>UPLOADING VIDEO...</div>
        <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:6}}>Item {currentItem+1} of 3</div>
      </div>)}
    </div>
  </div>);
}

// ─── THE RECOVERY RACE (LE Week 3) ──────────────────────────────────────────
const RECOVERY_SCENARIOS=[
  {id:"s1",title:"The Wrong Order",setup:"A guest approaches the counter holding a burrito bowl. They ordered a burrito. They look annoyed but not angry - yet.",
    decisions:[
      {situation:"The guest says: 'This isn't what I ordered. I asked for a burrito, not a bowl.'",timer:8,options:[
        {id:"a",text:"Apologise and immediately offer to remake it",outcome:"good",next:"The guest relaxes slightly. 'Okay, thanks. How long will it be?'"},
        {id:"b",text:"Check the receipt to verify what they ordered",outcome:"neutral",next:"The guest crosses their arms. 'I know what I ordered.'"},
        {id:"c",text:"Explain that the bowl has the same ingredients",outcome:"bad",next:"The guest's voice rises. 'I don't care about the ingredients.'"}]},
      {situation:null,timer:8,options:[
        {id:"a",text:"Give a time estimate and offer a free drink while they wait",outcome:"good",next:"The guest nods. 'That's fair. Thanks for sorting it.'"},
        {id:"b",text:"Rush the kitchen to prioritise their order",outcome:"neutral",next:"The remake comes out fast but the guest noticed you yelling."},
        {id:"c",text:"Ask them to wait without giving a timeframe",outcome:"bad",next:"The guest checks their watch. 'I've got 10 minutes.'"}]},
      {situation:null,timer:8,options:[
        {id:"a",text:"Thank them for patience and hand-deliver the correct order",outcome:"good",next:"The guest smiles. 'Appreciate that. Mistakes happen.'"},
        {id:"b",text:"Have another crew member deliver it",outcome:"neutral",next:"The guest gets their food but there's no closure."},
        {id:"c",text:"Call their name from the counter",outcome:"bad",next:"The guest shakes their head as they pick it up."}]},
      {situation:null,timer:8,options:[
        {id:"a",text:"Ask if everything's right and wish them a good day",outcome:"good",next:"The guest says they'll be back. Recovery complete."},
        {id:"b",text:"Move on to the next guest",outcome:"neutral",next:"The guest leaves without saying anything."},
        {id:"c",text:"Avoid eye contact and hope they leave happy",outcome:"bad",next:"The guest posts a 2-star review that night."}]}
    ],resultGood:{guest:"Leaves happy",cpt:"-0.2"},resultBad:{guest:"Posts negative review",cpt:"+1.5"}},
  {id:"s2",title:"The Long Wait",setup:"Drive-thru. A car has been waiting 9 minutes. The driver walks inside. They look furious.",
    decisions:[
      {situation:"'Nine minutes in a drive-thru. Nine. I could have gone anywhere else.'",timer:7,options:[
        {id:"a",text:"'You're right, that's too long. I'm sorry.'",outcome:"good",next:"The guest exhales. Still angry but feels heard."},
        {id:"b",text:"Explain that you're short-staffed today",outcome:"bad",next:"'That's not my problem. I'm the customer.'"},
        {id:"c",text:"Ask for their order number to check on it",outcome:"neutral",next:"The guest sighs impatiently."}]},
      {situation:null,timer:7,options:[
        {id:"a",text:"Offer the meal on the house and check the kitchen",outcome:"good",next:"The guest pauses. 'Alright. I appreciate that.'"},
        {id:"b",text:"Promise to have it out in 2 minutes",outcome:"neutral",next:"Two minutes pass. Then three."},
        {id:"c",text:"Point out that other people are waiting too",outcome:"bad",next:"The guest raises their voice. Others are watching."}]},
      {situation:null,timer:7,options:[
        {id:"a",text:"Bring the food out yourself, make eye contact, thank them",outcome:"good",next:"'Thanks. It's been a rough one.'"},
        {id:"b",text:"Call their name from the counter",outcome:"neutral",next:"They grab the food and leave."},
        {id:"c",text:"Let the kitchen slide it across",outcome:"bad",next:"The guest shakes their head."}]},
      {situation:null,timer:7,options:[
        {id:"a",text:"Walk them to the door, thank them again",outcome:"good",next:"You might have saved a regular."},
        {id:"b",text:"Say 'have a good day'",outcome:"neutral",next:"Standard exit."},
        {id:"c",text:"Turn to the next customer immediately",outcome:"bad",next:"Nobody noticed them go."}]}
    ],resultGood:{guest:"Comes back next week",cpt:"-0.5"},resultBad:{guest:"Never comes back",cpt:"+2.0"}},
  {id:"s3",title:"The Allergy Scare",setup:"A guest rushes back. 'I said NO dairy. There's cheese all over this. My daughter is lactose intolerant.'",
    decisions:[
      {situation:"The guest is panicking. Their daughter hasn't eaten any yet.",timer:6,options:[
        {id:"a",text:"Take the bowl immediately - 'Let me get that away and make a new one.'",outcome:"good",next:"'Thank god she didn't eat it.'"},
        {id:"b",text:"Check the ticket to see what was ordered",outcome:"bad",next:"'Don't check the ticket - get the food away!'"},
        {id:"c",text:"Offer to scrape the cheese off",outcome:"bad",next:"'Are you serious? That's not how allergies work!'"}]},
      {situation:null,timer:6,options:[
        {id:"a",text:"Personally make the new order, confirm every ingredient",outcome:"good",next:"'Thank you for taking this seriously.'"},
        {id:"b",text:"Send the order back to the kitchen with a note",outcome:"neutral",next:"The guest can't see it being made and is anxious."},
        {id:"c",text:"Assure them it will be fine this time",outcome:"bad",next:"'How can I trust that?'"}]},
      {situation:null,timer:6,options:[
        {id:"a",text:"Comp the meal and apologise to both parent and child",outcome:"good",next:"The daughter is eating happily. The parent relaxes."},
        {id:"b",text:"Offer a discount on the next visit",outcome:"neutral",next:"'If there is a next visit.'"},
        {id:"c",text:"Explain that the kitchen is very busy today",outcome:"bad",next:"'Busy is not an excuse for my daughter's health.'"}]},
      {situation:null,timer:6,options:[
        {id:"a",text:"Brief the kitchen immediately on the allergen miss",outcome:"good",next:"You've prevented the next one. That's leadership."},
        {id:"b",text:"Make a mental note for next pre-shift",outcome:"neutral",next:"You'll probably forget."},
        {id:"c",text:"Move on - it's handled",outcome:"bad",next:"Same mistake happens next Tuesday."}]}
    ],resultGood:{guest:"Posts thanking the restaurant",cpt:"-1.0"},resultBad:{guest:"Reports to food authority",cpt:"+3.0"}},
];
function RecoveryRace({ch,done,onS,onB,user,actCfg}){
  const scenarios=actCfg?.recovery_race?.scenarios||RECOVERY_SCENARIOS;
  const bonusThreshold=actCfg?.recovery_race?.bonusThreshold||75;
  const decisionTimerDefault=actCfg?.recovery_race?.decisionTimer||8;
  const[screen,setScreen]=useState("intro");// intro | play | result | complete
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);
  const[scenIdx,setScenIdx]=useState(0);
  const[decIdx,setDecIdx]=useState(0);
  const[decTimer,setDecTimer]=useState(0);
  const[choices,setChoices]=useState([]);
  const[allResults,setAllResults]=useState([]);
  const[lastOutcome,setLastOutcome]=useState(null);
  const timerRef=useRef(null);
  const scen=scenarios[scenIdx]||null;
  const dec=scen?.decisions[decIdx]||null;
  useEffect(()=>{if(screen==="play"&&dec&&decTimer>0&&!lastOutcome){timerRef.current=setInterval(()=>setDecTimer(t=>{if(t<=1){clearInterval(timerRef.current);return 0;}return t-1;}),1000);return()=>clearInterval(timerRef.current);}return()=>clearInterval(timerRef.current);},[screen,decIdx,decTimer,lastOutcome]);
  // Auto-fail when timer runs out
  useEffect(()=>{if(screen==="play"&&dec&&decTimer===0&&!lastOutcome){const worstOpt=dec.options.find(o=>o.outcome==="bad")||dec.options[dec.options.length-1];choose(worstOpt);}},[decTimer]);
  const choose=(opt)=>{clearInterval(timerRef.current);setDecTimer(0);setChoices(p=>[...p,opt.outcome]);setLastOutcome(opt);
    if(decIdx<(scen?.decisions.length||4)-1){setTimeout(()=>{setDecIdx(d=>d+1);const nextT=scen?.decisions[decIdx+1]?.timer||decisionTimerDefault;setDecTimer(nextT);setLastOutcome(null);},2000);}
    else{const goods=choices.filter(c=>c==="good").length+(opt.outcome==="good"?1:0);const total=choices.length+1;setAllResults(p=>[...p,{scenId:scen.id,title:scen.title,goods,total,score:Math.round(goods/total*100)}]);setTimeout(()=>setScreen("result"),2000);}};
  if(done)return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(screen==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>{setScreen("play");setDecTimer(scen?.decisions[0]?.timer||decisionTimerDefault);}} startLabel="START SCENARIO 1"/>;

  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {screen==="play"&&scen&&dec&&(<div style={{padding:"20px"}}>
      {/* Timer bar */}
      <div style={{background:"rgba(0,0,0,0.9)",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc",letterSpacing:0.5}}>{decIdx+1}/{scen.decisions.length}</span>
          <div style={{width:80,height:6,background:"#333",borderRadius:3}}><div style={{height:"100%",background:decTimer<=3?"#E3000B":decTimer<=5?"#FFD300":"#007A33",borderRadius:3,width:`${(decTimer/(dec.timer||decisionTimerDefault))*100}%`,transition:"width 1s linear"}}/></div>
        </div>
        {!lastOutcome&&<span style={{fontFamily:FG,fontWeight:900,fontSize:28,color:decTimer<=3?"#E3000B":decTimer<=5?"#FFD300":"#fff"}}>{decTimer}</span>}
        {lastOutcome&&<span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:lastOutcome.outcome==="good"?"#007A33":lastOutcome.outcome==="bad"?"#E3000B":"#FFB800",background:lastOutcome.outcome==="good"?"rgba(0,122,51,0.2)":lastOutcome.outcome==="bad"?"rgba(227,0,11,0.2)":"rgba(255,184,0,0.2)",padding:"5px 10px 4px",borderRadius:6,lineHeight:1}}>{lastOutcome.outcome==="good"?"GREAT CALL":lastOutcome.outcome==="neutral"?"OKAY":"POOR CHOICE"}</span>}
      </div>
      {/* Scenario title */}
      <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12}}>{scen.title.toUpperCase()}</div>
      {/* Situation card */}
      <div style={{...scenarioBox,marginBottom:16}}>
        <div style={{fontSize:16,lineHeight:1.6,fontFamily:FB}}>{lastOutcome?lastOutcome.next:(dec.situation||scen.setup)}</div>
      </div>
      {/* Options */}
      {!lastOutcome&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        {dec.options.map(opt=>(<button key={opt.id} onClick={()=>choose(opt)} style={optCard(false)}>{opt.text}</button>))}
      </div>)}
      {/* Outcome feedback */}
      {lastOutcome&&(<div style={{textAlign:"center",padding:20}}>
        {lastOutcome.outcome==="good"?<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>:lastOutcome.outcome==="neutral"?<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        <div style={{fontFamily:FC,fontWeight:800,fontSize:16,color:lastOutcome.outcome==="good"?"#007A33":lastOutcome.outcome==="bad"?"#E3000B":"#FFB800",marginTop:10}}>{lastOutcome.outcome==="good"?"GREAT CALL":lastOutcome.outcome==="bad"?"POOR CHOICE":"OKAY"}</div>
      </div>)}
      {/* Progress dots */}
      <div style={{display:"flex",gap:6,marginTop:16,justifyContent:"center"}}>{scen.decisions.map((_,i)=>(<div key={i} style={{width:10,height:10,borderRadius:5,background:i<decIdx?"#007A33":i===decIdx?"#FFD300":"#ddd",transition:"background 0.3s"}}/>))}</div>
    </div>)}
    {screen==="result"&&(<div style={{padding:"24px 20px"}}>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{allResults[allResults.length-1]?.score||0}%</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>RECOVERY SCORE</div>
      </div>
      {scenIdx<scenarios.length-1?(
        <button style={{...BY,width:"100%"}} onClick={()=>{setScenIdx(s=>s+1);setDecIdx(0);setChoices([]);setLastOutcome(null);setScreen("play");setDecTimer(scenarios[scenIdx+1]?.decisions[0]?.timer||decisionTimerDefault);}}>NEXT SCENARIO: {scenarios[scenIdx+1]?.title.toUpperCase()}</button>
      ):(
        <button style={{...BY,width:"100%"}} onClick={()=>setScreen("complete")}>VIEW FINAL RESULTS</button>
      )}
    </div>)}
    {screen==="complete"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:0.5,color:"#000"}}>RECOVERY RACE COMPLETE</div></div>
      {allResults.map((r,i)=>(<div key={i} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #e8e8e3"}}><div><div style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{r.title}</div><div style={{fontSize:14,color:"#555",fontFamily:FB}}>{r.goods}/{r.total} good choices</div></div><div style={{fontFamily:FC,fontWeight:900,fontSize:20,color:r.score>=75?"#007A33":r.score>=50?"#FFB800":"#E3000B"}}>{r.score}%</div></div>))}
      <div style={{textAlign:"center",marginTop:16}}><div style={{fontSize:16,fontFamily:FC,fontWeight:800,color:"#000"}}>AVG: {Math.round(allResults.reduce((s,r)=>s+r.score,0)/allResults.length)}%</div></div>
      {(()=>{const avg=Math.round(allResults.reduce((s,r)=>s+r.score,0)/allResults.length);const earnedPts=Math.round(ch.points*(avg/100));const bonusEarned=avg>=bonusThreshold;return(<>
        <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{earnedPts}<span style={{fontSize:14,color:"#999"}}>/{ch.points}</span></div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>ACCURACY</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:avg>=bonusThreshold?"#007A33":avg>=50?"#FFB800":"#E3000B",marginTop:4}}>{avg}%</div></div>
          </div>
          {bonusEarned&&<div style={{marginTop:10,padding:"8px 12px",background:"rgba(255,211,0,0.15)",borderRadius:8,fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",textAlign:"center"}}>BONUS EARNED +{ch.bonusPoints} PTS ({bonusThreshold}%+ accuracy)</div>}
          {!bonusEarned&&<div style={{marginTop:10,fontSize:13,color:"#999",fontFamily:FB,textAlign:"center"}}>{bonusThreshold}%+ accuracy needed for +{ch.bonusPoints} bonus</div>}
        </div>
        <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Recovery Race completed",scenarios:allResults,avgScore:avg,claimedBonus:bonusEarned,autoBonus:bonusEarned,points:earnedPts});}}>SUBMIT</button>
      </>);})()}
    </div>)}
  </div>);
}

// ─── WASTE NOTHING (LSE Week 3) ──────────────────────────────────────────────
const WASTE_CATEGORIES=["Protein","Salsa/Sauce","Rice/Beans","Wraps/Shells","Produce","Other"];
const WASTE_QUESTIONS=[
  {id:"q1",text:"What was the single biggest waste item tonight?",placeholder:"e.g. Grilled chicken - 1.2kg left over from the lunch prep"},
  {id:"q2",text:"Why did it happen?",placeholder:"e.g. Over-prepped for forecast - Tuesday lunch only did 140 transactions vs 180 forecast"},
  {id:"q3",text:"What specific action will you take, and when?",placeholder:"e.g. Check Power BI at 10am before the 11am prep call - adjust chicken prep down 20% on Tuesdays"},
];
function WasteAudit({ch,done,onS,onB,user}){
  const[step,setStep]=useState(0);// 0=intro, 1=log, 2=photos, 3=questions, 4=review
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[step]);
  const[items,setItems]=useState([]);const[newItem,setNewItem]=useState({name:"",category:"Protein",qty:"",unit:"kg"});
  const[photos,setPhotos]=useState({wastageSheet:null,pos:null});const[answers,setAnswers]=useState(["","",""]);
  const addItem=()=>{if(!newItem.name.trim()||!newItem.qty)return;setItems(p=>[...p,{...newItem,id:Date.now()}]);setNewItem({name:"",category:newItem.category,qty:"",unit:"kg"});};
  const compressImg=(file)=>new Promise(r=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,1600/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);r(c.toDataURL("image/jpeg",0.85));};img.src=URL.createObjectURL(file);});
  const[wasteSubmitting,setWasteSubmitting]=useState(false);
  const uploadB64=async(b64,name)=>{try{const resp=await fetch(b64);const blob=await resp.blob();const path=`images/${user.id}/${ch.id}_${name}_${Date.now()}.jpg`;return await uploadFile(blob,path);}catch(e){console.error("Photo upload failed:",e);return b64;}};
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(step===0)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setStep(1)} startLabel="START AUDIT"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px"}}>
      {/* Progress dots */}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>{[1,2,3,4].map(s=>(<div key={s} style={{width:12,height:12,borderRadius:6,background:s<step?"#007A33":s===step?"#FFD300":"#ddd"}}/>))}</div>

      {/* Step 1: Wastage log */}
      {step===1&&(<div>
        {/* Add item form */}
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16}}>
          <input value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="Item name (e.g. Grilled chicken)" style={{width:"100%",padding:"12px 14px",background:"#1a1a1a",border:"1px solid #333",borderRadius:10,color:"#fff",fontSize:14,fontFamily:FB,outline:"none",marginBottom:8,boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:8}}>
            <select value={newItem.category} onChange={e=>setNewItem(p=>({...p,category:e.target.value}))} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #333",borderRadius:10,color:"#fff",fontSize:13,fontFamily:FC,appearance:"auto",WebkitAppearance:"auto"}}>
              {WASTE_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))} placeholder="Qty" style={{width:60,padding:"10px",background:"#1a1a1a",border:"1px solid #333",borderRadius:10,color:"#fff",fontSize:14,textAlign:"center"}}/>
            <select value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))} style={{width:60,padding:"10px",background:"#1a1a1a",border:"1px solid #333",borderRadius:10,color:"#fff",fontSize:13,appearance:"auto",WebkitAppearance:"auto"}}>
              <option value="kg">kg</option><option value="L">L</option><option value="pcs">pcs</option><option value="trays">trays</option>
            </select>
          </div>
          <button onClick={addItem} style={{...BY,width:"100%",marginTop:8,opacity:newItem.name.trim()&&newItem.qty?1:0.4}} disabled={!newItem.name.trim()||!newItem.qty}>ADD ITEM</button>
        </div>
        {/* Items list */}
        {items.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#888",marginBottom:8}}>{items.length} ITEMS LOGGED</div>
          {items.map(it=>(<div key={it.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#fff",borderRadius:10,marginBottom:4,border:"1px solid #e8e8e3"}}>
            <div><div style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{it.name}</div><div style={{fontSize:11,color:"#888"}}>{it.category}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#E3000B"}}>{it.qty} {it.unit}</span>
              <button onClick={()=>setItems(p=>p.filter(x=>x.id!==it.id))} style={{width:20,height:20,borderRadius:10,background:"#f0f0eb",border:"none",fontSize:10,cursor:"pointer",color:"#999"}}>x</button>
            </div>
          </div>))}
        </div>}
        <button style={{...BY,width:"100%",opacity:items.length>=1?1:0.4}} disabled={items.length<1} onClick={()=>setStep(2)}>NEXT - TAKE PHOTOS</button>
      </div>)}

      {/* Step 2: Photos */}
      {step===2&&(<div>
        <h2 style={{fontFamily:FC,fontWeight:900,fontSize:22,textAlign:"center",margin:"0 0 16px"}}>PHOTO EVIDENCE</h2>
        {[["wastageSheet","Wastage Sheet","Your completed wastage sheet"],["pos","POS Recording","POS screen showing wastage entry"]].map(([key,label,desc])=>(
          <div key={key} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:12,border:"1px solid #e8e8e3"}}>
            <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:4}}>{label}</div>
            <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:12}}>{desc}</div>
            {photos[key]?<div style={{position:"relative"}}><img src={photos[key]} alt="" style={{width:"100%",borderRadius:10,maxHeight:200,objectFit:"cover"}}/><button onClick={()=>setPhotos(p=>({...p,[key]:null}))} style={{position:"absolute",top:8,right:8,width:28,height:28,borderRadius:14,background:"#E3000B",color:"#fff",border:"none",fontSize:14,cursor:"pointer"}}>x</button></div>
            :<label style={{display:"flex",alignItems:"center",justifyContent:"center",padding:24,border:"2px dashed #ddd",borderRadius:12,cursor:"pointer"}}>
              <div style={{textAlign:"center"}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#888",marginTop:4}}>TAP TO SNAP</div></div>
              <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const b=await compressImg(f);setPhotos(p=>({...p,[key]:b}));}}/>
            </label>}
          </div>
        ))}
        <button style={{...BY,width:"100%",opacity:photos.wastageSheet&&photos.pos?1:0.4}} disabled={!photos.wastageSheet||!photos.pos} onClick={()=>setStep(3)}>NEXT - ANSWER QUESTIONS</button>
      </div>)}

      {/* Step 3: Questions */}
      {step===3&&(<div>
        <h2 style={{fontFamily:FC,fontWeight:900,fontSize:22,textAlign:"center",margin:"0 0 16px"}}>WHAT DID YOU FIND?</h2>
        {WASTE_QUESTIONS.map((q,i)=>(<div key={q.id} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:12,border:"1px solid #e8e8e3"}}>
          <div style={{fontFamily:FB,fontWeight:800,fontSize:15,marginBottom:8}}>{q.text}</div>
          <textarea value={answers[i]} onChange={e=>{const a=[...answers];a[i]=e.target.value;setAnswers(a);}} placeholder={q.placeholder} rows={3} style={{width:"100%",padding:"14px 16px",background:"#f5f5f0",border:"1px solid #e0e0db",borderRadius:12,fontSize:14,fontFamily:FB,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>))}
        <button style={{...BY,width:"100%",opacity:answers.every(a=>a.trim())?1:0.4}} disabled={!answers.every(a=>a.trim())} onClick={()=>setStep(4)}>REVIEW & SUBMIT</button>
      </div>)}

      {/* Step 4: Review */}
      {step===4&&(<div>
        <h2 style={{fontFamily:FC,fontWeight:900,fontSize:22,textAlign:"center",margin:"0 0 16px"}}>REVIEW</h2>
        <div style={{background:"#000",borderRadius:14,padding:16,color:"#fff",marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300",marginBottom:8}}>{items.length} WASTE ITEMS LOGGED</div>
          {items.map(it=>(<div key={it.id} style={{fontSize:13,color:"#ccc",marginBottom:2}}>{it.name} - {it.qty} {it.unit} ({it.category})</div>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {photos.wastageSheet&&<img src={photos.wastageSheet} alt="" style={{width:"100%",borderRadius:10,aspectRatio:"4/3",objectFit:"cover"}}/>}
          {photos.pos&&<img src={photos.pos} alt="" style={{width:"100%",borderRadius:10,aspectRatio:"4/3",objectFit:"cover"}}/>}
        </div>
        <button style={{...BY,width:"100%",opacity:wasteSubmitting?0.6:1}} disabled={wasteSubmitting} onClick={async()=>{setWasteSubmitting(true);
          const uploadedFiles=[];
          if(photos.wastageSheet){const url=await uploadB64(photos.wastageSheet,"wastage_sheet");uploadedFiles.push({name:"wastage_sheet.jpg",type:"image/jpeg",imageUrl:url});}
          if(photos.pos){const url=await uploadB64(photos.pos,"pos_recording");uploadedFiles.push({name:"pos_recording.jpg",type:"image/jpeg",imageUrl:url});}
          setWasteSubmitting(false);onS({text:"Waste Nothing completed",items,photos:{wastageSheet:!!photos.wastageSheet,pos:!!photos.pos},answers:WASTE_QUESTIONS.map((q,i)=>({question:q.text,answer:answers[i]})),files:uploadedFiles,claimedBonus:answers[2]?.length>50,autoBonus:false,points:ch.points});
        }}>{wasteSubmitting?"UPLOADING PHOTOS...":"SUBMIT CHALLENGE"}</button>
      </div>)}
    </div>
  </div>);
}

// ─── TEACH IT TO OWN IT (LSE Week 4) ────────────────────────────────────────
const TEACH_SKILLS=["Portion Control","Handwashing Procedure","Drive-thru Speed","Upselling Technique","Station Setup","Closing Checklist","Guest Greeting","Food Safety Temps"];
function TeachIt({ch,done,onS,onB,user}){
  const[step,setStep]=useState(0);// 0=intro, 1=select, 2=record, 3=reflect, 4=submit
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[step]);
  const[skill,setSkill]=useState(null);const[crewName,setCrewName]=useState("");const[gap,setGap]=useState("");
  const[videoRecorded,setVideoRecorded]=useState(false);const[duration,setDuration]=useState(0);
  const[reflect,setReflect]=useState(["",""]);
  const videoRef=useRef(null);const mediaRef=useRef(null);const streamRef=useRef(null);const chunksRef=useRef([]);const timerRef=useRef(null);const videoBlobRef=useRef(null);const[recording,setRecording]=useState(false);const[recTime,setRecTime]=useState(0);const[camError,setCamError]=useState(null);const[videoUploading,setVideoUploading]=useState(false);
  const startRec=async()=>{try{setCamError(null);const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:true});streamRef.current=stream;
    chunksRef.current=[];const mr=new MediaRecorder(stream,{mimeType:MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":MediaRecorder.isTypeSupported("video/webm")?"video/webm":"video/mp4"});mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
    mr.onstop=()=>{videoBlobRef.current=new Blob(chunksRef.current,{type:mr.mimeType||"video/webm"});setDuration(recTime);setVideoRecorded(true);setRecording(false);};mediaRef.current=mr;mr.start(100);setRecording(true);setRecTime(0);
    // Attach stream to video element after React renders it
    requestAnimationFrame(()=>{requestAnimationFrame(()=>{if(videoRef.current&&streamRef.current){videoRef.current.srcObject=streamRef.current;videoRef.current.play().catch(()=>{});}});});
    timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);}catch(err){console.error("Camera:",err);setCamError(err.name==="NotAllowedError"?"Camera permission denied. Please allow camera access in your browser settings.":err.name==="NotFoundError"?"No camera found on this device.":"Could not access camera. Try refreshing the page or using a different browser.");}};
  const stopRec=()=>{clearInterval(timerRef.current);if(mediaRef.current&&mediaRef.current.state!=="inactive")mediaRef.current.stop();if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());streamRef.current=null;};
  useEffect(()=>()=>{clearInterval(timerRef.current);if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());},[]);
  // Re-attach stream to video element when recording state changes (ensures video shows after React render)
  useEffect(()=>{if(recording&&videoRef.current&&streamRef.current&&!videoRef.current.srcObject){videoRef.current.srcObject=streamRef.current;videoRef.current.play().catch(()=>{});}},[recording]);
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(step===0)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setStep(1)} startLabel="START TRAINING"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px"}}>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>{[1,2,3,4].map(s=>(<div key={s} style={{width:12,height:12,borderRadius:6,background:s<step?"#007A33":s===step?"#FFD300":"#ddd"}}/>))}</div>

      {/* Step 1: Select skill + crew */}
      {step===1&&(<div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:8}}>WHICH SKILL?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          {TEACH_SKILLS.map(s=>(<button key={s} onClick={()=>setSkill(s)} style={{padding:"14px 12px",borderRadius:12,border:skill===s?"2px solid #FFD300":"1px solid #e8e8e3",background:skill===s?"#FFF8E0":"#fff",fontFamily:FC,fontWeight:700,fontSize:13,cursor:"pointer",textAlign:"left"}}>{s}</button>))}
        </div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:8}}>WHO ARE YOU TRAINING?</div>
        <input value={crewName} onChange={e=>setCrewName(e.target.value)} placeholder="Crew member's first name" style={{width:"100%",padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,fontSize:14,fontFamily:FB,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:8}}>WHAT'S THE GAP?</div>
        <textarea value={gap} onChange={e=>setGap(e.target.value)} placeholder="What specific behaviour are you trying to fix? e.g. Skipping handwash between stations" rows={2} style={{width:"100%",padding:"12px 14px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,fontSize:14,fontFamily:FB,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        <button style={{...BY,width:"100%",marginTop:16,opacity:skill&&crewName.trim()&&gap.trim()?1:0.4}} disabled={!skill||!crewName.trim()||!gap.trim()} onClick={()=>setStep(2)}>NEXT - RECORD THE TRAINING</button>
      </div>)}

      {/* Step 2: Record */}
      {step===2&&(<div>
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16,color:"#fff"}}>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#FFD300",marginBottom:4}}>TRAINING</div>
          <div style={{fontSize:16,fontFamily:FC,fontWeight:800}}>{skill}</div>
          <div style={{fontSize:13,color:"#888",marginTop:4}}>with {crewName}</div>
        </div>
        {!videoRecorded&&!recording&&(<div style={{textAlign:"center"}}>
          <div style={{fontSize:14,color:"#555",fontFamily:FB,lineHeight:1.6,marginBottom:20}}>Record 20-30 seconds of real training. Both people visible. Front camera will open. Explain, show, then let them practise.</div>
          {camError&&<div style={{background:"#fef0f0",border:"1px solid #E3000B",borderRadius:12,padding:14,marginBottom:16,fontSize:13,color:"#E3000B",fontFamily:FB,textAlign:"left"}}>{camError}</div>}
          <button style={{...BY,width:"100%"}} onClick={startRec}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:"middle",marginRight:8}}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>START RECORDING
          </button>
        </div>)}
        {recording&&(<div>
          <div style={{borderRadius:16,overflow:"hidden",marginBottom:12,position:"relative",background:"#000"}}>
            <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:280,objectFit:"cover"}}/>
            <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:6,background:"rgba(227,0,11,0.9)",padding:"6px 12px",borderRadius:20}}>
              <div style={{width:8,height:8,borderRadius:4,background:"#fff",animation:"pulse 1s infinite"}}/><span style={{fontSize:12,fontFamily:FC,fontWeight:800,color:"#fff"}}>REC {recTime}s</span>
            </div>
          </div>
          <button style={{...BO,width:"100%"}} onClick={stopRec}>STOP RECORDING</button>
        </div>)}
        {videoRecorded&&(<div style={{textAlign:"center"}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:8}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:16,color:"#007A33"}}>RECORDED - {duration}s</div>
          <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:4,marginBottom:20}}>Training with {crewName} on {skill}</div>
          <button style={{...BY,width:"100%"}} onClick={()=>setStep(3)}>NEXT - REFLECT</button>
        </div>)}
      </div>)}

      {/* Step 3: Reflection */}
      {step===3&&(<div>
        <h2 style={{fontFamily:FC,fontWeight:900,fontSize:22,textAlign:"center",margin:"0 0 16px"}}>REFLECTION</h2>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:12,border:"1px solid #e8e8e3"}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:13,marginBottom:8}}>Did they get it? How do you know?</div>
          <textarea value={reflect[0]} onChange={e=>setReflect(p=>[e.target.value,p[1]])} placeholder="e.g. Yes - they repeated the correct portion weight back to me and did it unassisted on the next serve" rows={3} style={{width:"100%",padding:"12px 14px",background:"#f5f5f0",border:"1px solid #e0e0db",borderRadius:10,fontSize:14,fontFamily:FB,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:16,border:"1px solid #e8e8e3"}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:13,marginBottom:8}}>What would you do differently next time you train someone on this?</div>
          <textarea value={reflect[1]} onChange={e=>setReflect(p=>[p[0],e.target.value])} placeholder="e.g. Start with showing the tool before explaining the standard - they learn faster from doing" rows={3} style={{width:"100%",padding:"12px 14px",background:"#f5f5f0",border:"1px solid #e0e0db",borderRadius:10,fontSize:14,fontFamily:FB,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <button style={{...BY,width:"100%",opacity:(reflect.every(r=>r.trim())&&!videoUploading)?1:0.4}} disabled={!reflect.every(r=>r.trim())||videoUploading} onClick={async()=>{
          setVideoUploading(true);let videoUrl=null;let videoPath=null;
          try{if(videoBlobRef.current){videoPath=`videos/${user.id}/teach_${Date.now()}.webm`;videoUrl=await uploadFile(videoBlobRef.current,videoPath);}}catch(e){console.error("Video upload failed:",e);}
          setVideoUploading(false);onS({text:"Teach It to Own It completed",skill,crewName,gap,videoRecorded:true,duration,videoUrl,videoPath,reflection:reflect,claimedBonus:gap.length>30&&reflect[0].length>30,autoBonus:false,points:ch.points});
        }}>{videoUploading?"UPLOADING VIDEO...":"SUBMIT CHALLENGE"}</button>
      </div>)}
    </div>
  </div>);
}

// ─── THE SHIFT LEADER LENS (LE Week 4) ──────────────────────────────────────
const SLL_CLIPS=[
  {id:"c1",title:"The Quiet One",desc:"A crew member has been silent all shift. They're doing their job but haven't spoken to anyone. It's 2pm.",q:"What do you do?",options:["Check in privately","Leave them alone","Assign them a task with a partner","Ask another crew member what's up"],best:0,feedback:"Check in privately. Something might be going on - or they might just be focused. A quick 'You okay?' costs nothing and shows you noticed."},
  {id:"c2",title:"The Shortcut",desc:"You catch a crew member skipping the handwash step between raw and ready-to-eat. The line is slammed.",q:"What do you do?",options:["Stop them immediately, in front of guests","Pull them aside after the rush","Wash your own hands visibly nearby","Report it to the RM"],best:0,feedback:"Stop them immediately. Food safety is non-negotiable - it doesn't wait for a quiet moment. Be direct but not aggressive. The guest risk is now, not after the rush."},
  {id:"c3",title:"The Late Start",desc:"A crew member arrives 15 minutes late. No call. No text. They look rough.",q:"What do you do?",options:["Ask if they're okay first","Tell them being late isn't acceptable","Dock their break time","Note it and address it at end of shift"],best:0,feedback:"Ask if they're okay first. Lead with care, then address the behaviour. If something is genuinely wrong, jumping to discipline makes it worse. Address the lateness after you understand the context."},
  {id:"c4",title:"The Guest Compliment",desc:"A guest tells you that one of your crew members was 'amazing'. The crew member doesn't know.",q:"What do you do?",options:["Tell them immediately in front of the team","Write it on the board","Tell them privately after shift","Pass it to the RM to handle"],best:0,feedback:"Tell them immediately in front of the team. Public recognition is powerful. It reinforces the behaviour for everyone, not just that person. Don't save good news for later."},
  {id:"c5",title:"The Dead Period",desc:"It's 3pm. Four crew. Zero guests. Everyone is standing around.",q:"What do you do?",options:["Deep clean challenge","Let them have a breather","Training moment","Send one home early"],best:3,feedback:"Send one home early. Four crew with zero guests is a cost problem. One crew member going home saves labour without impacting service. Deep clean and training are good but they don't address the labour cost."},
  {id:"c6",title:"The Tension",desc:"Two crew members clearly aren't speaking. The vibe on the line is off.",q:"What do you do?",options:["Talk to each separately","Bring them together","Ignore it unless it affects guests","Move one to a different station"],best:0,feedback:"Talk to each separately first. You need to understand both sides before deciding what to do next. Bringing them together too early can escalate. Moving stations avoids the issue."},
  {id:"c7",title:"The New Start",desc:"It's their first shift. They look terrified. The trainer called in sick.",q:"What do you do?",options:["Train them yourself","Buddy them with your best person","Give them easy tasks and check in often","Send them home and reschedule"],best:1,feedback:"Buddy them with your best person. Your job is to run the shift, not train. Your best crew member gives them a real-world buddy experience. Sending them home wastes the opportunity and their motivation."},
  {id:"c8",title:"The Request",desc:"A crew member asks to leave 2 hours early. You're already short. They say it's personal.",q:"What do you do?",options:["Let them go, figure it out","Ask what's going on","Say no, you need them","Offer a compromise - leave 1 hour early"],best:1,feedback:"Ask what's going on. You need context before deciding. If it's genuine, a compromise shows you care. If it's avoidable, you can hold them. But you can't make that call without understanding the situation."},
];
function ShiftLeaderLens({ch,done,onS,onB,user,actCfg}){
  const clips=actCfg?.shift_leader_lens?.clips||SLL_CLIPS;
  const[phase,setPhase]=useState("intro");// intro, play, reveal, results
  const[clipIdx,setClipIdx]=useState(0);
  const[showReveal,setShowReveal]=useState(false);
  const[lastAnswer,setLastAnswer]=useState(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase,clipIdx,showReveal]);
  const[answers,setAnswers]=useState([]);
  const[selected,setSelected]=useState(null);
  const[why,setWhy]=useState("");
  const correctCount=answers.filter((a,i)=>{const c=clips[i];return c&&a.choiceIdx===c.best;}).length;
  const clip=clips[clipIdx]||null;
  if(done)return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);
  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setPhase("play")} startLabel="START ASSESSMENT"/>;
  if(phase==="results")return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px"}}>
      {/* Score card */}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{correctCount}/{clips.length}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>STRONG CALLS</div>
      </div>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,marginBottom:16}}>YOUR DECISIONS</div>
      {answers.map((a,i)=>{const c=clips[i];return(<div key={i} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,border:"1px solid #e8e8e3",borderLeft:`4px solid ${a.correct?"#007A33":"#E3000B"}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5,color:"#000"}}>{a.title.toUpperCase()}</div>
          <span style={{fontFamily:FC,fontWeight:800,fontSize:11,color:a.correct?"#007A33":"#E3000B",background:a.correct?"#f0f8f0":"#fef0f0",padding:"4px 8px 3px",borderRadius:6,lineHeight:1}}>{a.correct?"CORRECT":"WRONG"}</span>
        </div>
        <div style={{fontSize:15,color:a.correct?"#007A33":"#E3000B",fontFamily:FB,marginTop:6,fontWeight:600}}>{a.choice}</div>
        {!a.correct&&c&&<div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:4}}>Best: {c.options[c.best!==undefined?c.best:0]}</div>}
      </div>);})}
      {(()=>{const earnedPts=Math.round(ch.points*(correctCount/clips.length));const bonusEarned=correctCount===clips.length;return(<>
        <div style={{background:"#000",borderRadius:14,padding:"18px 20px",marginTop:16,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{earnedPts}</div></div>
          {bonusEarned&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"8px 14px",borderRadius:8}}>+{ch.bonusPoints} BONUS</div>}
        </div>
        <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Shift Leader Lens completed",answers,correctCount,totalClips:clips.length,claimedBonus:bonusEarned,autoBonus:bonusEarned,points:earnedPts});}}>SUBMIT CHALLENGE</button>
      </>);})()}
    </div>
  </div>);
  // Play phase
  return(
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px"}}>
      {clip&&!showReveal?(
        <div>
          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999",textAlign:"center",marginBottom:4}}>{clipIdx+1} OF {clips.length}</div>
          <div style={{height:4,background:"#e8e8e3",borderRadius:2,marginBottom:16}}><div style={{height:"100%",background:"#FFD300",borderRadius:2,width:`${((clipIdx+1)/clips.length)*100}%`,transition:"width 0.3s"}}/></div>
          <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12}}>{clip.title.toUpperCase()}</div>
          <div style={scenarioBox}>
            <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB}}>{clip.desc}</div>
          </div>
          <div style={{...qStyle,marginTop:20}}>{clip.q}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {(clip.options||[]).map((opt,i)=>(<button key={i} onClick={()=>setSelected(i)} style={{...optCard(selected===i),color:"#333"}}>{opt}</button>))}
          </div>
          <button style={{...BY,width:"100%",fontSize:17,opacity:selected!==null?1:0.4}} disabled={selected===null} onClick={()=>{
            const ans={clipId:clip.id,title:clip.title,choice:clip.options[selected],choiceIdx:selected,correct:selected===(clip.best!==undefined?clip.best:0),why};
            setLastAnswer(ans);setShowReveal(true);
          }}>LOCK IN</button>
        </div>
      ):showReveal&&lastAnswer?(
        <div>
          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999",textAlign:"center",marginBottom:4}}>{clipIdx+1} OF {clips.length}</div>
          <div style={{height:4,background:"#e8e8e3",borderRadius:2,marginBottom:16}}><div style={{height:"100%",background:"#FFD300",borderRadius:2,width:`${((clipIdx+1)/clips.length)*100}%`,transition:"width 0.3s"}}/></div>
          {/* Result feedback */}
          <div style={{textAlign:"center",marginBottom:16}}>
            {lastAnswer.correct?
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>:
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            <div style={{fontFamily:FC,fontWeight:900,fontSize:18,color:lastAnswer.correct?"#007A33":"#E3000B",marginTop:8}}>{lastAnswer.correct?"STRONG CALL":"NOT QUITE"}</div>
          </div>
          {/* Your answer */}
          <div style={{padding:14,borderRadius:14,marginBottom:10,border:`2px solid ${lastAnswer.correct?"#007A33":"#E3000B"}`,background:lastAnswer.correct?"#f0f8f0":"#fef0f0"}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:lastAnswer.correct?"#007A33":"#E3000B",letterSpacing:0.5,marginBottom:4}}>YOUR ANSWER</div>
            <div style={{fontFamily:FB,fontSize:15,color:"#333"}}>{lastAnswer.choice}</div>
          </div>
          {/* Best answer + coaching */}
          {!lastAnswer.correct&&clip.options[clip.best!==undefined?clip.best:0]&&(
            <div style={{padding:14,borderRadius:14,marginBottom:10,border:"2px solid #007A33",background:"#f0f8f0"}}>
              <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#007A33",letterSpacing:0.5,marginBottom:4}}>BEST APPROACH</div>
              <div style={{fontFamily:FB,fontSize:15,color:"#333",fontWeight:600}}>{clip.options[clip.best!==undefined?clip.best:0]}</div>
            </div>
          )}
          {clip.feedback&&<div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:16}}>
            <div style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#000",letterSpacing:0.5,marginBottom:6}}>COACHING</div>
            <div style={{fontFamily:FB,fontSize:15,color:"#555",lineHeight:1.6}}>{clip.feedback}</div>
          </div>}
          <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{
            const newAnswers=[...answers,lastAnswer];setAnswers(newAnswers);
            setSelected(null);setWhy("");setShowReveal(false);setLastAnswer(null);
            if(clipIdx<clips.length-1){setClipIdx(c=>c+1);}else{setPhase("results");}
          }}>{clipIdx<clips.length-1?"NEXT SITUATION":"SEE RESULTS"}</button>
        </div>
      ):(<div style={{textAlign:"center",padding:40,color:"#888"}}>No situations configured</div>)}
    </div>
  </div>);
}

// ─── CHALLENGE DETAIL WITH UPLOAD ────────────────────────────────────────────
function ChV({ch,done,onS,onB,user}){
  const[tx,sT]=useState("");const[bn,sB]=useState(false);const[files,setFiles]=useState([]);const[submitting,setSubmitting]=useState(false);
  const handleFiles=(e)=>{Array.from(e.target.files||[]).forEach(file=>{if(file.type.startsWith("video/")){if(file.size>50*1024*1024){flash("Video too large (max 50MB)",false);return;}setFiles(p=>[...p,{name:file.name,type:file.type,blob:file,isVideo:true}]);return;}if(file.size>10*1024*1024){flash("File too large (max 10MB)",false);return;}if(file.type.startsWith("image/")){const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,1600/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);const preview=c.toDataURL("image/jpeg",0.85);c.toBlob(blob=>{setFiles(p=>[...p,{name:file.name,type:"image/jpeg",data:preview,blob,isImage:true}]);},"image/jpeg",0.85);};img.src=URL.createObjectURL(file);}else{const r=new FileReader();r.onload=ev=>setFiles(p=>[...p,{name:file.name,type:file.type,data:ev.target.result}]);r.readAsDataURL(file);}});e.target.value="";};
  const rmFile=i=>setFiles(p=>p.filter((_,idx)=>idx!==i));
  return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>WEEK {ch.week}</span><span style={{width:32}}/></div>
    <div style={{padding:"24px 20px 40px"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>{(()=>{const ri=resolveChIcon(ch);if(!ri)return null;return<div style={{width:96,height:96,borderRadius:48,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{typeof ri==="string"?<img src={ri} alt="" style={{width:64,height:64,objectFit:"contain"}}/>:ri}</div>;})()}</div>
      <h2 style={{fontFamily:FC,fontWeight:900,fontSize:28,textAlign:"center",margin:"0 0 4px",letterSpacing:1}}>{ch.title}</h2>
      <p style={{textAlign:"center",color:"#888",fontSize:14,marginBottom:24}}>{ch.subtitle}</p>
      <div style={{marginBottom:20}}><div style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#FFD300",letterSpacing:1,marginBottom:8,background:"#000",display:"inline-block",padding:"4px 10px",borderRadius:4}}>THE CHALLENGE</div><p style={{fontSize:15,lineHeight:1.6,color:"#555",margin:0}}>{ch.description}</p></div>
      <div style={{marginBottom:20}}><div style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#FFD300",letterSpacing:1,marginBottom:8,background:"#000",display:"inline-block",padding:"4px 10px",borderRadius:4}}>WHAT TO SUBMIT</div><p style={{fontSize:15,lineHeight:1.6,color:"#555",margin:0}}>{ch.deliverable}</p></div>
      <div style={{background:"#f0f8f0",border:"1px solid #d4e8d4",borderRadius:14,padding:16,marginBottom:20}}><div style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#007A33",letterSpacing:1,marginBottom:6}}>TIP</div><p style={{fontSize:14,color:"#666",lineHeight:1.5,margin:0}}>{ch.tip}</p></div>
      <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#555"}}><span>Challenge Points</span><span style={{fontWeight:700}}>Up to {ch.points}</span></div>
        {ch.bonusPoints>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:14,borderTop:"1px solid #eee",paddingTop:10,marginTop:10}}><span style={{color:"#007A33"}}>Bonus: {ch.bonusCondition}</span><span style={{fontWeight:700,color:"#007A33"}}>Up to +{ch.bonusPoints}</span></div>}
      </div>
      {done?(<div style={{textAlign:"center",padding:20,background:"#f0f8f0",borderRadius:14,fontFamily:FC,fontWeight:800,fontSize:16,color:"#007A33",letterSpacing:1}}>CHALLENGE SUBMITTED<div style={{fontSize:12,fontWeight:600,color:"#888",marginTop:8,letterSpacing:1}}>+100 PTS AWARDED</div><div style={{fontSize:13,fontWeight:600,color:"#FFB800",marginTop:4,letterSpacing:1}}>BONUS POINTS PENDING REVIEW</div></div>):(
        <>
          <div style={{display:"flex",flexDirection:"column",gap:6}}><label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>YOUR SUBMISSION</label><textarea style={{padding:"14px 16px",background:"#fff",border:"1px solid #e0e0db",borderRadius:12,color:"#1a1a1a",fontSize:15,fontFamily:FB,outline:"none",height:120,resize:"vertical"}} value={tx} onChange={e=>sT(e.target.value)} placeholder="Describe what you did, what you found, and what action you took..."/></div>
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
            <label style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1}}>ATTACH EVIDENCE</label>
            <input type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple onChange={handleFiles} style={{display:"none"}} id="file-up"/>
            <input type="file" accept="image/*" capture="environment" onChange={handleFiles} style={{display:"none"}} id="cam-up"/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <label htmlFor="file-up" style={{width:80,height:80,borderRadius:12,border:"2px dashed #d0d0cb",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#fff",flexShrink:0}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999",letterSpacing:1,marginTop:4}}>UPLOAD</span></label>
              <label htmlFor="cam-up" style={{width:80,height:80,borderRadius:12,border:"2px dashed #d0d0cb",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#fff",flexShrink:0}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><span style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999",letterSpacing:1,marginTop:4}}>CAMERA</span></label>
              {files.map((f,i)=>(<div key={i} style={{width:80,height:80,borderRadius:12,overflow:"hidden",position:"relative",border:"1px solid #e0e0db",flexShrink:0}}>{f.type?.startsWith("image/")?<img src={f.data} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:f.isVideo?<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#1a1a1a",padding:4}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span style={{fontSize:10,color:"#ccc",marginTop:2,textAlign:"center"}}>{f.name.slice(0,10)}</span></div>:<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fff",padding:4}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span style={{fontSize:12,color:"#999",marginTop:2,textAlign:"center"}}>{f.name.slice(0,12)}</span></div>}<button onClick={()=>rmFile(i)} style={{position:"absolute",top:2,right:2,width:20,height:20,borderRadius:10,background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u00D7"}</button></div>))}
            </div>
            <span style={{fontSize:13,color:"#bbb"}}>Photos, videos, screenshots, or documents. Videos max 50MB, others max 2MB.</span>
          </div>
          {ch.bonusPoints>0&&<label style={{display:"flex",alignItems:"flex-start",fontSize:14,color:"#555",cursor:"pointer",padding:"8px 0",marginTop:4}}><input type="checkbox" checked={bn} onChange={e=>sB(e.target.checked)} style={{marginRight:10,accentColor:"#FFD300"}}/><span>I met the bonus: {ch.bonusCondition}</span></label>}
          <button style={{...BY,width:"100%",marginTop:16,opacity:submitting?0.6:1}} disabled={submitting} onClick={async()=>{if(tx.trim()&&!submitting){setSubmitting(true);
            const processedFiles=[];for(const f of files){if(f.isVideo&&f.blob){try{const path=`videos/${user.id}/${ch.id}_${Date.now()}_${f.name}`;const url=await uploadFile(f.blob,path);processedFiles.push({name:f.name,type:f.type,videoUrl:url,videoPath:path});}catch(e){console.error("Video upload failed:",e);processedFiles.push({name:f.name,type:f.type,uploadError:true});}}else if(f.isImage&&f.blob){try{const path=`images/${user.id}/${ch.id}_${Date.now()}_${f.name}`;const url=await uploadFile(f.blob,path);processedFiles.push({name:f.name,type:f.type,imageUrl:url,imagePath:path});}catch(e){console.error("Image upload failed:",e);processedFiles.push({name:f.name,type:f.type,data:f.data});}}else{processedFiles.push({name:f.name,type:f.type,data:f.data});}}
            await onS({text:tx,claimedBonus:bn,files:processedFiles});}}}>{submitting?"SUBMITTING...":"SUBMIT CHALLENGE"}</button>
        </>
      )}
    </div>
  </div>
);}

// ─── SHIFT CALL (NGL Week 1) ─────────────────────────────────────────────────
const CREW_RATES={crew_casual_21:{label:"Crew - Casual 21+",rate:33.19},crew_casual_19:{label:"Crew - Casual 19",rate:26.52},crew_casual_16:{label:"Crew - Casual 16",rate:16.57},crew_pt_21:{label:"Crew - PT/FT 21+",rate:26.56},crew_pt_19:{label:"Crew - PT/FT 19",rate:21.24},crew_pt_16:{label:"Crew - PT/FT 16",rate:13.26},sl_casual_21:{label:"Shift Leader - Casual 21+",rate:36.12},sl_ft_21:{label:"Shift Leader - FT 21+",rate:28.90},cook_casual_21:{label:"Cook - Casual 21+",rate:35.15},cook_ft_21:{label:"Cook - FT 21+",rate:28.11}};
const SHIFT_SCENARIOS=[
  {id:1,day:"Tuesday",time:"2pm",situation:"3 people over model. 4 hrs left on shift. Sales $1,500 under forecast.",correct:"react",costDaily:445,costAnnual:46301},
  {id:2,day:"Wednesday",time:"12pm",situation:"2 people over model. 3 hrs left. Sales tracking on forecast.",correct:"hold",costDaily:0,costAnnual:0},
  {id:3,day:"Thursday",time:"5pm",situation:"4 people over model. 2 hrs left. Dinner push starting.",correct:"hold",costDaily:0,costAnnual:0},
  {id:4,day:"Monday",time:"10am",situation:"2 people over model. 5 hrs until peak. Sales 20% under forecast.",correct:"react",costDaily:371,costAnnual:38584},
  {id:5,day:"Friday",time:"3pm",situation:"3 people over model. 3 hrs left. Sales on forecast but slowing.",correct:"react",costDaily:334,costAnnual:34726},
  {id:6,day:"Saturday",time:"6pm",situation:"2 people over model. Peak just started. Sales tracking above forecast.",correct:"hold",costDaily:0,costAnnual:0},
  {id:7,day:"Wednesday",time:"4pm",situation:"3 people over model. 4 hrs left. Power BI showing labour % at 35%.",correct:"react",costDaily:445,costAnnual:46301},
  {id:8,day:"Tuesday",time:"7pm",situation:"4 people over model. 2 hrs left. Sales 10% under forecast.",correct:"react",costDaily:297,costAnnual:30867},
];
function ShiftCall({ch,done,onS,onB,user,actCfg}){
  const scenarios=actCfg?.shift_call?.scenarios||SHIFT_SCENARIOS;
  const timeLimit=actCfg?.shift_call?.timeLimit||10;
  const[idx,setIdx]=useState(0);const[timer,setTimer]=useState(timeLimit);const[results,setResults]=useState([]);const[reveal,setReveal]=useState(null);const[phase,setPhase]=useState("intro");
  const timerRef=useRef(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);
  useEffect(()=>{if(phase==="play"&&timer>0){timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current);handleChoice("timeout");return 0;}return t-1;}),1000);return()=>clearInterval(timerRef.current);}return()=>clearInterval(timerRef.current);},[phase,idx]);
  const handleChoice=(choice)=>{clearInterval(timerRef.current);const s=scenarios[idx];const speed=timeLimit-timer;const correct=choice===s.correct;const pts=correct?(speed<5?3:speed<10?2:1):0;
    const r={scenarioId:s.id,choice,correct,speed,points:pts,costDaily:s.costDaily,costAnnual:s.costAnnual};setResults(p=>[...p,r]);
    setReveal({...r,scenario:s});setTimeout(()=>{setReveal(null);if(idx<scenarios.length-1){setIdx(i=>i+1);setTimer(timeLimit);setPhase("play");}else setPhase("results");},1500);};
  const correctCount=results.filter(r=>r.correct).length;const totalPts=results.reduce((s,r)=>s+r.points,0);const maxPts=scenarios.length*3;const avgSpeed=results.length>0?(results.reduce((s,r)=>s+r.speed,0)/results.length).toFixed(1):0;
  let streak=0,maxStreak=0;results.forEach(r=>{if(r.correct){streak++;maxStreak=Math.max(maxStreak,streak);}else streak=0;});
  const reactCorrect=results.filter(r=>scenarios.find(s=>s.id===r.scenarioId)?.correct==="react"&&r.correct).length;const reactTotal=scenarios.filter(s=>s.correct==="react").length;
  const holdCorrect=results.filter(r=>scenarios.find(s=>s.id===r.scenarioId)?.correct==="hold"&&r.correct).length;const holdTotal=scenarios.filter(s=>s.correct==="hold").length;
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>{setPhase("play");setTimer(timeLimit);}} startLabel="START"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {phase==="play"&&!reveal&&scenarios[idx]&&(<div style={{padding:"24px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#999"}}>{idx+1}/{scenarios.length}</span>
        <div style={{flex:1,marginLeft:12,height:6,background:"#e8e8e3",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:timer<=2?"#E3000B":timer<=5?"#FFD300":"#007A33",width:`${(timer/timeLimit)*100}%`,transition:"width 1s linear,background 0.3s"}}/></div>
        <span style={{fontFamily:FG,fontWeight:900,fontSize:22,color:timer<=2?"#E3000B":timer<=5?"#FFD300":"#000",marginLeft:12,minWidth:30,textAlign:"right"}}>{timer}</span>
      </div>
      <div style={{background:"#000",borderRadius:16,padding:20,marginBottom:20,color:"#fff"}}>
        <div style={{display:"inline-block",padding:"4px 12px",background:"#FFD300",color:"#000",borderRadius:8,fontFamily:FC,fontWeight:800,fontSize:12,letterSpacing:0.5,marginBottom:12}}>{scenarios[idx].day.toUpperCase()} {scenarios[idx].time.toUpperCase()}</div>
        <div style={{fontSize:16,lineHeight:1.6,fontFamily:FB}}>{scenarios[idx].situation}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <button onClick={()=>handleChoice("hold")} style={{padding:"20px 16px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:14,fontFamily:FC,fontWeight:900,fontSize:16,letterSpacing:1,cursor:"pointer",transition:"transform 0.1s",minHeight:70}}>DO NOTHING</button>
        <button onClick={()=>handleChoice("react")} style={{padding:"20px 16px",background:"#FFD300",color:"#000",border:"none",borderRadius:14,fontFamily:FC,fontWeight:900,fontSize:16,letterSpacing:1,cursor:"pointer",transition:"transform 0.1s",minHeight:70}}>MAKE THE CALL</button>
      </div>
    </div>)}
    {reveal&&(<div style={{padding:"24px 20px",textAlign:"center"}}>
      <div style={{background:reveal.correct?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",borderRadius:16,padding:24,border:`2px solid ${reveal.correct?"#007A33":"#E3000B"}`}}>
        {reveal.correct?<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        :<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        <div style={{fontFamily:FC,fontWeight:900,fontSize:18,marginTop:8,color:reveal.correct?"#007A33":"#E3000B"}}>{reveal.correct?"CORRECT":"WRONG"}</div>
        <div style={{fontSize:14,color:"#555",fontFamily:FB,marginTop:8}}>{reveal.correct&&reveal.scenario.correct==="react"?`Saved $${reveal.scenario.costDaily}/day`:reveal.correct?"Smart hold - sales are tracking, don't cut into guest experience.":reveal.scenario.correct==="react"?`Cost of inaction: $${reveal.scenario.costDaily}/day = $${reveal.scenario.costAnnual.toLocaleString()}/year`:"Hold - sales are on forecast. Cutting now hurts the guest experience."}</div>
      </div>
    </div>)}
    {phase==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{correctCount}/{scenarios.length}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>CORRECT DECISIONS</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"1px solid #e8e8e3"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24}}>{totalPts}</div><div style={{fontSize:12,color:"#555",fontFamily:FC,fontWeight:700}}>POINTS (/{maxPts})</div></div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"1px solid #e8e8e3"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24}}>{avgSpeed}s</div><div style={{fontSize:12,color:"#555",fontFamily:FC,fontWeight:700}}>AVG SPEED</div></div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"1px solid #e8e8e3"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24}}>{maxStreak}</div><div style={{fontSize:12,color:"#555",fontFamily:FC,fontWeight:700}}>BEST STREAK</div></div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"1px solid #e8e8e3"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:reactCorrect===reactTotal&&holdCorrect===holdTotal?"#007A33":"#E3000B"}}>{reactCorrect}/{reactTotal}</div><div style={{fontSize:12,color:"#555",fontFamily:FC,fontWeight:700}}>REACT | {holdCorrect}/{holdTotal} HOLD</div></div>
      </div>
      {results.map((r,i)=>{const s=scenarios.find(x=>x.id===r.scenarioId);return(<div key={i} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #e8e8e3"}}>
        <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{s.day} {s.time}</div><div style={{fontSize:12,color:r.correct?"#007A33":"#E3000B",fontFamily:FC,fontWeight:700}}>{r.correct?"CORRECT":"WRONG"} - {r.choice==="react"?"Reacted":"Held"} ({r.speed}s)</div></div>
        {s.costAnnual>0&&!r.correct&&<div style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#E3000B"}}>${s.costAnnual.toLocaleString()}/yr</div>}
        {r.correct&&<div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#007A33"}}>+{r.points}</div>}
      </div>);})}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:16,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{Math.round(ch.points*(correctCount/scenarios.length))}<span style={{fontSize:14,color:"#999"}}>/{ch.points}</span></div></div>
          {correctCount===scenarios.length&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"6px 12px",borderRadius:8}}>PERFECT +{ch.bonusPoints}</div>}
        </div>
      </div>
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{const earnedPts=Math.round(ch.points*(correctCount/scenarios.length));onS({text:"Shift Call completed",score:totalPts,correct:correctCount,avgSpeed:parseFloat(avgSpeed),streak:maxStreak,decisions:results,perfectRound:correctCount===scenarios.length,claimedBonus:correctCount===scenarios.length,autoBonus:correctCount===scenarios.length,points:earnedPts});}}>SUBMIT</button>
    </div>)}
  </div>);
}

// ─── BENCH BUILDER (NGL Week 2) ─────────────────────────────────────────────
const BENCH_LEVELS=[
  {id:1,name:"LEVEL 1 - THE BASICS",totalHours:450,currentAHR:38.50,targetAHR:37.10,crewPool:[{type:"crew_casual_21",available:12,hoursEach:25},{type:"crew_casual_19",available:6,hoursEach:20},{type:"crew_pt_21",available:6,hoursEach:30}],hints:true,penalties:false},
  {id:2,name:"LEVEL 2 - HARRINGTON PARK",totalHours:546,currentAHR:37.85,targetAHR:36.90,crewPool:[{type:"crew_casual_21",available:10,hoursEach:25},{type:"crew_casual_19",available:5,hoursEach:20},{type:"crew_casual_16",available:4,hoursEach:15},{type:"crew_pt_21",available:6,hoursEach:30},{type:"crew_pt_19",available:3,hoursEach:25},{type:"sl_casual_21",available:2,hoursEach:35},{type:"sl_ft_21",available:2,hoursEach:38}],hints:false,penalties:true},
  {id:3,name:"LEVEL 3 - WEEKEND WARRIOR",totalHours:620,currentAHR:38.20,targetAHR:36.50,crewPool:[{type:"crew_casual_21",available:10,hoursEach:30},{type:"crew_casual_19",available:6,hoursEach:22},{type:"crew_casual_16",available:5,hoursEach:15},{type:"crew_pt_21",available:5,hoursEach:32},{type:"crew_pt_19",available:3,hoursEach:25},{type:"crew_pt_16",available:3,hoursEach:18},{type:"sl_ft_21",available:3,hoursEach:38},{type:"cook_casual_21",available:2,hoursEach:30},{type:"cook_ft_21",available:2,hoursEach:38}],hints:false,penalties:true},
];
function BenchBuilder({ch,done,onS,onB,user,actCfg}){
  const levels=actCfg?.bench_builder?.levels||BENCH_LEVELS;
  const[levelIdx,setLevelIdx]=useState(0);const[placements,setPlacements]=useState([]);const[levelResults,setLevelResults]=useState([]);const[phase,setPhase]=useState("intro");
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);const[selected,setSelected]=useState(null);const[showHint,setShowHint]=useState(false);
  const level=levels[levelIdx];
  const calcAHR=(pl)=>{let tc=0,th=0;pl.forEach(p=>{const r=CREW_RATES[p.type];if(r){tc+=r.rate*p.hours;th+=p.hours;}});return th>0?tc/th:0;};
  const usedHours=placements.reduce((s,p)=>s+p.hours,0);const ahr=calcAHR(placements);const usedByType=(t)=>placements.filter(p=>p.type===t).length;
  const addCrew=(type)=>{const pool=level.crewPool.find(p=>p.type===type);if(!pool||usedByType(type)>=pool.available)return;if(usedHours+pool.hoursEach>level.totalHours)return;setPlacements(p=>[...p,{type,hours:pool.hoursEach}]);setShowHint(false);};
  const removeCrew=(idx)=>{setPlacements(p=>p.filter((_,i)=>i!==idx));};
  const submitLevel=()=>{const weeklySaving=(level.currentAHR-ahr)*usedHours;const annualSaving=weeklySaving*52;setLevelResults(p=>[...p,{level:level.id,name:level.name,achievedAHR:ahr.toFixed(2),targetAHR:level.targetAHR,hoursUsed:usedHours,hoursBudget:level.totalHours,weeklySaving:Math.round(weeklySaving),annualSaving:Math.round(annualSaving),beatTarget:ahr<=level.targetAHR}]);
    if(levelIdx<levels.length-1){setLevelIdx(l=>l+1);setPlacements([]);setPhase("play");}else setPhase("results");};
  // Hint timer for level 1
  useEffect(()=>{if(phase==="play"&&level.hints&&ahr>level.targetAHR&&placements.length>0){const t=setTimeout(()=>setShowHint(true),10000);return()=>clearTimeout(t);}setShowHint(false);},[placements,phase]);
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);
  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {phase==="intro"&&(<div style={{padding:"24px 20px"}}>
      <h2 style={{fontFamily:FC,fontWeight:900,fontSize:28,textAlign:"center",margin:"0 0 4px",letterSpacing:1}}>{ch.title}</h2>
      <p style={{textAlign:"center",color:"#888",fontSize:14,marginBottom:20}}>{ch.subtitle}</p>
      <p style={{fontSize:15,lineHeight:1.6,color:"#555",marginBottom:20}}>{ch.description}</p>
      <button style={{...BY,width:"100%"}} onClick={()=>setPhase("play")}>START LEVEL 1</button>
    </div>)}
    {phase==="play"&&level&&(<div style={{padding:"16px 20px"}}>
      <div style={{fontFamily:FC,fontWeight:900,fontSize:16,letterSpacing:0.5,marginBottom:12}}>{level.name}</div>
      {/* AHR Meter */}
      <div style={{background:"#000",borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#FFD300"}}>AHR METER</span>
          <span style={{fontFamily:FC,fontWeight:900,fontSize:18,color:ahr<=level.targetAHR?"#007A33":ahr<=level.targetAHR+0.5?"#FFB800":"#E3000B"}}>${usedHours>0?ahr.toFixed(2):"--"}</span>
        </div>
        <div style={{height:10,background:"#333",borderRadius:5,position:"relative",overflow:"visible"}}>
          <div style={{position:"absolute",left:`${Math.max(0,Math.min(100,((level.targetAHR-34)/6)*100))}%`,top:-2,width:2,height:14,background:"#007A33"}}/>
          {usedHours>0&&<div style={{position:"absolute",left:`${Math.max(0,Math.min(100,((ahr-34)/6)*100))}%`,top:-4,width:16,height:16,borderRadius:8,background:ahr<=level.targetAHR?"#007A33":ahr<=level.targetAHR+0.5?"#FFB800":"#E3000B",transform:"translateX(-8px)",transition:"left 0.3s"}}/>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:"#666"}}>$34</span><span style={{fontSize:10,color:"#007A33"}}>Target: ${level.targetAHR}</span><span style={{fontSize:10,color:"#666"}}>$40</span></div>
      </div>
      {/* Hours counter */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,padding:"8px 14px",background:"#fff",borderRadius:10,border:"1px solid #e8e8e3"}}>
        <span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>HOURS USED</span>
        <span style={{fontFamily:FC,fontWeight:900,fontSize:18,color:usedHours>level.totalHours?"#E3000B":"#000"}}>{usedHours}<span style={{fontSize:13,color:"#888"}}>/{level.totalHours}</span></span>
      </div>
      {/* Placed crew */}
      {placements.length>0&&(<div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#999",marginBottom:6}}>ROSTER ({placements.length})</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {placements.map((p,i)=>(<div key={i} onClick={()=>removeCrew(i)} style={{padding:"6px 10px",borderRadius:8,background:"#f0f8f0",border:"1px solid #d4e8d4",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <span>{CREW_RATES[p.type]?.label?.split(" - ")[1]||p.type}</span><span style={{color:"#888"}}>${CREW_RATES[p.type]?.rate}</span><span style={{color:"#E3000B",fontWeight:900}}>x</span>
          </div>))}
        </div>
      </div>)}
      {/* Hint */}
      {showHint&&<div style={{background:"#FFF8E0",border:"1px solid #FFD300",borderRadius:10,padding:12,marginBottom:12,fontSize:13,color:"#555",fontFamily:FB}}>Try swapping a Casual 21+ for a PT 21+ - saves $6.63/hr</div>}
      {/* Crew pool */}
      <div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#999",marginBottom:6}}>CREW POOL - TAP TO ADD</div>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
        {level.crewPool.map((pool,pi)=>{const used=usedByType(pool.type);const avail=pool.available-used;const rate=CREW_RATES[pool.type];return(
          <button key={pi} onClick={()=>addCrew(pool.type)} disabled={avail<=0||usedHours+pool.hoursEach>level.totalHours} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:avail>0?"#fff":"#f5f5f0",border:"1px solid #e8e8e3",borderRadius:12,cursor:avail>0?"pointer":"default",opacity:avail>0?1:0.5,color:"#333"}}>
            <div style={{textAlign:"left"}}><div style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{rate?.label||pool.type}</div><div style={{fontSize:11,color:"#888"}}>{pool.hoursEach} hrs each</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:16,color:"#E3000B"}}>${rate?.rate}</div><div style={{fontSize:11,color:"#888"}}>{avail} left</div></div>
          </button>
        );})}
      </div>
      <button style={{...BY,width:"100%",opacity:usedHours>0&&usedHours<=level.totalHours?1:0.4}} disabled={usedHours<=0||usedHours>level.totalHours} onClick={submitLevel}>
        SUBMIT ROSTER{ahr<=level.targetAHR?" - TARGET HIT":""}
      </button>
    </div>)}
    {phase==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:24}}><div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:0.5,color:"#000"}}>BENCH BUILDER COMPLETE</div></div>
      {levelResults.map((r,i)=>(<div key={i} style={{background:"#fff",borderRadius:12,padding:14,marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{r.name}</span>
          <span style={{fontFamily:FC,fontWeight:900,fontSize:16,color:r.beatTarget?"#007A33":"#E3000B"}}>${r.achievedAHR}</span>
        </div>
        <div style={{fontSize:12,color:"#888",fontFamily:FB}}>{r.hoursUsed}/{r.hoursBudget} hrs | Target: ${r.targetAHR}</div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontSize:13,fontFamily:FC,fontWeight:700}}>Weekly saving</span>
          <span style={{fontSize:13,fontFamily:FC,fontWeight:900,color:"#E3000B"}}>${r.weeklySaving.toLocaleString()}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontFamily:FC,fontWeight:700}}>Annual saving</span>
          <span style={{fontSize:16,fontFamily:FC,fontWeight:900,color:"#E3000B"}}>${r.annualSaving.toLocaleString()}</span>
        </div>
      </div>))}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:8,marginBottom:16}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5,marginBottom:4}}>KEY SAVINGS</div>
        <div style={{fontSize:14,color:"#ccc",fontFamily:FB,lineHeight:1.6}}>Casual 21+ to PT: saves <span style={{color:"#E3000B",fontWeight:900}}>$6.63/hr</span><br/>Casual 21+ to Casual 19: saves <span style={{color:"#E3000B",fontWeight:900}}>$6.67/hr</span><br/>Casual 21+ to Casual 16: saves <span style={{color:"#E3000B",fontWeight:900}}>$16.62/hr</span></div>
      </div>
      <button style={{...BY,width:"100%"}} onClick={()=>{const allBeat=levelResults.every(r=>r.beatTarget);const earnedPts=Math.round(ch.points*(levelResults.filter(r=>r.beatTarget).length/levels.length));onS({text:"Bench Builder completed",levels:levelResults,allUnderTarget:allBeat,claimedBonus:allBeat,autoBonus:allBeat,points:earnedPts});}}>SUBMIT</button>
    </div>)}
  </div>);
}

// ─── MAKE THE CALL (NGL Week 2) - Dual Counter Version ──────────────────────
const MTC_CREW=[
  {id:"jordan",name:"Jordan",classification:"Casual 21+",rate:33.19,baseHours:36,status:"2 hrs left before overtime"},
  {id:"mia",name:"Mia",classification:"Casual 19",rate:26.52,baseHours:28,status:"Available"},
  {id:"tyler",name:"Tyler",classification:"Casual 21+",rate:33.19,baseHours:20,status:"Available"},
  {id:"aisha",name:"Aisha",classification:"Casual 19",rate:26.52,baseHours:38,status:"At limit"},
  {id:"luca",name:"Luca",classification:"Casual 16",rate:16.57,baseHours:16,status:"Available"},
  {id:"ben",name:"Ben",classification:"PT/FT 21+",rate:26.56,baseHours:30,status:"Available"},
  {id:"chloe",name:"Chloe",classification:"PT/FT 19",rate:21.24,baseHours:38,status:"At limit"},
  {id:"noah",name:"Noah",classification:"Casual 21+",rate:33.19,baseHours:34,status:"4 hrs left before overtime"},
  {id:"ruby",name:"Ruby",classification:"PT/FT 16",rate:13.26,baseHours:22,status:"Available"},
  {id:"finn",name:"Finn",classification:"Casual 21+",rate:33.19,baseHours:12,status:"Available"},
];
const MTC_PENALTIES={casual_16:{saturday:1.2,sunday:1.2},casual_19:{saturday:1.4,sunday:1.4},casual_21:{saturday:1.4,sunday:1.4},ptft_16:{saturday:1.25,sunday:1.25},ptft_19:{saturday:1.25,sunday:1.5},ptft_21:{saturday:1.25,sunday:1.5}};
const MTC_OVERNIGHT=1.25;
const MTC_DECISIONS=[
  {id:1,type:"send_home",day:"Tuesday",time:"2pm",labels:[],context:{hoursLeft:4,sales:1800,forecast:8500,salesNote:"On track",crewOnFloor:3,modelSays:2},
    optionA:{label:"Hold the roster",desc:"Trade might pick up at dinner. Keep all 3 on.",correct:false,costImpact:132.76,ahrImpact:0,splhImpact:0,errorType:"over_rostering",lesson:"'Trade might pick up' is the classic over-rostering excuse. Sales are on forecast. Model says act."},
    optionB:{label:"Send one home",desc:"Sales are on forecast and model says 2 is enough. Send the Casual 21+ home.",correct:true,costImpact:-132.76,ahrImpact:-0.24,splhImpact:1,lesson:"Correct. Sales on forecast, model says 2. That Casual 21+ for 4 hours costs $133 you don't need."}},
  {id:2,type:"fill_shift",day:"Friday",time:"Midnight-6am",duration:6,labels:["Overnight penalty applies"],context:{note:"One crew called in sick. Need replacement."},
    optionA:{crewId:"jordan",desc:"Reliable. Knows overnight. But already at 36 hrs - 2 hrs of this shift hit overtime.",correct:false,errorType:"overtime_blindness",lesson:"Jordan's overtime + overnight penalty = well above $39/hr effective. Luca at base + overnight is still under $25/hr."},
    optionB:{crewId:"luca",desc:"Less experienced on overnight. Plenty of hours available. No overtime risk.",correct:true,lesson:"Correct. Luca's base rate + overnight penalty is still far cheaper than Jordan with overtime stacked on top."}},
  {id:3,type:"fill_shift",day:"Saturday",time:"11am-5pm",duration:6,labels:["Saturday penalty applies"],context:{note:"Open shift to fill."},
    optionA:{crewId:"tyler",desc:"Available. Experienced on Saturday lunch. No overtime risk.",correct:false,errorType:"wrong_classification",lesson:"Saturday penalty amplifies the classification gap. Tyler at $46.47/hr vs Luca at $23.20/hr. $140 extra for one shift."},
    optionB:{crewId:"luca",desc:"Junior. Trained and signed off. Available.",correct:true,lesson:"Correct. Weekend penalty makes classification the biggest lever. Junior rate + penalty is still half the adult cost."}},
  {id:4,type:"send_home",day:"Saturday",time:"1am",labels:["Overnight penalty applies on all remaining hours"],context:{hoursLeft:5,sales:180,forecast:600,salesNote:"70% under forecast",crewOnFloor:4,modelSays:2},
    optionA:{label:"Send 2 people home",desc:"Trade is dead. Model says 2 is enough. Cut the cost now.",correct:true,costImpact:-280,ahrImpact:-0.51,splhImpact:-2,lesson:"Correct. 70% under forecast, 4 crew, model says 2. This is the clearest send-home in the activity."},
    optionB:{label:"Hold all 4 until 6am",desc:"It's overnight. Hard to call anyone in if trade picks up. Keep the cover.",correct:false,costImpact:280,ahrImpact:0,splhImpact:0,errorType:"over_rostering",lesson:"'Hard to get cover overnight' is real - but trade is 70% under. 10 wasted hours at overnight rates is the biggest single cost in this activity."}},
  {id:5,type:"fill_shift",day:"Sunday",time:"5pm-9pm",duration:4,labels:["Sunday penalty applies"],context:{note:"Open shift to fill."},
    optionA:{crewId:"noah",desc:"Available. 4 hrs left before overtime on Sunday. Sunday penalty applies.",correct:false,errorType:"wrong_classification",lesson:"Noah has no overtime risk (lands at exactly 38). But Sunday penalty on Casual 21+ is $46.47/hr. Ruby at $16.58/hr saves $120."},
    optionB:{crewId:"ruby",desc:"Junior permanent. Sunday penalty applies. Available.",correct:true,lesson:"Correct. Sunday penalty on PT 16 vs Casual 21+ creates a $120 gap for a single 4-hour shift."}},
  {id:6,type:"react_up",day:"Monday",time:"12pm",labels:["SPLH above target band"],context:{hoursLeft:3,sales:920,forecast:750,salesNote:"23% above forecast",crewOnFloor:2,modelSays:3,splhWarning:"$134 - above the $125 ceiling"},
    optionA:{label:"Call someone back in",desc:"Trade recovered. Model says 3. SPLH is too high - you're under-staffed for this sales level.",correct:true,costImpact:50,ahrImpact:0.05,splhImpact:-9,lesson:"Correct. SPLH at $134 means under-staffed. The skill works in both directions - knowing when to add is as important as knowing when to cut."},
    optionB:{label:"Hold at 2",desc:"You already cut once today. Stay lean.",correct:false,costImpact:0,ahrImpact:0,splhImpact:0,errorType:"cut_too_deep",lesson:"SPLH above $125 means your restaurant is under-staffed and service is at risk. The ARM who only cuts never learns to react up."}},
];
const MTC_ERROR_TYPES={over_rostering:"Over-rostering on a dead shift",wrong_classification:"Wrong classification for the shift type",overtime_blindness:"Overtime blindness",cut_too_deep:"Cut too deep - SPLH at risk"};
const MTC_OT_THRESHOLD=38;const MTC_OT_MULT=1.5;const MTC_START_AHR=39.20;const MTC_TARGET=37.10;const MTC_EXISTING_HRS=546;const MTC_START_SPLH=122;const MTC_SPLH_BAND=[115,125];

function MakeTheCall({ch,done,onS,onB,user,actCfg}){
  const crew=actCfg?.make_the_call?.crew||MTC_CREW;
  const decs=actCfg?.make_the_call?.decisions||MTC_DECISIONS;
  const[screen,setScreen]=useState("brief");const[decIdx,setDecIdx]=useState(0);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);const[decisions,setDecisions]=useState([]);const[selected,setSelected]=useState(null);const[flashData,setFlashData]=useState(null);
  const[liveHours,setLiveHours]=useState(Object.fromEntries(crew.map(c=>[c.id,c.baseHours])));
  const[dispAHR,setDispAHR]=useState(MTC_START_AHR);const[dispSPLH,setDispSPLH]=useState(MTC_START_SPLH);
  const[labourCost,setLabourCost]=useState(MTC_START_AHR*MTC_EXISTING_HRS);const[totalHrs,setTotalHrs]=useState(MTC_EXISTING_HRS);
  const[curSPLH,setCurSPLH]=useState(MTC_START_SPLH);

  const getClassKey=(cls)=>{const isPerm=cls.includes("PT")||cls.includes("FT");const age=cls.includes("16")?"16":cls.includes("19")?"19":"21";return(isPerm?"ptft_":"casual_")+age;};
  const animVal=(setter,from,to)=>{const steps=16;const sv=(to-from)/steps;let cur=from;let s=0;const iv=setInterval(()=>{s++;cur+=sv;setter(cur);if(s>=steps){clearInterval(iv);setter(to);}},50);};

  const confirmDecision=()=>{if(selected===null)return;const dec=decs[decIdx];const chosen=selected==="a"?dec.optionA:dec.optionB;const correct=!!chosen.correct;
    const errorType=correct?null:chosen.errorType;const lesson=chosen.lesson;
    // Calculate cost/AHR/SPLH impacts
    let costDelta=0;let ahrDelta=chosen.ahrImpact||0;let splhDelta=chosen.splhImpact||0;
    if(dec.type==="fill_shift"){
      const crewId=chosen.crewId;const c=crew.find(x=>x.id===crewId);const dur=dec.duration||6;
      if(c){const headroom=Math.max(0,MTC_OT_THRESHOLD-liveHours[crewId]);const baseH=Math.min(dur,headroom);const otH=Math.max(0,dur-headroom);
        let pen=1;if(dec.labels?.some(l=>l.toLowerCase().includes("saturday")))pen=MTC_PENALTIES[getClassKey(c.classification)]?.saturday||1;
        else if(dec.labels?.some(l=>l.toLowerCase().includes("sunday")))pen=MTC_PENALTIES[getClassKey(c.classification)]?.sunday||1;
        else if(dec.labels?.some(l=>l.toLowerCase().includes("overnight")))pen=MTC_OVERNIGHT;
        costDelta=baseH*c.rate*pen+otH*c.rate*MTC_OT_MULT*pen;
        setLiveHours(p=>({...p,[crewId]:p[crewId]+dur}));
        ahrDelta=(costDelta-(MTC_START_AHR*dur))/totalHrs;}
    }else{costDelta=chosen.costImpact||0;}
    const newLabour=labourCost+costDelta;const newHrs=dec.type==="fill_shift"?totalHrs+(dec.duration||6):totalHrs;
    const newAHR=newLabour/newHrs;const newSPLH=curSPLH+(splhDelta||0);
    setLabourCost(newLabour);setTotalHrs(newHrs);setCurSPLH(newSPLH);
    animVal(setDispAHR,dispAHR,newAHR);animVal(setDispSPLH,dispSPLH,newSPLH);
    const result={id:dec.id,day:dec.day,time:dec.time,type:dec.type,choice:selected==="a"?"A":"B",choiceLabel:chosen.label||crew.find(x=>x.id===chosen.crewId)?.name||"Option",correct,errorType,lesson,costDelta:Math.round(costDelta),ahrAfter:newAHR,splhAfter:newSPLH};
    setDecisions(p=>[...p,result]);
    setFlashData({correct,lesson,choiceLabel:result.choiceLabel,costDelta:Math.round(Math.abs(costDelta)),labels:dec.labels||[],splhDelta});
    setTimeout(()=>{setFlashData(null);setSelected(null);if(decIdx<decs.length-1)setDecIdx(d=>d+1);else setScreen("results");},2500);};

  const finalAHR=labourCost/totalHrs;const finalSPLH=curSPLH;
  const correctCount=decisions.filter(d=>d.correct).length;const wrongCount=decisions.filter(d=>!d.correct).length;
  const ahrHit=finalAHR<=MTC_TARGET;const splhOk=finalSPLH>=MTC_SPLH_BAND[0]&&finalSPLH<=MTC_SPLH_BAND[1];
  // Error grouping
  const errorGroups={};decisions.filter(d=>d.errorType).forEach(d=>{errorGroups[d.errorType]=(errorGroups[d.errorType]||0)+1;});
  const topError=Object.entries(errorGroups).sort((a,b)=>b[1]-a[1])[0];

  const getVerdict=()=>{if(ahrHit&&splhOk)return"You read every situation. Cost down, service intact. That is the standard.";
    if(ahrHit&&!splhOk)return"AHR is down but you cut too deep. The restaurant is under-staffed. Profitability and service move together.";
    if(!ahrHit&&splhOk)return"Service is fine. Cost is still too high. The over-rostering is where it's hiding - look at the overnight and weekend decisions.";
    return"Both numbers are off. Start with the overnight and weekend decisions - those are where the biggest gaps are.";};

  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(screen==="brief")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setScreen("crew")} startLabel="SEE YOUR CREW"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>

    {/* Crew list */}
    {screen==="crew"&&(<div style={{padding:"0 20px"}}>
      <div style={{position:"sticky",top:56,background:"#f5f5f0",zIndex:10,padding:"12px 0",borderBottom:"1px solid #e8e8e3"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:dispAHR<=MTC_TARGET?"#007A33":"#E3000B"}}>${dispAHR.toFixed(2)}</div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>AHR</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:dispSPLH>=MTC_SPLH_BAND[0]&&dispSPLH<=MTC_SPLH_BAND[1]?"#007A33":"#E3000B"}}>${Math.round(dispSPLH)}</div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>SPLH</div></div>
        </div>
      </div>
      <div style={{paddingTop:12}}>
        {crew.map(c=>{const hrs=liveHours[c.id];const headroom=MTC_OT_THRESHOLD-hrs;const atLimit=headroom<=0;const nearOT=headroom>0&&headroom<=4;
          return(<div key={c.id} style={{display:"flex",alignItems:"center",padding:"12px 14px",background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,marginBottom:4}}>
            <div style={{width:36,height:36,borderRadius:18,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:16,color:"#000",marginRight:12,flexShrink:0,lineHeight:1,padding:"2px 0 0"}}>{c.name[0]}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{c.name}</div><div style={{fontSize:12,color:"#888",fontFamily:FB}}>{c.classification} - {hrs} hrs</div></div>
            <span style={{fontSize:10,fontFamily:FC,fontWeight:700,padding:"5px 8px 4px",borderRadius:6,lineHeight:1,background:atLimit?"rgba(227,0,11,0.1)":nearOT?"rgba(255,211,0,0.2)":"#f5f5f0",color:atLimit?"#E3000B":nearOT?"#B8860B":"#999"}}>{atLimit?"AT LIMIT":nearOT?`${headroom} HRS LEFT`:"AVAILABLE"}</span>
          </div>);})}
      </div>
      <button style={{...BY,width:"100%",marginTop:16,marginBottom:20}} onClick={()=>setScreen("decisions")}>START DECISIONS</button>
    </div>)}

    {/* Decision cards */}
    {screen==="decisions"&&!flashData&&decs[decIdx]&&(()=>{const dec=decs[decIdx];const ctx=dec.context||{};
      return(<div style={{padding:"16px 20px"}}>
        {/* Dual counter header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"8px 14px",background:"#000",borderRadius:12}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:dispAHR<=MTC_TARGET?"#007A33":dispAHR<=38?"#FFB800":"#E3000B",transition:"color 0.3s"}}>${dispAHR.toFixed(2)}</div><div style={{fontSize:9,color:"#888",fontFamily:FC}}>AHR (target ${MTC_TARGET.toFixed(2)})</div></div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:13,color:"#FFD300"}}>{decs.length-decIdx} LEFT</div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:dispSPLH>=MTC_SPLH_BAND[0]&&dispSPLH<=MTC_SPLH_BAND[1]?"#007A33":"#E3000B",transition:"color 0.3s"}}>${Math.round(dispSPLH)}</div><div style={{fontSize:9,color:"#888",fontFamily:FC}}>SPLH (${MTC_SPLH_BAND[0]}-${MTC_SPLH_BAND[1]})</div></div>
        </div>
        {/* Context card */}
        <div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:16,marginBottom:6}}>{dec.day.toUpperCase()} {dec.time.toUpperCase()}</div>
          {ctx.salesNote&&<div style={{fontSize:13,fontFamily:FB,color:"#555",lineHeight:1.5}}>Sales: ${ctx.sales?.toLocaleString()} (forecast ${ctx.forecast?.toLocaleString()}) - <strong>{ctx.salesNote}</strong></div>}
          {ctx.crewOnFloor!=null&&<div style={{fontSize:13,fontFamily:FB,color:"#555"}}>Crew on floor: {ctx.crewOnFloor} | Model says: {ctx.modelSays}</div>}
          {ctx.note&&<div style={{fontSize:13,fontFamily:FB,color:"#555",marginTop:4}}>{ctx.note}</div>}
          {ctx.splhWarning&&<div style={{marginTop:8,padding:"8px 12px",background:"rgba(227,0,11,0.1)",borderRadius:8,fontFamily:FC,fontWeight:800,fontSize:13,color:"#E3000B"}}>SPLH: {ctx.splhWarning}</div>}
          {(dec.labels||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{dec.labels.map((l,i)=>(<span key={i} style={{fontSize:10,fontFamily:FC,fontWeight:700,padding:"5px 8px 4px",borderRadius:6,lineHeight:1,background:l.includes("SPLH")?"rgba(227,0,11,0.1)":"rgba(255,211,0,0.2)",color:l.includes("SPLH")?"#E3000B":"#B8860B"}}>{l}</span>))}</div>}
        </div>
        {/* Options */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {[["a",dec.optionA],["b",dec.optionB]].map(([key,opt])=>{const c=opt.crewId?crew.find(x=>x.id===opt.crewId):null;const hrs=c?liveHours[c.id]:null;const dur=dec.duration||0;const otRisk=c&&hrs!=null&&dur>0&&(MTC_OT_THRESHOLD-hrs)<dur;
            return(<button key={key} onClick={()=>setSelected(key)} style={{padding:16,background:selected===key?"#FFF8E0":"#fff",border:selected===key?"2px solid #FFD300":"1px solid #e8e8e3",borderRadius:14,textAlign:"left",cursor:"pointer",color:"#333",transition:"all 0.15s"}}>
              <div style={{fontFamily:FC,fontWeight:900,fontSize:15,marginBottom:4,color:"#1a1a1a"}}>{opt.label||c?.name}</div>
              {c&&<div style={{fontSize:12,fontFamily:FC,fontWeight:600,color:"#999",marginBottom:4}}>{c.classification} - {hrs} hrs this week</div>}
              <div style={{fontSize:13,fontFamily:FB,color:"#555",lineHeight:1.5}}>{opt.desc||opt.description}</div>
              {otRisk&&<div style={{marginTop:8,fontSize:10,fontFamily:FC,fontWeight:800,color:"#E3000B",background:"rgba(227,0,11,0.08)",padding:"5px 8px 4px",borderRadius:6,lineHeight:1,display:"inline-block"}}>OVERTIME RISK</div>}
            </button>);})}
        </div>
        <button style={{...BY,width:"100%",opacity:selected?1:0.4}} disabled={!selected} onClick={confirmDecision}>CONFIRM</button>
      </div>);})()}

    {/* Flash */}
    {flashData&&(<div style={{padding:"24px 20px",textAlign:"center"}}>
      <div style={{background:flashData.correct?"rgba(0,122,51,0.08)":"rgba(227,0,11,0.08)",border:`2px solid ${flashData.correct?"#007A33":"#E3000B"}`,borderRadius:16,padding:24}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:flashData.correct?"#007A33":"#E3000B",marginBottom:8}}>{flashData.choiceLabel}</div>
        {flashData.costDelta>0&&<div style={{fontFamily:FC,fontWeight:900,fontSize:22,color:flashData.correct?"#007A33":"#E3000B"}}>${flashData.costDelta} {flashData.correct?"saved":"added"}</div>}
        {flashData.labels.some(l=>l.toLowerCase().includes("overnight"))&&<div style={{fontSize:12,color:"#FFB800",fontFamily:FC,fontWeight:700,marginTop:6}}>Includes overnight penalty (1.25x)</div>}
        {flashData.labels.some(l=>l.toLowerCase().includes("saturday")||l.toLowerCase().includes("sunday"))&&<div style={{fontSize:12,color:"#FFB800",fontFamily:FC,fontWeight:700,marginTop:4}}>Includes weekend penalty rate</div>}
        {flashData.splhDelta!==0&&<div style={{fontSize:12,color:flashData.splhDelta<0?"#007A33":"#FFB800",fontFamily:FC,fontWeight:700,marginTop:6}}>SPLH {flashData.splhDelta>0?"+":"" }{flashData.splhDelta}</div>}
        <div style={{marginTop:12,fontSize:13,color:"#555",fontFamily:FB,lineHeight:1.5}}>{flashData.correct?flashData.lesson:flashData.lesson}</div>
      </div>
    </div>)}

    {/* Results */}
    {screen==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:0.5,color:"#000"}}>YOUR WEEK</div></div>
      {/* Dual outcome */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:"#000",borderRadius:14,padding:"24px 16px",textAlign:"center"}}>
          <div style={{fontSize:13,fontFamily:FC,color:"#999",textDecoration:"line-through"}}>${MTC_START_AHR.toFixed(2)}</div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:36,color:ahrHit?"#007A33":"#E3000B"}}>${finalAHR.toFixed(2)}</div>
          <div style={{fontSize:14,fontFamily:FC,fontWeight:700,color:"#ccc",marginTop:2}}>AHR</div>
          <span style={{fontSize:11,fontFamily:FC,fontWeight:800,padding:"4px 8px 3px",borderRadius:6,lineHeight:1,background:ahrHit?"rgba(0,122,51,0.2)":"rgba(227,0,11,0.2)",color:ahrHit?"#007A33":"#E3000B",marginTop:6,display:"inline-block"}}>{ahrHit?"ON TARGET":"OVER"}</span>
        </div>
        <div style={{background:"#000",borderRadius:14,padding:"24px 16px",textAlign:"center"}}>
          <div style={{fontSize:13,fontFamily:FC,color:"#999",textDecoration:"line-through"}}>${MTC_START_SPLH}</div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:36,color:splhOk?"#007A33":"#E3000B"}}>${Math.round(finalSPLH)}</div>
          <div style={{fontSize:14,fontFamily:FC,fontWeight:700,color:"#ccc",marginTop:2}}>SPLH</div>
          <span style={{fontSize:11,fontFamily:FC,fontWeight:800,padding:"4px 8px 3px",borderRadius:6,lineHeight:1,background:splhOk?"rgba(0,122,51,0.2)":"rgba(227,0,11,0.2)",color:splhOk?"#007A33":"#E3000B",marginTop:6,display:"inline-block"}}>{splhOk?"IN BAND":"OUT OF BAND"}</span>
        </div>
      </div>
      {/* Decision review */}
      {decisions.map((d,i)=>(<div key={i} style={{borderLeft:`3px solid ${d.correct?"#007A33":"#E3000B"}`,background:"#fff",borderRadius:"0 12px 12px 0",padding:14,marginBottom:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{d.day} {d.time}</div><div style={{fontSize:13,color:"#555",fontFamily:FB}}>{d.choiceLabel}</div></div>
          {d.correct?<span style={{fontFamily:FC,fontWeight:800,fontSize:11,color:"#007A33"}}>CORRECT</span>
          :<span style={{fontFamily:FC,fontWeight:800,fontSize:11,color:"#E3000B"}}>{MTC_ERROR_TYPES[d.errorType]||"WRONG"}</span>}
        </div>
        <div style={{fontSize:13,color:"#555",fontFamily:FB,marginTop:4,lineHeight:1.5}}>{d.lesson}</div>
      </div>))}
      {/* Error pattern */}
      {topError&&<div style={{background:"#FFF8E0",border:"1px solid #FFD300",borderRadius:12,padding:14,marginTop:12,marginBottom:16}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#000",marginBottom:4}}>YOUR PATTERN</div>
        <div style={{fontSize:13,fontFamily:FB,color:"#555"}}>{topError[1]} of your errors were <strong>{MTC_ERROR_TYPES[topError[0]]?.toLowerCase()}</strong>. That's the habit to fix first.</div>
      </div>}
      <button style={{...BY,width:"100%",fontSize:17,marginTop:8}} onClick={()=>setScreen("verdict")}>SEE VERDICT</button>
    </div>)}

    {/* Verdict */}
    {screen==="verdict"&&(<div style={{padding:"24px 20px",display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{background:"#000",borderRadius:16,padding:24,marginBottom:24}}>
        <div style={{fontSize:16,fontFamily:FB,lineHeight:1.8,color:"#ccc",textAlign:"center"}}>{getVerdict()}</div>
      </div>
      {ahrHit&&splhOk&&<div style={{textAlign:"center",marginBottom:16,fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300"}}>BONUS EARNED +{ch.bonusPoints} PTS</div>}
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Make the Call completed",startingAHR:MTC_START_AHR,finalAHR,targetAHR:MTC_TARGET,ahrHit,startingSPLH:MTC_START_SPLH,finalSPLH,splhInBand:splhOk,correctCount,decisions,verdict:getVerdict(),claimedBonus:ahrHit&&splhOk,autoBonus:ahrHit&&splhOk,points:ch.points});}}>COMPLETE CHALLENGE</button>
    </div>)}
  </div>);
}

// ─── SWAP THE SHIFT (NGL Week 2) ────────────────────────────────────────────
const SWAP_ROSTER=[
  {id:1,name:"Jordan",classification:"Casual 21+",rate:33.19,hours:38,weeklyCost:1261,swappable:true},
  {id:2,name:"Mia",classification:"Casual 21+",rate:33.19,hours:35,weeklyCost:1162,swappable:true},
  {id:3,name:"Tyler",classification:"Casual 21+",rate:33.19,hours:32,weeklyCost:1062,swappable:true},
  {id:4,name:"Aisha",classification:"Casual 19",rate:26.52,hours:40,weeklyCost:1061,swappable:true},
  {id:5,name:"Luca",classification:"Casual 19",rate:26.52,hours:36,weeklyCost:955,swappable:false},
  {id:6,name:"Ben",classification:"Casual 16",rate:16.57,hours:28,weeklyCost:464,swappable:false},
  {id:7,name:"Chloe",classification:"PT/FT 21+",rate:26.56,hours:38,weeklyCost:1009,swappable:false},
  {id:8,name:"Finn",classification:"PT/FT 21+",rate:26.56,hours:35,weeklyCost:930,swappable:false},
  {id:9,name:"Ruby",classification:"PT/FT 19",rate:21.24,hours:32,weeklyCost:680,swappable:false},
  {id:10,name:"Noah",classification:"Casual 21+",rate:33.19,hours:32,weeklyCost:1062,swappable:true},
];
const SWAP_OPTIONS={
  1:{newClassification:"PT/FT 21+",newRate:26.56,savingPerHour:6.63,weeklySaving:252,annualSaving:13100,context:"38 hrs/wk casual for 14 months. Eligible for permanent. Same hours, lower cost."},
  2:{newClassification:"Casual 19",newRate:26.52,savingPerHour:6.67,weeklySaving:233,annualSaving:12134,context:"35 hrs/wk casual adult. Swapping to a junior rate saves $6.67 every hour she works."},
  3:{newClassification:"PT/FT 21+",newRate:26.56,savingPerHour:6.63,weeklySaving:212,annualSaving:11038,context:"32 hrs/wk casual adult. Permanency converts the casual loading into entitlements."},
  4:{newClassification:"PT/FT 19",newRate:21.24,savingPerHour:5.28,weeklySaving:211,annualSaving:10985,context:"40 hrs/wk casual 19. Converting to part-time saves $5.28/hr. She keeps her hours."},
  10:{newClassification:"Casual 19",newRate:26.52,savingPerHour:6.67,weeklySaving:213,annualSaving:11098,context:"32 hrs/wk casual adult. Same as Mia - the age difference is worth $6.67/hr."},
};
const SWAP_TOTAL_HOURS=546;const SWAP_STARTING_AHR=38.50;const SWAP_TARGET=37.10;const SWAP_MAX_ANNUAL=58298;

function SwapTheShift({ch,done,onS,onB,user,actCfg}){
  const roster=actCfg?.swap_the_shift?.roster||SWAP_ROSTER;
  const swaps=actCfg?.swap_the_shift?.swaps||SWAP_OPTIONS;
  const totalHours=SWAP_TOTAL_HOURS;const startingAHR=SWAP_STARTING_AHR;const target=SWAP_TARGET;
  const[screen,setScreen]=useState("brief");
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[screen]);
  const[swapsLeft,setSwapsLeft]=useState(5);const[decisions,setDecisions]=useState([]);const[selectedCrew,setSelectedCrew]=useState(null);
  const[rosterState,setRosterState]=useState(roster.map(c=>({...c,currentRate:c.rate,currentClass:c.classification,decided:false,action:null})));
  const[displayAHR,setDisplayAHR]=useState(startingAHR);const[tooltip,setTooltip]=useState(null);

  const calcAHR=(rs)=>{const tc=rs.reduce((s,c)=>s+c.currentRate*c.hours,0);return tc/totalHours;};
  const currentAHR=calcAHR(rosterState);

  const animateAHR=(from,to)=>{const steps=20;const stepTime=40;const stepVal=(to-from)/steps;let cur=from;let step=0;
    const iv=setInterval(()=>{step++;cur+=stepVal;setDisplayAHR(cur);if(step>=steps){clearInterval(iv);setDisplayAHR(to);}},stepTime);};

  const handleSwap=(crewId)=>{const sw=swaps[crewId];if(!sw)return;const oldAHR=currentAHR;
    setRosterState(rs=>rs.map(c=>c.id===crewId?{...c,currentRate:sw.newRate,currentClass:sw.newClassification,decided:true,action:"swap"}:c));
    setDecisions(d=>[...d,{crewId,name:roster.find(c=>c.id===crewId)?.name,action:"swap",weeklySaving:sw.weeklySaving,annualSaving:sw.annualSaving}]);
    setSwapsLeft(s=>s-1);setSelectedCrew(null);
    setTimeout(()=>{const newRS=rosterState.map(c=>c.id===crewId?{...c,currentRate:sw.newRate,currentClass:sw.newClassification,decided:true,action:"swap"}:c);animateAHR(oldAHR,calcAHR(newRS));},100);};

  const handlePass=(crewId)=>{const sw=swaps[crewId];
    setRosterState(rs=>rs.map(c=>c.id===crewId?{...c,decided:true,action:"pass"}:c));
    setDecisions(d=>[...d,{crewId,name:roster.find(c=>c.id===crewId)?.name,action:"pass",weeklySaving:0,missedSaving:sw?.annualSaving||0}]);
    setSwapsLeft(s=>s-1);setSelectedCrew(null);};

  useEffect(()=>{if(swapsLeft===0&&screen==="roster")setTimeout(()=>setScreen("results"),1000);},[swapsLeft]);

  const totalWeeklySaving=decisions.filter(d=>d.action==="swap").reduce((s,d)=>s+d.weeklySaving,0);
  const totalAnnualSaving=decisions.filter(d=>d.action==="swap").reduce((s,d)=>s+d.annualSaving,0);
  const totalMissed=decisions.filter(d=>d.action==="pass").reduce((s,d)=>s+(d.missedSaving||0),0);
  const biggestMissed=decisions.filter(d=>d.action==="pass").sort((a,b)=>(b.missedSaving||0)-(a.missedSaving||0))[0];
  const finalAHR=calcAHR(rosterState);
  const getVerdict=()=>{if(finalAHR<=37.10)return"You got there. That is what one conversation with the right crew member is worth.";
    if(finalAHR<=37.30){const bm=biggestMissed;return`Close. One more swap and you're there. The lever was ${bm?.name}'s conversion.`;}
    return biggestMissed?`The biggest saving was sitting in ${biggestMissed.name}'s row. That swap alone was worth $${(biggestMissed.missedSaving||0).toLocaleString()} a year.`:"Every swap you passed on had real money attached to it.";};

  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>

    {/* Brief */}
    {screen==="brief"&&(<div style={{padding:"24px 20px"}}>
      <div style={{background:"#000",borderRadius:16,padding:24,color:"#fff",marginBottom:20}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,marginBottom:16}}>GYG HARRINGTON PARK</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"#1a1a1a",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#E3000B"}}>${startingAHR.toFixed(2)}</div><div style={{fontSize:10,color:"#888",fontFamily:FC,marginTop:2}}>THIS WEEK'S AHR</div></div>
          <div style={{background:"#1a1a1a",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#007A33"}}>${target.toFixed(2)}</div><div style={{fontSize:10,color:"#888",fontFamily:FC,marginTop:2}}>NETWORK TARGET</div></div>
          <div style={{background:"#1a1a1a",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24}}>{totalHours}</div><div style={{fontSize:10,color:"#888",fontFamily:FC,marginTop:2}}>TOTAL CREW HOURS</div></div>
          <div style={{background:"#1a1a1a",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#FFD300"}}>5</div><div style={{fontSize:10,color:"#888",fontFamily:FC,marginTop:2}}>SWAP DECISIONS</div></div>
        </div>
      </div>
      <div style={{borderLeft:"4px solid #FFD300",background:"#fff",borderRadius:"0 14px 14px 0",padding:16,marginBottom:20}}>
        <div style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#555"}}>You have 5 swap decisions. Each one moves the number. Approve or pass - each decision is final. Choose well.</div>
      </div>
      <button style={{...BY,width:"100%"}} onClick={()=>setScreen("roster")}>SEE THE ROSTER</button>
    </div>)}

    {/* Roster */}
    {screen==="roster"&&(<div style={{padding:"0 20px"}}>
      {/* Fixed AHR header */}
      <div style={{position:"sticky",top:56,background:"#f5f5f0",zIndex:10,padding:"12px 0",borderBottom:"1px solid #e8e8e3"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:900,fontSize:32,color:displayAHR<=target?"#007A33":displayAHR<=target+0.5?"#FFB800":"#E3000B",transition:"color 0.3s"}}>${displayAHR.toFixed(2)}</div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>CURRENT AHR | Target: ${target.toFixed(2)}</div></div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:16,color:swapsLeft>0?"#FFD300":"#888",background:"#000",padding:"8px 14px",borderRadius:10}}>{swapsLeft} LEFT</div>
        </div>
      </div>
      {/* Crew list */}
      <div style={{paddingTop:12,paddingBottom:20}}>
        {rosterState.map(c=>{const sw=swaps[c.id];const isSwappable=c.swappable&&!c.decided&&swapsLeft>0;
          return(<div key={c.id} onClick={()=>{if(c.decided)return;if(!c.swappable){setTooltip(c.id);setTimeout(()=>setTooltip(null),1500);return;}if(swapsLeft<=0)return;setSelectedCrew(c.id);}}
            style={{display:"flex",alignItems:"center",padding:"14px 16px",background:c.action==="swap"?"rgba(0,122,51,0.06)":c.action==="pass"?"rgba(227,0,11,0.04)":"#fff",border:`1px solid ${c.action==="swap"?"#d4e8d4":c.action==="pass"?"#f0d0d0":"#e8e8e3"}`,borderRadius:12,marginBottom:6,cursor:isSwappable?"pointer":"default",opacity:!c.swappable&&!c.decided?0.6:1,position:"relative",transition:"all 0.2s"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{c.name}</div>
              <div style={{fontSize:12,color:"#888",fontFamily:FB}}>{c.currentClass} - ${c.currentRate}/hr - {c.hours}hrs</div>
            </div>
            {c.action==="swap"&&<span style={{fontFamily:FC,fontWeight:800,fontSize:10,color:"#007A33",background:"#f0f8f0",padding:"5px 8px 4px",borderRadius:6,lineHeight:1}}>SWAPPED</span>}
            {c.action==="pass"&&<span style={{fontFamily:FC,fontWeight:800,fontSize:10,color:"#E3000B",background:"#fef0f0",padding:"5px 8px 4px",borderRadius:6,lineHeight:1}}>PASSED</span>}
            {isSwappable&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>}
            {tooltip===c.id&&<div style={{position:"absolute",top:-36,left:"50%",transform:"translateX(-50%)",background:"#007A33",color:"#fff",padding:"7px 14px 6px",borderRadius:8,lineHeight:1,fontFamily:FC,fontWeight:700,fontSize:11,letterSpacing:0.5,whiteSpace:"nowrap",zIndex:20}}>ALREADY OPTIMISED</div>}
          </div>);
        })}
      </div>
    </div>)}

    {/* Swap card overlay */}
    {selectedCrew&&(()=>{const c=rosterState.find(x=>x.id===selectedCrew);const sw=swaps[selectedCrew];if(!c||!sw)return null;
      return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",flexDirection:"column",justifyContent:"center",padding:24}}>
        <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:400,margin:"0 auto",width:"100%"}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#FFD300",letterSpacing:1,textAlign:"center",marginBottom:16}}>SWAP AVAILABLE</div>
          {/* Current */}
          <div style={{background:"#f5f5f0",borderRadius:12,padding:14,marginBottom:8}}>
            <div style={{fontFamily:FC,fontWeight:800,fontSize:16}}>{c.name}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontSize:12,fontFamily:FC,color:"#888"}}>{c.classification}</span>
              <span style={{fontFamily:FC,fontWeight:900,fontSize:16}}>${c.rate}/hr</span>
            </div>
            <div style={{fontSize:12,color:"#888",fontFamily:FB,marginTop:2}}>{c.hours} hrs this week</div>
          </div>
          {/* Arrow */}
          <div style={{textAlign:"center",padding:"4px 0"}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          {/* Swap to */}
          <div style={{background:"#FFF8E0",borderRadius:12,padding:14,marginBottom:16,border:"2px solid #FFD300"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#000"}}>{sw.newClassification}</span>
              <span style={{fontFamily:FC,fontWeight:900,fontSize:16}}>${sw.newRate}/hr</span>
            </div>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:13,color:"#007A33",marginTop:4}}>Saves ${sw.savingPerHour}/hr</div>
          </div>
          {/* Impact */}
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:14,fontFamily:FC,fontWeight:700,color:"#888"}}>Weekly: <span style={{color:"#007A33"}}>${sw.weeklySaving}</span></div>
            <div style={{fontFamily:FC,fontWeight:900,fontSize:36,color:"#E3000B",marginTop:4}}>${sw.annualSaving.toLocaleString()}<span style={{fontSize:14,color:"#888"}}>/year</span></div>
          </div>
          <div style={{fontSize:13,color:"#666",fontFamily:FB,textAlign:"center",marginBottom:20,lineHeight:1.5}}>{sw.context}</div>
          <button style={{...BY,width:"100%",marginBottom:8}} onClick={()=>handleSwap(selectedCrew)}>MAKE THE SWAP</button>
          <button style={{width:"100%",padding:"14px",background:"#fff",border:"2px solid #1a1a1a",borderRadius:14,fontFamily:FC,fontWeight:800,fontSize:15,letterSpacing:1,cursor:"pointer",color:"#1a1a1a"}} onClick={()=>handlePass(selectedCrew)}>LEAVE IT</button>
        </div>
      </div>);})()}

    {/* Results */}
    {screen==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:22,fontFamily:FC,fontWeight:900,letterSpacing:1}}>YOUR ROSTER</div></div>
      {/* AHR comparison */}
      <div style={{background:"#000",borderRadius:16,padding:20,marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:14,fontFamily:FC,color:"#888",textDecoration:"line-through"}}>${startingAHR.toFixed(2)}</div>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:44,color:finalAHR<=target?"#007A33":"#E3000B",marginTop:4}}>${finalAHR.toFixed(2)}</div>
        <div style={{fontSize:12,fontFamily:FC,color:"#888",marginTop:4}}>TARGET: ${target.toFixed(2)}</div>
        <div style={{height:8,background:"#333",borderRadius:4,marginTop:12,position:"relative"}}>
          <div style={{position:"absolute",left:`${Math.max(0,Math.min(100,((target-34)/6)*100))}%`,top:-2,width:2,height:12,background:"#007A33"}}/>
          <div style={{position:"absolute",left:`${Math.max(0,Math.min(100,((finalAHR-34)/6)*100))}%`,top:-4,width:16,height:16,borderRadius:8,background:finalAHR<=target?"#007A33":"#E3000B",transform:"translateX(-8px)"}}/>
        </div>
      </div>
      {/* Savings */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:22,color:totalWeeklySaving>0?"#007A33":"#888"}}>${totalWeeklySaving.toLocaleString()}</div><div style={{fontSize:11,color:"#888",fontFamily:FC}}>WEEKLY SAVING</div></div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:22,color:totalAnnualSaving>0?"#007A33":"#888"}}>${totalAnnualSaving.toLocaleString()}</div><div style={{fontSize:11,color:"#888",fontFamily:FC}}>ANNUAL SAVING</div></div>
      </div>
      {/* Swaps made */}
      {decisions.filter(d=>d.action==="swap").length>0&&(<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#007A33",marginBottom:8}}>SWAPS MADE</div>
        {decisions.filter(d=>d.action==="swap").map((d,i)=>{const sw=swaps[d.crewId];const orig=roster.find(c=>c.id===d.crewId);return(
          <div key={i} style={{borderLeft:"3px solid #007A33",background:"#fff",borderRadius:"0 12px 12px 0",padding:12,marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{d.name}: {orig?.classification} → {sw?.newClassification}</span><span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#007A33"}}>${d.annualSaving.toLocaleString()}/yr</span></div>
          </div>);})}
      </div>)}
      {/* Swaps passed */}
      {decisions.filter(d=>d.action==="pass").length>0&&(<div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#E3000B",marginBottom:8}}>LEFT ON THE TABLE</div>
        {decisions.filter(d=>d.action==="pass").map((d,i)=>{const sw=swaps[d.crewId];const orig=roster.find(c=>c.id===d.crewId);return(
          <div key={i} style={{borderLeft:"3px solid #E3000B",background:"#fff",borderRadius:"0 12px 12px 0",padding:12,marginBottom:4}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{d.name}: could have been {sw?.newClassification}</span><span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#E3000B"}}>${(d.missedSaving||0).toLocaleString()}/yr</span></div>
          </div>);})}
      </div>)}
      {/* Benchmark */}
      <div style={{background:"#f8f8f5",borderRadius:12,padding:14,marginBottom:16,fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#555"}}>
        The 5 best swaps on this roster were worth <strong style={{color:"#E3000B"}}>${SWAP_MAX_ANNUAL.toLocaleString()}</strong> a year. You found <strong style={{color:"#007A33"}}>${totalAnnualSaving.toLocaleString()}</strong>.
      </div>
      <button style={{...BY,width:"100%"}} onClick={()=>setScreen("verdict")}>SEE VERDICT</button>
    </div>)}

    {/* Verdict */}
    {screen==="verdict"&&(<div style={{padding:"24px 20px",display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{background:"#000",borderRadius:16,padding:24,marginBottom:24}}>
        <div style={{fontSize:16,fontFamily:FB,lineHeight:1.8,color:"#fff",textAlign:"center"}}>{getVerdict()}</div>
      </div>
      {finalAHR<=target&&<div style={{textAlign:"center",marginBottom:16,fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300"}}>BONUS EARNED +{ch.bonusPoints} PTS</div>}
      <button style={{...BY,width:"100%"}} onClick={()=>{onS({text:"Swap the Shift completed",startingAHR,finalAHR,targetAHR:target,hitTarget:finalAHR<=target,swapsMade:decisions.filter(d=>d.action==="swap"),swapsPassed:decisions.filter(d=>d.action==="pass"),totalWeeklySaving,totalAnnualSaving,maxPossibleSaving:SWAP_MAX_ANNUAL,captureRate:Math.round((totalAnnualSaving/SWAP_MAX_ANNUAL)*100),claimedBonus:finalAHR<=target,autoBonus:finalAHR<=target,points:ch.points});}}>COMPLETE CHALLENGE</button>
    </div>)}
  </div>);
}

// ─── PERM OR PASS (NGL Week 3) ──────────────────────────────────────────────
const PERM_PROFILES=[
  {id:"p1",name:"Sarah",months:8,avgHours:38,classification:"Casual 21+",rate:33.19,objection:"I like my 25%. I'd rather stay casual.",options:[{id:"a",text:"Explain that the 25% loading is designed to replace entitlements she's missing out on - sick leave, annual leave, super, and bonus.",lands:true},{id:"b",text:"Tell her she's already working full-time hours so she should just go permanent.",lands:false,reason:"Telling doesn't land. Show her what the 25% actually replaces - and what she's giving up by keeping it."},{id:"c",text:"Say the business needs her to convert for compliance reasons.",lands:false,reason:"Making it about the business kills the conversation. Make it about her - what she gains, not what you need."}],coachingTip:"Sarah is already working 38 hrs/wk. She's not getting flexibility - she's getting a loading instead of real entitlements. Show the trade: $33.19/hr casual vs $26.56/hr PT, but PT gives sick leave, annual leave, super on every hour, and bonus eligibility.",businessSaving:"Sarah at 38 hrs/wk casual costs $1,261/week. As PT: $1,009/week. Business saves $252/week = $13,100/year."},
  {id:"p2",name:"Marcus",months:11,avgHours:35,classification:"Casual 21+",rate:33.19,objection:"I want flexibility. Permanent feels too full on.",options:[{id:"a",text:"Offer a part-time contract at his current hours - same flexibility, with entitlements.",lands:true},{id:"b",text:"Tell him permanent doesn't mean more hours.",lands:false,reason:"True but not enough. Show him that PT at 35 hrs is the same schedule he already works - just with benefits added."},{id:"c",text:"Explain that the business really needs more permanent staff.",lands:false,reason:"He doesn't care about the business need. He cares about his flexibility. Address his concern, not yours."}],coachingTip:"Marcus can get a PT contract at 35 hrs/wk. Same hours, same flexibility, plus entitlements.",businessSaving:"Marcus at 35 hrs/wk casual: $1,162/week. As PT: $930/week. Saves $232/week = $12,064/year."},
  {id:"p3",name:"Priya",months:6,avgHours:32,classification:"Casual 21+",rate:33.19,objection:"I'm not sure I'll be here long enough to bother.",options:[{id:"a",text:"Explain that entitlements accrue from day one - even 3 months of sick leave, annual leave, and super is better than zero.",lands:true},{id:"b",text:"Tell her she should commit to the job if she wants to get ahead.",lands:false,reason:"Pressuring commitment doesn't work. Show her that even short-term, she's leaving money on the table as casual."},{id:"c",text:"Say you'll revisit the conversation in a few months when she's settled in.",lands:false,reason:"Delaying means she misses out on months of entitlements she could be accruing right now."}],coachingTip:"Entitlements accrue from day one. Even if Priya leaves in 3 months, she'll have earned sick leave, annual leave, and super.",businessSaving:"Priya at 32 hrs/wk casual: $1,062/week. As PT: $850/week. Saves $212/week = $11,024/year."},
  {id:"p4",name:"Jake",months:14,avgHours:40,classification:"Casual 21+",rate:33.19,objection:"Will my pay go down? I don't want to lose money.",options:[{id:"a",text:"Be honest: base rate reduces from $33.19 to $26.56, but he gains annual leave, sick leave, super on every hour, and bonus eligibility. Show the full picture.",lands:true},{id:"b",text:"Tell him his take-home will be roughly the same once you factor in benefits.",lands:false,reason:"His take-home WILL be lower week to week. Sugarcoating it breaks trust. Be honest about the rate drop and show what he gains instead."},{id:"c",text:"Avoid the pay question and focus on job security.",lands:false,reason:"Jake asked a direct question. Dodging it tells him you're hiding something. Answer it straight."}],coachingTip:"The honest answer: base rate goes from $33.19/hr to $26.56/hr. That's $6.63/hr less in cash. But he gains annual leave, sick leave, super on every hour, and bonus eligibility.",businessSaving:"Jake at 40 hrs/wk casual: $1,328/week. As PT: $1,062/week. Saves $266/week = $13,832/year."},
  {id:"p5",name:"Lena",months:9,avgHours:30,classification:"Casual 21+",rate:33.19,objection:"My manager before you said it was fine to stay casual.",options:[{id:"a",text:"Reframe from what was said before to what's best for her now - not what the business wants, but what she's personally missing out on.",lands:true},{id:"b",text:"Say that policy has changed and everyone needs to convert.",lands:false,reason:"Making it about policy makes her feel forced. Make it about her benefit."},{id:"c",text:"Agree that casual is fine if that's what she prefers.",lands:false,reason:"Avoiding the conversation means she keeps missing out on entitlements."}],coachingTip:"This isn't about what was said before. It's about what's best for Lena now. Reframe from policy to personal benefit.",businessSaving:"Lena at 30 hrs/wk casual: $996/week. As PT: $797/week. Saves $199/week = $10,348/year."},
];
function PermOrPass({ch,done,onS,onB,user,actCfg}){
  const profiles=actCfg?.perm_or_pass?.profiles||PERM_PROFILES;
  const[profIdx,setProfIdx]=useState(0);const[selected,setSelected]=useState(null);const[locked,setLocked]=useState(false);const[results,setResults]=useState([]);const[phase,setPhase]=useState("intro");
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);
  const prof=profiles[profIdx];const correctCount=results.filter(r=>r.correct).length;
  const lockIn=()=>{if(selected===null)return;setLocked(true);const opt=prof.options.find(o=>o.id===selected);const r={profileId:prof.id,chosenOption:selected,correct:!!opt?.lands};setResults(p=>[...p,r]);};
  const nextProfile=()=>{setSelected(null);setLocked(false);if(profIdx<profiles.length-1){setProfIdx(p=>p+1);}else setPhase("results");};
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setPhase("play")} startLabel="START"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {phase==="play"&&prof&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#999",textAlign:"center",marginBottom:12}}>{profIdx+1}/{profiles.length}</div>
      {/* Profile card */}
      <div style={{background:"#000",borderRadius:16,padding:20,marginBottom:16,color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:48,height:48,borderRadius:24,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:22,color:"#000",lineHeight:1,padding:"2px 0 0"}}>{prof.name[0]}</div>
          <div><div style={{fontFamily:FC,fontWeight:900,fontSize:20}}>{prof.name.toUpperCase()}</div><div style={{fontSize:12,color:"#888",fontFamily:FB}}>{prof.months} months casual | {prof.avgHours} hrs/wk | ${prof.rate}/hr</div></div>
        </div>
        <span style={{padding:"4px 10px",background:"rgba(255,211,0,0.2)",color:"#FFD300",borderRadius:6,fontFamily:FC,fontWeight:700,fontSize:11}}>{prof.classification}</span>
      </div>
      {/* Objection */}
      <div style={{borderLeft:"4px solid #FFD300",background:"#fff",borderRadius:"0 14px 14px 0",padding:16,marginBottom:16}}>
        <div style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#FFB800",marginBottom:4}}>THEIR OBJECTION</div>
        <div style={{fontSize:15,fontFamily:FB,lineHeight:1.6,fontStyle:"italic"}}>"{prof.objection}"</div>
      </div>
      {/* Options */}
      {!locked&&(<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {prof.options.map(opt=>(<button key={opt.id} onClick={()=>setSelected(opt.id)} style={{padding:"14px 16px",background:selected===opt.id?"#FFF8E0":"#fff",border:selected===opt.id?"2px solid #FFD300":"1px solid #e8e8e3",borderRadius:12,textAlign:"left",fontSize:14,fontFamily:FB,color:"#1a1a1a",cursor:"pointer"}}>{opt.text}</button>))}
        <button style={{...BY,width:"100%",opacity:selected?1:0.4}} disabled={!selected} onClick={lockIn}>LOCK IN</button>
      </div>)}
      {/* Reveal */}
      {locked&&(()=>{const opt=prof.options.find(o=>o.id===selected);const correct=opt?.lands;return(<div>
        <div style={{background:correct?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",border:`2px solid ${correct?"#007A33":"#E3000B"}`,borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            {correct?<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            :<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
            <span style={{fontFamily:FC,fontWeight:900,fontSize:16,color:correct?"#007A33":"#E3000B"}}>{correct?"THAT LANDS":"DOESN'T LAND"}</span>
          </div>
          <div style={{fontSize:14,color:"#555",fontFamily:FB,lineHeight:1.6}}>{correct?prof.coachingTip:opt?.reason}</div>
        </div>
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#FFD300",marginBottom:6}}>BUSINESS IMPACT</div>
          <div style={{fontSize:14,color:"#fff",fontFamily:FB,lineHeight:1.6}}>{prof.businessSaving}</div>
        </div>
        <button style={{...BY,width:"100%"}} onClick={nextProfile}>{profIdx<profiles.length-1?"NEXT PROFILE":"VIEW RESULTS"}</button>
      </div>);})()}
    </div>)}
    {phase==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:24}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{correctCount}/{profiles.length}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>CONVERSATIONS LANDED</div>
      </div>
      {results.map((r,i)=>{const p=profiles.find(x=>x.id===r.profileId);return(<div key={i} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #e8e8e3"}}>
        <div><div style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{p?.name}</div><div style={{fontSize:14,color:"#555",fontFamily:FB}}>"{p?.objection?.substring(0,40)}..."</div></div>
        <span style={{fontFamily:FC,fontWeight:900,color:r.correct?"#007A33":"#E3000B"}}>{r.correct?"LANDED":"MISSED"}</span>
      </div>);})}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:16,marginBottom:16}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5,marginBottom:4}}>KEY NUMBER</div>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#E3000B"}}>~$12,000/year</div>
        <div style={{fontSize:14,color:"#ccc",fontFamily:FB}}>Average saving per casual-to-permanent conversion</div>
      </div>
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{const earnedPts=Math.round(ch.points*(correctCount/profiles.length));onS({text:"Perm or Pass completed",profiles:results,correctCount,weakestArea:results.filter(r=>!r.correct).map(r=>profiles.find(p=>p.id===r.profileId)?.name).join(", "),claimedBonus:correctCount===profiles.length,autoBonus:correctCount===profiles.length,points:earnedPts});}}>SUBMIT</button>
    </div>)}
  </div>);
}

// ─── YOUR RESTAURANT, YOUR NUMBER (NGL Week 4) ─────────────────────────────
function YourRestaurant({ch,done,onS,onB,user,comps:myComps,actCfg}){const[users,setUsers]=useState([]);const[comps,setLocalComps]=useState(myComps||[]);useEffect(()=>{Promise.all([getUsersByBatch(user.batch),getCompletionsByBatch(user.batch)]).then(([u,c])=>{setUsers(u);setLocalComps(c);});},[user.batch]);
  const[phase,setPhase]=useState("intro");const[step,setStep]=useState(1);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[phase]);
  const[ahrVal,setAhrVal]=useState(37.10);const[juniorPct,setJuniorPct]=useState(10);const[permPct,setPermPct]=useState(30);const[showLever,setShowLever]=useState(false);const[showShare,setShowShare]=useState(false);
  const calcProjection=()=>{const levers=[];
    if(permPct<40){const hrs=546*((40-permPct)/100);const ws=hrs*6.63;levers.push({name:"Increase permanent mix to 40%",weeklySaving:Math.round(ws),annualSaving:Math.round(ws*52),newAHR:ahrVal-(hrs*6.63)/546});}
    if(juniorPct<15){const hrs=546*((15-juniorPct)/100);const ws=hrs*6.67;levers.push({name:"Increase junior mix to 15%",weeklySaving:Math.round(ws),annualSaving:Math.round(ws*52),newAHR:ahrVal-(hrs*6.67)/546});}
    return levers.sort((a,b)=>b.annualSaving-a.annualSaving)[0]||{name:"Already optimised",weeklySaving:0,annualSaving:0,newAHR:ahrVal};};
  const lever=calcProjection();
  // Cohort ranking
  const batchComps=(comps||[]).filter(c=>c.challengeId==="ng-w4"&&c.batch===user.batch);
  const allAHRs=[...batchComps.map(c=>c.submission?.currentAHR).filter(Boolean),ahrVal].sort((a,b)=>Math.abs(a-37.10)-Math.abs(b-37.10));
  const rank=allAHRs.indexOf(ahrVal)+1;const total=allAHRs.length;
  const quartile=ahrVal<=36.50?"Top 25%":ahrVal<=37.10?"Second 25%":ahrVal<=38.00?"Third 25%":"Bottom 25%";
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(phase==="intro")return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setPhase("input")} startLabel="START"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {phase==="input"&&(<div style={{padding:"24px 20px"}}>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>{[1,2,3].map(s=>(<div key={s} style={{width:12,height:12,borderRadius:6,background:s<step?"#007A33":s===step?"#FFD300":"#ddd"}}/>))}</div>
      {step===1&&(<div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:16,marginBottom:4}}>YOUR CURRENT AHR</div>
        <div style={{fontSize:13,color:"#888",fontFamily:FB,marginBottom:16}}>Slide to your restaurant's current Average Hourly Rate</div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:48,fontWeight:900,fontFamily:FC,color:"#000"}}>${ahrVal.toFixed(2)}</div>
        </div>
        <input type="range" min="3000" max="4500" value={Math.round(ahrVal*100)} onChange={e=>setAhrVal(parseInt(e.target.value)/100)} style={{width:"100%",accentColor:"#FFD300",height:8}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:"#888"}}>$30.00</span><span style={{fontSize:10,color:"#888"}}>$45.00</span></div>
        <button style={{...BY,width:"100%",marginTop:24}} onClick={()=>setStep(2)}>NEXT</button>
      </div>)}
      {step===2&&(<div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:16,marginBottom:4}}>CREW AGE MIX</div>
        <div style={{fontSize:13,color:"#888",fontFamily:FB,marginBottom:16}}>What percentage of your crew are juniors (16-19)?</div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:48,fontWeight:900,fontFamily:FC}}>{juniorPct}%</div>
          <div style={{fontSize:12,color:"#888",fontFamily:FC}}>Junior (16-19)</div>
        </div>
        <input type="range" min="0" max="50" value={juniorPct} onChange={e=>setJuniorPct(parseInt(e.target.value))} style={{width:"100%",accentColor:"#FFD300",height:8}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <div style={{flex:juniorPct,background:"#FFD300",height:24,borderRadius:"8px 0 0 8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontFamily:FC,fontWeight:700,minWidth:juniorPct>5?40:0,transition:"flex 0.3s"}}>{juniorPct>5?`${juniorPct}% Junior`:""}</div>
          <div style={{flex:100-juniorPct,background:"#1a1a1a",height:24,borderRadius:"0 8px 8px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontFamily:FC,fontWeight:700,color:"#fff",transition:"flex 0.3s"}}>{100-juniorPct}% Adult</div>
        </div>
        <button style={{...BY,width:"100%",marginTop:24}} onClick={()=>setStep(3)}>NEXT</button>
      </div>)}
      {step===3&&(<div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:16,marginBottom:4}}>CLASSIFICATION MIX</div>
        <div style={{fontSize:13,color:"#888",fontFamily:FB,marginBottom:16}}>What percentage of your team is permanent (PT/FT)?</div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:48,fontWeight:900,fontFamily:FC,color:"#000"}}>{permPct}%</div>
          <div style={{fontSize:12,color:"#888",fontFamily:FC}}>Permanent (PT/FT)</div>
        </div>
        <input type="range" min="0" max="80" value={permPct} onChange={e=>setPermPct(parseInt(e.target.value))} style={{width:"100%",accentColor:"#FFD300",height:8}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <div style={{flex:permPct,background:"#007A33",height:24,borderRadius:"8px 0 0 8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontFamily:FC,fontWeight:700,color:"#fff",minWidth:permPct>10?40:0,transition:"flex 0.3s"}}>{permPct>10?`${permPct}% Perm`:""}</div>
          <div style={{flex:100-permPct,background:"#E3000B",height:24,borderRadius:"0 8px 8px 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontFamily:FC,fontWeight:700,color:"#fff",transition:"flex 0.3s"}}>{100-permPct}% Casual</div>
        </div>
        <button style={{...BY,width:"100%",marginTop:24}} onClick={()=>setPhase("results")}>SEE MY RESULTS</button>
      </div>)}
    </div>)}
    {phase==="results"&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:F107,fontWeight:900,fontSize:24,letterSpacing:0.5,color:"#000"}}>YOUR NUMBERS</div></div>
      {/* AHR vs target */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,border:"1px solid #e8e8e3"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>YOUR AHR</span><span style={{fontFamily:FC,fontWeight:900,fontSize:28,color:ahrVal<=37.10?"#007A33":"#E3000B"}}>${ahrVal.toFixed(2)}</span></div>
        <div style={{fontSize:12,color:"#888",fontFamily:FB}}>Network target: $37.10 | Gap: <span style={{color:ahrVal>37.10?"#E3000B":"#007A33",fontWeight:700}}>{ahrVal>37.10?"+":""}${(ahrVal-37.10).toFixed(2)}</span></div>
      </div>
      {/* Bench mix */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,border:"1px solid #e8e8e3"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>PERM MIX</span><span style={{fontFamily:FC,fontWeight:900,fontSize:28,color:permPct>=40?"#007A33":"#E3000B"}}>{permPct}%</span></div>
        <div style={{fontSize:12,color:"#888",fontFamily:FB}}>Target: 40% | {permPct>=40?"On target":"Gap: "+(40-permPct)+"% to target"}</div>
      </div>
      {/* Cohort rank */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:10,border:"1px solid #e8e8e3"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>COHORT RANK</span><span style={{fontFamily:FC,fontWeight:900,fontSize:28}}>{rank}<span style={{fontSize:14,color:"#888"}}>/{total}</span></span></div>
        <div style={{fontSize:12,color:"#888",fontFamily:FB}}>Ranked by proximity to $37.10 target</div>
      </div>
      {/* Network quartile */}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginBottom:16}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5,marginBottom:4}}>NETWORK POSITION</div>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:22,color:"#fff"}}>{quartile}</div>
      </div>
      {/* Lever reveal */}
      {!showLever?(<button onClick={()=>setShowLever(true)} style={{...BO,width:"100%",marginBottom:16}}>REVEAL YOUR BEST LEVER</button>)
      :(<div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:16,border:"2px solid #FFD300"}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:8}}>BEST LEVER FOR YOUR RESTAURANT</div>
        <div style={{fontSize:15,fontFamily:FB,lineHeight:1.6,marginBottom:12}}>{lever.name}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#E3000B"}}>${lever.weeklySaving.toLocaleString()}</div><div style={{fontSize:11,color:"#888",fontFamily:FC}}>WEEKLY SAVING</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:24,color:"#E3000B"}}>${lever.annualSaving.toLocaleString()}</div><div style={{fontSize:11,color:"#888",fontFamily:FC}}>ANNUAL SAVING</div></div>
        </div>
        <div style={{marginTop:10,fontSize:13,color:"#555",fontFamily:FB}}>Projected AHR: ${lever.newAHR.toFixed(2)}</div>
      </div>)}
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Your Restaurant, Your Number completed",checkInType:"initial",restaurant:user.restaurant,currentAHR:ahrVal,juniorPercent:juniorPct,permPercent:permPct,recommendedLever:lever.name,projectedAHR:lever.newAHR,weeklySaving:lever.weeklySaving,annualSaving:lever.annualSaving,cohortRank:rank,networkQuartile:quartile,claimedBonus:false,autoBonus:false,points:ch.points});}}>SUBMIT</button>
    </div>)}
  </div>);
}

// ─── GUEST DOLLAR TRAIL (EL Week 1) ─────────────────────────────────────────
const GDT_MOMENTS=[
  {id:1,title:"THE GREETING",scene:"Guest walks to the counter.",
    optA:{label:"Crew doesn't look up",detail:"\"Next.\"",correct:false,counterChange:0,insight:"Guest orders the minimum. No browsing. No add-ons."},
    optB:{label:"Crew makes eye contact, slight smile",detail:"\"Hey, welcome in! What can I get you?\"",correct:true,counterChange:3.70,insight:"Guest feels welcome. They browse. They ask about the queso. They add it."},
    reveal:"Guests who feel welcomed spend 20-25% more per visit. That's one add-on per order. Across 200 transactions a day, that's $740 in add-ons - from a greeting."},
  {id:2,title:"THE RECOMMENDATION",scene:"Guest is mid-order. Crew has a chance to suggest.",
    optA:{label:"\"Anything else?\"",detail:"Guest says \"No thanks.\"",correct:false,counterChange:0,insight:"\"Anything else?\" converts at under 5%."},
    optB:{label:"\"The chipotle goes really well with that\"",detail:"\"It's $3.70, want to try it?\" Guest: \"Yeah, go on then.\"",correct:true,counterChange:3.70,insight:"A specific recommendation with a price. 50% say yes."},
    reveal:"Same crew member. Same guest. Different sentence. $3.70 difference."},
  {id:3,title:"THE WAIT",scene:"Guest ordered and paid. Standing at pickup. 4 minutes... 6 minutes... 8 minutes.",
    optA:{label:"Nobody acknowledges the guest",detail:"8 minutes. Arms cross. Phone comes out.",correct:false,counterChange:-218.40,insight:"They'll probably still eat the food. But they're not coming back."},
    optB:{label:"At 4 minutes: \"Yours is next. Two more minutes.\"",detail:"Guest nods. Expression stays relaxed.",correct:true,counterChange:0,insight:"Acknowledged. Not forgotten. They'll be back next week."},
    reveal:"A guest who's told 'two more minutes' waits differently from a guest who's been forgotten. That's $218 per guest per year."},
  {id:4,title:"THE PROBLEM",scene:"Guest opens their bag. Wrong item. Their face drops.",
    optA:{label:"\"Oh, sorry\" - remakes without urgency",detail:"No eye contact. No timeline.",correct:false,counterChange:-218.40,insight:"Return probability drops to 15%. This guest is almost certainly gone forever."},
    optB:{label:"TACOS recovery",detail:"\"That's not good enough - I'm remaking that right now. Front of the line. Three minutes.\"",correct:true,counterChange:0,insight:"The service recovery paradox: solved well = MORE loyal."},
    reveal:"The mistake wasn't the disaster. What happened in the next 30 seconds was. That's $184 saved from a 30-second conversation."},
  {id:5,title:"THE EXIT",scene:"Guest is leaving. At the door.",
    optA:{label:"Nobody says anything",detail:"Guest walks out.",correct:false,counterChange:0,insight:"Transaction complete. Guest gone. No lasting impression."},
    optB:{label:"\"Enjoy! See you next time.\"",detail:"Eye contact. Four words.",correct:true,counterChange:47.00,insight:"Guests who receive a farewell are 14% more likely to return within 7 days."},
    reveal:"Two seconds. Four words. $47 per guest per year. Costs absolutely nothing."},
];
function GuestDollarTrail({ch,done,onS,onB,user,actCfg}){
  const moments=actCfg?.guest_dollar_trail?.moments||GDT_MOMENTS;
  const[step,setStep]=useState(0);const[counter,setCounter]=useState(0);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[step]);const[choices,setChoices]=useState([]);const[weakest,setWeakest]=useState(null);const[showReveal,setShowReveal]=useState(false);
  const[dispCounter,setDispCounter]=useState(0);
  const animCounter=(from,to)=>{const steps=20;const sv=(to-from)/steps;let cur=from;let s=0;const iv=setInterval(()=>{s++;cur+=sv;setDispCounter(cur);if(s>=steps){clearInterval(iv);setDispCounter(to);}},50);};
  const choose=(opt,key)=>{const m=moments[step-1];const change=opt.counterChange;const newC=counter+change;setCounter(newC);animCounter(dispCounter,newC);
    setChoices(p=>[...p,{momentId:m.id,chosen:key,correct:opt.correct,change}]);setShowReveal(true);};
  const next=()=>{setShowReveal(false);if(step<moments.length)setStep(s=>s+1);else setStep(99);};
  const correctCount=choices.filter(c=>c.correct).length;
  const pathAVal=50.40;const pathBVal=513;const gap=463;const annualImpact=1685320;
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(step===0)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setStep(1)} startLabel="FOLLOW THE GUEST"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {/* Dollar counter - dark bar */}
    {step>0&&step<=moments.length&&<div style={{position:"sticky",top:56,background:"rgba(0,0,0,0.9)",zIndex:10,padding:"12px 16px",borderRadius:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc"}}>MOMENT {step}/{moments.length}</span>
      <div style={{flex:1,marginLeft:12,marginRight:12,height:6,background:"#333",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#FFD300",width:`${(step/moments.length)*100}%`,transition:"width 0.3s"}}/></div>
      <span style={{fontFamily:FG,fontWeight:900,fontSize:28,color:dispCounter>=0?"#007A33":"#E3000B"}}>${dispCounter>=0?"+":""}{ dispCounter.toFixed(2)}</span>
    </div>}
    {/* Moments */}
    {step>=1&&step<=moments.length&&!showReveal&&(()=>{const m=moments[step-1];return(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12,color:"#000"}}>{m.title}</div>
      <div style={scenarioBox}>
        <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB}}>{m.scene}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:16}}>
        {[["A",m.optA],["B",m.optB]].map(([key,opt])=>(<button key={key} onClick={()=>choose(opt,key)} style={{...optCard(false),color:"#333"}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:4,color:"#333"}}>{opt.label}</div>
          <div style={{fontSize:13,color:"#888",fontFamily:FB,fontStyle:"italic"}}>{opt.detail}</div>
        </button>))}
      </div>
    </div>);})()}
    {/* Reveal */}
    {showReveal&&step<=moments.length&&(()=>{const m=moments[step-1];const c=choices[choices.length-1];return(<div style={{padding:"24px 20px",textAlign:"center"}}>
      <div style={{background:c.correct?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",borderRadius:16,padding:24,border:`2px solid ${c.correct?"#007A33":"#E3000B"}`,marginBottom:16}}>
        {c.correct?<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        :<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        <div style={{fontFamily:FC,fontWeight:900,fontSize:18,marginTop:8,color:c.correct?"#007A33":"#E3000B"}}>{c.correct?"RIGHT CALL":"WRONG CALL"}</div>
        <div style={{fontSize:14,color:"#555",fontFamily:FB,marginTop:8,lineHeight:1.6,textAlign:"left"}}>{c.correct?m.optB.insight:m.optA.insight}</div>
        {c.change!==0&&<div style={{fontFamily:FC,fontWeight:900,fontSize:20,marginTop:12,color:c.change>0?"#007A33":"#E3000B"}}>{c.change>0?"+$":"$"}{c.change.toFixed(2)} per guest</div>}
      </div>
      <div style={{background:"#f8f8f5",borderRadius:12,padding:14,marginBottom:16,fontSize:13,color:"#555",fontFamily:FB,lineHeight:1.6,textAlign:"left"}}>{m.reveal}</div>
      <button style={{...BY,width:"100%"}} onClick={next}>{step<moments.length?"NEXT MOMENT":"SEE THE FULL PICTURE"}</button>
    </div>);})()}
    {/* Multiplier reveal */}
    {step===99&&!weakest&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,color:"#000"}}>THE FULL PICTURE</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"1px solid #e8e8e3"}}><div style={{fontSize:11,fontFamily:FC,color:"#E3000B",fontWeight:700}}>ALL WRONG</div><div style={{fontFamily:FC,fontWeight:900,fontSize:24,marginTop:4}}>${pathAVal.toFixed(2)}</div><div style={{fontSize:11,color:"#888"}}>per guest/year</div></div>
        <div style={{background:"#fff",borderRadius:14,padding:16,textAlign:"center",border:"2px solid #007A33"}}><div style={{fontSize:11,fontFamily:FC,color:"#007A33",fontWeight:700}}>ALL RIGHT</div><div style={{fontFamily:FC,fontWeight:900,fontSize:24,marginTop:4}}>${pathBVal}</div><div style={{fontSize:11,color:"#888"}}>per guest/year</div></div>
      </div>
      <div style={scenarioBox}>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5,marginBottom:8}}>THE GAP</div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:48,color:"#E3000B"}}>${gap}/guest</div>
          <div style={{marginTop:16,fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc"}}>ANNUAL RESTAURANT IMPACT</div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:48,color:"#FFD300",marginTop:4}}>${annualImpact.toLocaleString()}</div>
          <div style={{fontSize:14,color:"#999",fontFamily:FB,marginTop:8}}>Same menu. Same prices. Different experience.</div>
        </div>
      </div>
      <div style={{marginTop:20,marginBottom:12}}><div style={{fontFamily:F107,fontWeight:900,fontSize:18,letterSpacing:0.5,color:"#000"}}>WHICH MOMENT IS YOUR RESTAURANT WEAKEST AT?</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {moments.map(m=>(<button key={m.id} onClick={()=>setWeakest(m.id)} style={{...optCard(false),color:"#333",fontFamily:FC,fontWeight:700,fontSize:14}}>{m.title}</button>))}
      </div>
    </div>)}
    {/* Final */}
    {weakest&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{correctCount}/{moments.length}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>CORRECT CALLS</div>
      </div>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#888",letterSpacing:0.5}}>YOUR FOCUS THIS WEEK</div>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:22,color:"#FFD300",marginTop:4}}>{moments.find(m=>m.id===weakest)?.title}</div>
      </div>
      {choices.map((c,i)=>{const m=moments[i];return(<div key={i} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:4,borderLeft:`3px solid ${c.correct?"#007A33":"#E3000B"}`}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{m.title}</span><span style={{fontFamily:FC,fontWeight:800,fontSize:12,color:c.correct?"#007A33":"#E3000B"}}>{c.correct?"RIGHT":"WRONG"}</span></div>
        <div style={{fontSize:13,color:"#555",fontFamily:FB,marginTop:4}}>{c.change>0?"+$":"$"}{c.change.toFixed(2)} per guest</div>
      </div>);})}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:16,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{ch.points}</div></div>
          {correctCount===moments.length&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"6px 12px",borderRadius:8}}>PERFECT +{ch.bonusPoints}</div>}
        </div>
      </div>
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Guest Dollar Trail completed",choices,correctCount,pathAValue:pathAVal,pathBValue:pathBVal,gapPerGuest:gap,annualImpact,weakestMoment:weakest,claimedBonus:correctCount===moments.length,autoBonus:correctCount===moments.length,points:ch.points});}}>COMPLETE CHALLENGE</button>
    </div>)}
  </div>);
}

// ─── TRIAGE CALL (EL Week 2) ────────────────────────────────────────────────
const TRIAGE_CALLS=[
  {id:1,arm:"Raj",restaurant:"Parramatta",situation:"AHR is at $39.20 this week. I think it is the public holiday loadings.",correct:"act",rationale:"$39.20 is $2.10 above target. Attributing it to public holidays without checking the roster mix is a pattern. Coach Raj to interrogate the data."},
  {id:2,arm:"Priya",restaurant:"Fortitude Valley",situation:"SPLH dropped to $109 on Sunday. It was raining all day.",correct:"act",rationale:"SPLH of $109 is below the $115 floor. Blaming weather without examining the roster means Priya is over-staffed on soft days."},
  {id:3,arm:"Damon",restaurant:"Capalaba",situation:"Jake just told me he wants to go permanent. I don't know if the hours are there.",correct:"hold",rationale:"Jake expressing interest is good news. The hours question is answerable at the next roster review. Not urgent."},
  {id:4,arm:"Sasha",restaurant:"Logan City",situation:"I sent two people home early at 2pm. Sales picked back up at 4pm. Was that right?",correct:"hold",rationale:"Sasha made a call and it worked. She's seeking validation, not rescue. Acknowledge at next check-in."},
  {id:5,arm:"Leo",restaurant:"Harrington Park",situation:"Labour is at 34% for the week. Should I react or wait until Friday?",correct:"act",rationale:"34% with multiple days left requires action now. Waiting until Friday closes the window."},
  {id:6,arm:"Cam",restaurant:"Sydney CBD",situation:"I've got three casuals who've been here over 12 months all on 35-plus hours. Haven't had the perm chat yet.",correct:"act",rationale:"Three crew at 35+ hours for 12+ months - potential Fair Work obligation. Legal and cost risk. Highest priority."},
];
function TriageCall({ch,done,onS,onB,user,actCfg}){
  const calls=actCfg?.triage_call?.calls||TRIAGE_CALLS;const timeLimit=actCfg?.triage_call?.timeLimit||10;
  const[idx,setIdx]=useState(-1);const[timer,setTimer]=useState(timeLimit);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[idx]);const[results,setResults]=useState([]);const[flash2,setFlash2]=useState(null);
  const timerRef=useRef(null);
  useEffect(()=>{if(idx>=0&&idx<calls.length&&timer>0){timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current);handleChoice("hold");return 0;}return t-1;}),1000);return()=>clearInterval(timerRef.current);}return()=>clearInterval(timerRef.current);},[idx]);
  const handleChoice=(choice)=>{clearInterval(timerRef.current);const c=calls[idx];const speed=timeLimit-timer;const correct=choice===c.correct;const pts=correct?(speed<5?3:speed<10?2:1):0;
    const r={callId:c.id,arm:c.arm,choice,correct,speed,points:pts};setResults(p=>[...p,r]);
    setFlash2({correct,rationale:c.rationale,arm:c.arm});setTimeout(()=>{setFlash2(null);if(idx<calls.length-1){setIdx(i=>i+1);setTimer(timeLimit);}else setIdx(99);},2000);};
  const correctCount=results.filter(r=>r.correct).length;const totalPts=results.reduce((s,r)=>s+r.points,0)+(correctCount===calls.length?5:0);
  const actCount=results.filter(r=>r.choice==="act").length;
  const profile=actCount>=5?{name:"OVER-REACTOR",text:"You want to fix things fast. Some calls needed space, not speed."}:actCount<=1?{name:"UNDER-REACTOR",text:"You held back. Two of those calls needed you in the conversation today."}:correctCount>=5?{name:"SHARP",text:"Strong read. You know the difference between coaching moments and compliance moments."}:{name:"CALIBRATED",text:"Good instinct on most calls. Review the misses."};
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(idx===-1)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>{setIdx(0);setTimer(timeLimit);}} startLabel="START CALLS"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {/* Call - dark timer bar */}
    {idx>=0&&idx<calls.length&&!flash2&&(()=>{const c=calls[idx];return(<div>
      <div style={{background:"rgba(0,0,0,0.9)",borderRadius:0,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc"}}>{idx+1}/{calls.length}</span>
        <div style={{flex:1,marginLeft:12,marginRight:12,height:6,background:"#333",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:timer<=2?"#E3000B":timer<=5?"#FFD300":"#007A33",width:`${(timer/timeLimit)*100}%`,transition:"width 1s linear"}}/></div>
        <span style={{fontFamily:FG,fontWeight:900,fontSize:28,color:timer<=2?"#E3000B":timer<=5?"#FFD300":"#fff"}}>{timer}</span>
      </div>
      <div style={{padding:"24px 20px"}}>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12,color:"#000"}}>INCOMING CALL</div>
        <div style={scenarioBox}>
          <div style={scenarioBadge}>{c.arm} - {c.restaurant}</div>
          <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB,marginTop:12}}>{c.situation}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
          <button onClick={()=>handleChoice("hold")} style={binBtn(false)}>HOLD</button>
          <button onClick={()=>handleChoice("act")} style={binBtn(true)}>ACT NOW</button>
        </div>
      </div>
    </div>);})()}
    {/* Flash - large icon reveal */}
    {flash2&&(<div style={{padding:"24px 20px",textAlign:"center"}}>
      <div style={{background:flash2.correct?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",borderRadius:16,padding:24,border:`2px solid ${flash2.correct?"#007A33":"#E3000B"}`}}>
        {flash2.correct?<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        :<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        <div style={{fontFamily:FC,fontWeight:900,fontSize:18,marginTop:8,color:flash2.correct?"#007A33":"#E3000B"}}>{flash2.correct?"CORRECT":"WRONG"}</div>
        <div style={{fontSize:14,color:"#555",fontFamily:FB,marginTop:8,lineHeight:1.6}}>{flash2.rationale}</div>
      </div>
    </div>)}
    {/* Results */}
    {idx===99&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{correctCount}/{calls.length}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>CORRECT CALLS</div>
      </div>
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8e8e3",padding:16,marginBottom:16,textAlign:"center"}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#888",letterSpacing:0.5,marginBottom:4}}>YOUR COACHING PROFILE</div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,color:"#000",marginBottom:4}}>{profile.name}</div>
        <div style={{fontSize:14,color:"#555",fontFamily:FB,lineHeight:1.6}}>{profile.text}</div>
      </div>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:18,letterSpacing:0.5,marginBottom:8,color:"#000"}}>CALL REVIEW</div>
      {results.map((r,i)=>{const c=calls.find(x=>x.id===r.callId);return(<div key={i} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:4,borderLeft:`3px solid ${r.correct?"#007A33":"#E3000B"}`,border:"1px solid #e8e8e3",borderLeftColor:r.correct?"#007A33":"#E3000B",borderLeftWidth:3}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:FC,fontWeight:700,fontSize:14}}>{c?.arm} - {c?.restaurant}</span><span style={{fontFamily:FC,fontWeight:800,fontSize:12,color:r.correct?"#007A33":"#E3000B"}}>{r.choice.toUpperCase()}</span></div>
        <div style={{fontSize:13,color:"#555",fontFamily:FB,marginTop:4,lineHeight:1.5}}>{c?.rationale}</div>
      </div>);})}
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:16,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{ch.points}</div></div>
          {correctCount===calls.length&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"6px 12px",borderRadius:8}}>PERFECT +{ch.bonusPoints}</div>}
        </div>
      </div>
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"Triage Call completed",score:totalPts,correctCount,decisions:results,profile:profile.name,claimedBonus:correctCount===calls.length,autoBonus:correctCount===calls.length,points:ch.points});}}>COMPLETE CHALLENGE</button>
    </div>)}
  </div>);
}

// ─── RM BRIEF (EL Week 3) ──────────────────────────────────────────────────
const RMB_FOCUS=[{id:"sales",text:"Sales target for today",correct:false},{id:"labour",text:"Labour cost awareness",correct:true},{id:"perm",text:"Permanency reminder for ARMs",correct:true},{id:"guest",text:"Guest experience standard",correct:false}];
const RMB_DATA=[{id:"ahr",text:"Our AHR this week is $38.40. Network target is $37.10.",correct:true},{id:"casuals",text:"We have four casuals eligible for permanent today.",correct:true},{id:"splh",text:"SPLH target today is $120.",correct:false},{id:"labour_pct",text:"We are 2% over on labour this week.",correct:false}];
const RMB_CTA=[{id:"section",text:"Everyone check your section at 12:30.",correct:false},{id:"arm_catch",text:"ARMs, I want to catch you after the rush for 5 minutes each.",correct:true},{id:"send_home",text:"If it goes quiet after 1pm, talk to me before you send anyone home.",correct:true},{id:"lean",text:"Remind your team we are running lean today.",correct:false}];
function RMBrief({ch,done,onS,onB,user,actCfg}){
  const[step,setStep]=useState(0);const[focus,setFocus]=useState(null);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[step]);const[data,setData]=useState(null);const[cta,setCta]=useState(null);const[showModel,setShowModel]=useState(false);
  const focusOpts=actCfg?.rm_brief?.focus||RMB_FOCUS;const dataOpts=actCfg?.rm_brief?.data||RMB_DATA;const ctaOpts=actCfg?.rm_brief?.cta||RMB_CTA;
  const focusCorrect=focusOpts.find(f=>f.id===focus)?.correct;const dataCorrect=dataOpts.find(d=>d.id===data)?.correct;const ctaCorrect=ctaOpts.find(c=>c.id===cta)?.correct;const allCorrect=focusCorrect&&dataCorrect&&ctaCorrect;
  const rating=allCorrect?{label:"STRONG",text:"Tight. One problem, one number, one action. Your team leaves knowing exactly what matters today."}:focusCorrect&&(!dataCorrect||!ctaCorrect)?{label:"TOO BROAD",text:"Right problem but the message got loose. One irrelevant data point dilutes the brief."}:focusCorrect&&dataCorrect&&!ctaCorrect?{label:"MISSING THE CTA",text:"Good setup, no follow-through. Context without direction is just information."}:{label:"OFF-MESSAGE",text:"You built a tight brief - but not for the problems you have today."};
  const modelBrief="This week our AHR is $38.40. Network target is $37.10. That gap costs us every shift we don't act. Today after the rush, ARMs - I need 5 minutes each with you. We have crew ready for permanent and the conversation hasn't happened. Let's fix that today.";
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(step===0)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setStep(1)} startLabel="BUILD YOUR BRIEF"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {/* Step progress bar */}
    <div style={{background:"rgba(0,0,0,0.9)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc"}}>STEP {Math.min(step,3)}/3</span>
      <div style={{flex:1,marginLeft:12,marginRight:12,height:6,background:"#333",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#FFD300",width:`${(Math.min(step,3)/3)*100}%`,transition:"width 0.3s"}}/></div>
    </div>
    <div style={{padding:"24px 20px"}}>
      {step===1&&(<div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12,color:"#000"}}>1. CHOOSE YOUR FOCUS</div>
        <div style={scenarioBox}>
          <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB}}>It's 6:45am. You're about to brief your team. What's the one thing you want them focused on today?</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
          {focusOpts.map(f=>(<button key={f.id} onClick={()=>{setFocus(f.id);setStep(2);}} style={{...optCard(focus===f.id),color:"#333"}}>{f.text}</button>))}
        </div>
      </div>)}
      {step===2&&(<div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12,color:"#000"}}>2. CHOOSE YOUR DATA POINT</div>
        <div style={scenarioBox}>
          <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB}}>Back up your focus with one number. Which data point drives your message home?</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
          {dataOpts.map(d=>(<button key={d.id} onClick={()=>{setData(d.id);setStep(3);}} style={{...optCard(data===d.id),color:"#333"}}>{d.text}</button>))}
        </div>
      </div>)}
      {step===3&&(<div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:12,color:"#000"}}>3. CHOOSE YOUR CALL TO ACTION</div>
        <div style={scenarioBox}>
          <div style={{fontSize:16,lineHeight:1.7,fontFamily:FB}}>Close the brief with one clear action. What do you want your team to do?</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
          {ctaOpts.map(c=>(<button key={c.id} onClick={()=>{setCta(c.id);setStep(4);}} style={{...optCard(cta===c.id),color:"#333"}}>{c.text}</button>))}
        </div>
      </div>)}
      {step===4&&(<div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR BRIEF</div>
        <div style={scenarioBox}>
          <div style={{fontSize:16,fontFamily:FB,lineHeight:1.8}}>{focusOpts.find(f=>f.id===focus)?.text}. {dataOpts.find(d=>d.id===data)?.text} {ctaOpts.find(c=>c.id===cta)?.text}</div>
        </div>
        <div style={{marginTop:16,textAlign:"center"}}>
          {allCorrect?<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          :<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        </div>
        <div style={{background:allCorrect?"rgba(0,122,51,0.1)":"rgba(227,0,11,0.1)",border:`2px solid ${allCorrect?"#007A33":"#E3000B"}`,borderRadius:14,padding:16,marginTop:12,marginBottom:16}}>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:18,color:allCorrect?"#007A33":"#E3000B",marginBottom:6}}>{rating.label}</div>
          <div style={{fontSize:14,color:"#555",fontFamily:FB,lineHeight:1.6}}>{rating.text}</div>
        </div>
        {!showModel?<button onClick={()=>setShowModel(true)} style={{...BO,width:"100%",marginBottom:16}}>SEE MODEL BRIEF</button>
        :<div style={{marginBottom:16}}>
          <div style={{fontFamily:F107,fontWeight:900,fontSize:18,letterSpacing:0.5,marginBottom:8,color:"#000"}}>MODEL BRIEF</div>
          <div style={scenarioBox}>
            <div style={{fontSize:16,fontFamily:FB,lineHeight:1.8}}>{modelBrief}</div>
          </div>
        </div>}
        <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{ch.points}</div></div>
            {allCorrect&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"6px 12px",borderRadius:8}}>PERFECT +{ch.bonusPoints}</div>}
          </div>
        </div>
        <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"RM Brief completed",focus,dataPoint:data,cta,allCorrect,rating:rating.label,claimedBonus:allCorrect,autoBonus:allCorrect,points:ch.points});}}>COMPLETE CHALLENGE</button>
      </div>)}
    </div>
  </div>);
}

// ─── NUMBERS DON'T LIE (EL Week 4) ─────────────────────────────────────────
const NDL_ROUNDS=[
  {id:1,restaurant:"Parramatta",pl:{netSales:"$62,000",salesTarget:"$65,000",labourCost:"$20,460",labourPct:"33%",labourTarget:"28-32%",ahr:"$37.42",ahrTarget:"$37.10",splh:"$113",splhTarget:"$115-$125",crewHours:"546"},
    taps:[
      {q:"What is the primary problem?",opts:[{id:"a",text:"Labour % is above the 28-32% target",correct:false},{id:"b",text:"Sales are $3,000 under forecast",correct:true},{id:"c",text:"AHR is above $37.10",correct:false}]},
      {q:"What is the root cause?",opts:[{id:"a",text:"AHR needs to come down",correct:false},{id:"b",text:"Roster built for $65K, trade came in at $62K - no mid-shift reaction",correct:true},{id:"c",text:"Crew hours are too high",correct:false}]},
      {q:"What is the right lever?",opts:[{id:"a",text:"Review ARM's permanency pipeline to reduce AHR",correct:false},{id:"b",text:"Coach ARM on mid-shift reaction - send people home when sales miss",correct:true},{id:"c",text:"Cut crew hours across the board next week",correct:false}]}],
    explanation:"Labour % blew out because sales came in $3,000 short, not because labour was mismanaged. One mid-shift send-home on Tuesday and Thursday would have saved the week.",
    numbers:"3 people sent home 2 hrs early on 2 days: 3 x 2 x $37.10 = $445 saved. Labour % drops from 33% to 32.3%."},
  {id:2,restaurant:"Fortitude Valley",subtitle:"24-hour operation",pl:{netSales:"$71,000",salesTarget:"$68,000",labourCost:"$25,916",labourPct:"36.5%",labourTarget:"28-32%",ahr:"$39.20",ahrTarget:"$37.10",splh:"$118",splhTarget:"$115-$125",crewHours:"661"},
    taps:[
      {q:"What is the primary problem?",opts:[{id:"a",text:"AHR is $2.10 above target",correct:false},{id:"b",text:"Labour % is 4.5 points over target",correct:false},{id:"c",text:"Two separate problems: AHR driven by overnight classification, hours inflated by over-rostering dead overnight",correct:true}]},
      {q:"What is the root cause?",opts:[{id:"a",text:"ARM using Casual 21+ to fill overnight gaps instead of cheaper classifications",correct:true},{id:"b",text:"Sales too high and SPLH masking the labour problem",correct:false},{id:"c",text:"Permanency pipeline needs work",correct:false}]},
      {q:"What is the right lever?",opts:[{id:"a",text:"Coach ARM to fill overnight with Casual 16 or PT first",correct:true},{id:"b",text:"Reduce total crew hours by 10%",correct:false},{id:"c",text:"Run a permanency drive",correct:false}]}],
    explanation:"Overnight shifts filled with Casual 21+ at weekend penalty rates. Fix the classification and cut dead overnight hours.",
    numbers:"Casual 21+ Sat overnight: $46.47/hr vs Casual 16: $23.20/hr. Saving: $23.27/hr. Annual: ~$109K."},
  {id:3,restaurant:"Sydney CBD",subtitle:"High volume, 7-day",pl:{netSales:"$95,000",salesTarget:"$88,000",labourCost:"$30,400",labourPct:"32%",labourTarget:"28-32%",ahr:"$38.10",ahrTarget:"$37.10",splh:"$124",splhTarget:"$115-$125",crewHours:"800"},
    taps:[
      {q:"What is the primary problem?",opts:[{id:"a",text:"AHR is $1 above target",correct:false},{id:"b",text:"Labour % is at 32% - top of target band",correct:false},{id:"c",text:"Sales $7K above forecast. If sales normalise, labour % blows to 34.5%",correct:true}]},
      {q:"What is the root cause?",opts:[{id:"a",text:"ARM over-rostered and got lucky that trade was strong",correct:true},{id:"b",text:"AHR needs to come down before next week",correct:false},{id:"c",text:"SPLH near top of band means slightly under-staffed",correct:false}]},
      {q:"What is the right lever?",opts:[{id:"a",text:"Coach ARM to build next week's roster to $88K forecast, not $95K actual",correct:true},{id:"b",text:"Run a permanency conversion",correct:false},{id:"c",text:"Hold current roster - restaurant is performing well",correct:false}]}],
    explanation:"This week looks fine. Next week it won't. Labour % at 32% is only in band because sales over-delivered by $7K.",
    numbers:"This week: $30,400/$95,000 = 32%. Next week: $30,400/$88,000 = 34.5%. Required saving: $2,240 (59 hrs)."},
];
function NumbersDontLie({ch,done,onS,onB,user,actCfg}){
  const rounds=actCfg?.numbers_dont_lie?.rounds||NDL_ROUNDS;
  const[roundIdx,setRoundIdx]=useState(-1);const[tapIdx,setTapIdx]=useState(0);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});document.documentElement.scrollTop=0;},[roundIdx]);const[roundResults,setRoundResults]=useState([]);const[currentTaps,setCurrentTaps]=useState([]);const[showExplain,setShowExplain]=useState(false);
  const round=rounds[roundIdx]||null;const tap=round?.taps[tapIdx]||null;
  const totalScore=roundResults.reduce((s,r)=>s+r.points,0);const maxScore=30;const allPerfect=totalScore>=24;
  const profile=totalScore>=24?{name:"THE COMMERCIAL LEADER",text:"You read all three snapshots correctly - symptom from cause, cause from lever, and the risk inside the good number."}:roundResults[2]?.allCorrect?{name:"THE FORECASTER",text:"You caught the risk hiding inside a good week. That separates managing the present from managing the future."}:{name:"THE REACTOR",text:"You spot the number that's off. But you go after the symptom before you find the cause. Spend more time on the why."};
  const chooseTap=(optId)=>{const opt=tap.opts.find(o=>o.id===optId);const pts=opt.correct?([2,3,3][tapIdx]):0;const newTaps=[...currentTaps,{tapIdx,chosen:optId,correct:opt.correct,points:pts}];setCurrentTaps(newTaps);
    if(tapIdx<2)setTapIdx(t=>t+1);
    else{const roundPts=newTaps.reduce((s,t)=>s+t.points,0);const allCorrect=newTaps.every(t=>t.correct);setRoundResults(p=>[...p,{roundId:round.id,restaurant:round.restaurant,taps:newTaps,points:roundPts,allCorrect}]);setShowExplain(true);}};
  const nextRound=()=>{setShowExplain(false);setTapIdx(0);setCurrentTaps([]);if(roundIdx<rounds.length-1)setRoundIdx(r=>r+1);else setRoundIdx(99);};
  if(done&&user.username!=="test-all")return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0"}}><div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div><div style={{textAlign:"center",padding:40}}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:12}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1,color:"#007A33"}}>CHALLENGE SUBMITTED</div></div></div>);

  if(roundIdx===-1)return <ChallengeIntro icon={resolveChIcon(ch)} title={ch.title} subtitle={ch.subtitle} description={ch.description} points={ch.points} bonusPoints={ch.bonusPoints} bonusCondition={ch.bonusCondition} tip={ch.tip} onB={onB} onStart={()=>setRoundIdx(0)} startLabel="START ROUND 1"/>;

  return(<div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>{ch.title}</span><span style={{width:32}}/></div>
    {/* Progress bar */}
    {round&&!showExplain&&<div style={{background:"rgba(0,0,0,0.9)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc"}}>ROUND {roundIdx+1}/{rounds.length}</span>
      <div style={{flex:1,marginLeft:12,marginRight:12,height:6,background:"#333",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"#FFD300",width:`${((roundIdx+1)/rounds.length)*100}%`,transition:"width 0.3s"}}/></div>
      <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#ccc"}}>TAP {tapIdx+1}/3</span>
    </div>}
    {/* P&L + taps */}
    {round&&!showExplain&&tap&&(<div style={{padding:"20px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:20,letterSpacing:0.5,marginBottom:4,color:"#000"}}>{round.restaurant}</div>
      {round.subtitle&&<div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#888",letterSpacing:0.5,marginBottom:12}}>{round.subtitle.toUpperCase()}</div>}
      {!round.subtitle&&<div style={{marginBottom:12}}/>}
      {/* P&L card */}
      <div style={{background:"#fff",borderRadius:14,padding:16,marginBottom:16,border:"1px solid #e8e8e3"}}>
        {Object.entries(round.pl).filter(([k])=>!k.includes("Target")).map(([k,v])=>{const targetKey=k+"Target";const target=round.pl[targetKey];return(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f5f5f0"}}>
            <span style={{fontSize:13,color:"#555",fontFamily:FB,textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1").trim()}</span>
            <div><span style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{v}</span>{target&&<span style={{fontSize:11,color:"#aaa",marginLeft:6}}>({target})</span>}</div>
          </div>);})}
      </div>
      {/* Tap question */}
      <div style={qStyle}>TAP {tapIdx+1}/3: {tap.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {tap.opts.map(opt=>(<button key={opt.id} onClick={()=>chooseTap(opt.id)} style={{...optCard(false),color:"#333"}}>{opt.text}</button>))}
      </div>
    </div>)}
    {/* Explanation */}
    {showExplain&&round&&(<div style={{padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        {roundResults[roundResults.length-1]?.allCorrect?<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007A33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        :<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E3000B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        <div style={{fontFamily:FC,fontWeight:900,fontSize:32,marginTop:8,color:roundResults[roundResults.length-1]?.allCorrect?"#007A33":"#E3000B"}}>{roundResults[roundResults.length-1]?.points}/8</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#888"}}>{round.restaurant} SCORE</div>
      </div>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:18,letterSpacing:0.5,marginBottom:8,color:"#000"}}>THE REAL STORY</div>
      <div style={scenarioBox}>
        <div style={{fontSize:16,fontFamily:FB,lineHeight:1.7}}>{round.explanation}</div>
      </div>
      <div style={{background:"#f8f8f5",borderRadius:12,padding:14,marginTop:12,marginBottom:16,fontSize:13,color:"#555",fontFamily:FB,lineHeight:1.6}}>{round.numbers}</div>
      <button style={{...BY,width:"100%"}} onClick={nextRound}>{roundIdx<rounds.length-1?"NEXT ROUND":"SEE RESULTS"}</button>
    </div>)}
    {/* Final results */}
    {roundIdx===99&&(<div style={{padding:"24px 20px"}}>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:22,letterSpacing:0.5,textAlign:"center",marginBottom:16,color:"#000"}}>YOUR RESULTS</div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",textAlign:"center",marginBottom:20}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:56,color:"#FFD300"}}>{totalScore}/{maxScore}</div>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#ccc",letterSpacing:1}}>TOTAL SCORE</div>
      </div>
      <div style={{fontFamily:F107,fontWeight:900,fontSize:18,letterSpacing:0.5,marginBottom:8,color:"#000"}}>ROUND REVIEW</div>
      {roundResults.map((r,i)=>(<div key={i} style={{background:"#fff",borderRadius:14,padding:16,marginBottom:4,borderLeft:`3px solid ${r.allCorrect?"#007A33":r.points>=5?"#FFB800":"#E3000B"}`,border:"1px solid #e8e8e3",borderLeftColor:r.allCorrect?"#007A33":r.points>=5?"#FFB800":"#E3000B",borderLeftWidth:3}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{r.restaurant}</div><div style={{fontSize:13,color:"#555",fontFamily:FB}}>{r.taps.filter(t=>t.correct).length}/3 correct</div></div>
          <div style={{fontFamily:FC,fontWeight:900,fontSize:20,color:r.allCorrect?"#007A33":r.points>=5?"#FFB800":"#E3000B"}}>{r.points}/8</div>
        </div>
      </div>))}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8e8e3",padding:16,marginTop:12,marginBottom:12,textAlign:"center"}}>
        <div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#888",letterSpacing:0.5,marginBottom:4}}>YOUR COMMERCIAL PROFILE</div>
        <div style={{fontFamily:F107,fontWeight:900,fontSize:20,color:"#000",marginBottom:4}}>{profile.name}</div>
        <div style={{fontSize:14,color:"#555",fontFamily:FB,lineHeight:1.6}}>{profile.text}</div>
      </div>
      <div style={{background:"#000",borderRadius:14,padding:"24px 20px",marginTop:8,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontFamily:FC,fontWeight:700,fontSize:14,color:"#FFD300",letterSpacing:0.5}}>POINTS EARNED</div><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff",marginTop:4}}>{ch.points}</div></div>
          {allPerfect&&<div style={{fontFamily:FC,fontWeight:800,fontSize:13,color:"#FFD300",background:"rgba(255,211,0,0.15)",padding:"6px 12px",borderRadius:8}}>PERFECT +{ch.bonusPoints}</div>}
        </div>
      </div>
      <button style={{...BY,width:"100%",fontSize:17}} onClick={()=>{onS({text:"The Numbers Don't Lie completed",rounds:roundResults,totalScore,maxScore,profile:profile.name,claimedBonus:allPerfect,autoBonus:allPerfect,points:ch.points});}}>COMPLETE CHALLENGE</button>
    </div>)}
  </div>);
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function LbV({cu,onB,onP,defaultProg,defaultBatch}){const[fi,sF]=useState(defaultProg||"all");const[fb,sFb]=useState(defaultBatch||"all");
  const[lbUsers,setLbUsers]=useState([]);const[lbComps,setLbComps]=useState([]);const[lbLoading,setLbLoading]=useState(true);
  useEffect(()=>{(async()=>{setLbLoading(true);const prog=fi==="all"?defaultProg:fi;const[u,c]=await Promise.all([getUsersByProgram(prog),getCompletionsByProgram(prog)]);setLbUsers(u);setLbComps(c);setLbLoading(false);})();},[fi]);
  const us=lbUsers;const co=lbComps;
  const bd=us.filter(u=>{if(fi!=="all"&&u.program!==fi)return false;if(fb!=="all"&&u.batch!==fb)return false;return true;}).map(u=>({u,p:co.filter(c=>c.userId===u.id).reduce((s,c)=>s+c.points+(c.bonusApproved?c.bonusPoints||0:0),0),d:co.filter(c=>c.userId===u.id).length})).sort((a,b)=>b.p-a.p);const batches=[...new Set(us.filter(u=>fi==="all"||u.program===fi).map(u=>u.batch).filter(Boolean))].sort().reverse();
  const md=["1ST","2ND","3RD"];
  return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:90}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>LEADERBOARD</span><span style={{width:32}}/></div>
    <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",gap:6,overflowX:"auto"}}>{[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=>(<button key={p.id} style={{padding:"8px 16px",borderRadius:20,background:fi===p.id?"#FFD300":"#fff",border:`1px solid ${fi===p.id?"#FFD300":"#e0e0db"}`,color:fi===p.id?"#000":"#888",fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>{sF(p.id);sFb("all");}}>{p.short}</button>))}</div>
      {batches.length>1&&<div style={{display:"flex",gap:6,overflowX:"auto"}}><button style={{padding:"6px 12px",borderRadius:16,background:fb==="all"?"#000":"#fff",border:`1px solid ${fb==="all"?"#000":"#e0e0db"}`,color:fb==="all"?"#fff":"#888",fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>sFb("all")}>ALL BATCHES</button>{batches.map(b=>(<button key={b} style={{padding:"6px 12px",borderRadius:16,background:fb===b?"#000":"#fff",border:`1px solid ${fb===b?"#000":"#e0e0db"}`,color:fb===b?"#fff":"#888",fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}} onClick={()=>sFb(b)}>{b}</button>))}</div>}
    </div>
    {bd.length>=3&&<div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:8,padding:"24px 16px 0"}}>{[1,0,2].map(i=>{const e=bd[i];if(!e)return null;const top=i===0;return (<div key={e.u.id} style={{display:"flex",flexDirection:"column",alignItems:"center",width:90,transform:top?"translateY(-12px)":"none"}}><div style={{fontSize:14,fontFamily:FC,fontWeight:900,color:"#FFD300",letterSpacing:1,background:"#000",padding:"4px 10px",borderRadius:6,textAlign:"center",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{md[i]}</div><div style={{fontFamily:FC,fontWeight:700,fontSize:13,marginTop:4}}>{e.u.name.split(" ")[0]}</div><div style={{fontFamily:FC,fontWeight:900,fontSize:20,marginTop:2}}>{e.p}</div><div style={{width:"100%",height:top?72:i===1?56:40,background:"linear-gradient(180deg, #FFD300, #E6BE00)",borderRadius:"8px 8px 0 0",marginTop:8}}/></div>);})}</div>}
    <div style={{padding:16}}>{bd.map((e,i)=>(<div key={e.u.id} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:"#fff",borderRadius:14,marginBottom:8,border:e.u.id===cu?.id?"2px solid #FFD300":"1px solid #e8e8e3"}}><div style={{width:36,textAlign:"center",fontSize:16,fontWeight:700,fontFamily:FC,color:"#888"}}>{i<3?md[i]:i+1}</div><div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:700,fontSize:15}}>{e.u.name}{co.some(c=>c.userId===e.u.id&&c.challengeId==="lse-w2"&&c.submission?.earnedBadge)&&<span style={{color:"#FFD300",fontSize:14,marginLeft:4}}>&#9733;</span>}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{e.u.restaurant} &middot; {e.u.batch} &middot; {e.d} done</div></div><div style={{fontFamily:FC,fontWeight:900,fontSize:20}}>{e.p}<span style={{fontSize:13,fontWeight:500,color:"#999"}}> PTS</span></div></div>))}{lbLoading&&<div style={{textAlign:"center",padding:32,color:"#999",fontFamily:FC}}>Loading...</div>}{!lbLoading&&bd.length===0&&<div style={{textAlign:"center",padding:32,color:"#999",fontFamily:FC}}>No participants yet</div>}</div>
    <BNav active="board" onH={onB} onB={()=>{}} onP={onP}/>
  </div>
);}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function PrV({u,co,sc,onO,onB,onBd}){const pg=PROGRAMS[u.program];return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:90}}>
    <div style={TBar}><button style={BA} onClick={onB}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>MY GYG</span><span style={{width:32}}/></div>
    <div style={{margin:"16px 16px 0",background:"#000",borderRadius:16,padding:20,color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:26,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><img src={MEMBER_ICON} alt="" style={{width:32,height:32,objectFit:"contain"}}/></div><div><div style={{fontFamily:FC,fontWeight:800,fontSize:18,letterSpacing:1}}>{u.name.toUpperCase()}</div><div style={{fontSize:12,color:"#999",fontFamily:FC,fontWeight:500,letterSpacing:1}}>{u.position}</div></div></div>
        {LOGOS[u.program]&&<img src={LOGOS[u.program]} alt="" style={{height:36,objectFit:"contain"}}/>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16}}>
        <div style={{padding:"6px 12px",background:"rgba(255,211,0,0.1)",borderRadius:8}}><span style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:1}}>{u.batch}</span></div>
        <div style={{display:"flex",gap:20}}>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#FFD300"}}>{sc}</div><div style={{fontFamily:FC,fontWeight:600,fontSize:12,color:"#888",letterSpacing:0.5}}>POINTS</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#FFD300"}}>{co.length}</div><div style={{fontFamily:FC,fontWeight:600,fontSize:12,color:"#888",letterSpacing:0.5}}>DONE</div></div>
          <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:900,fontSize:28,color:"#fff"}}>{4-co.length}</div><div style={{fontFamily:FC,fontWeight:600,fontSize:12,color:"#888",letterSpacing:0.5}}>LEFT</div></div>
        </div>
      </div>
    </div>
    <div style={{padding:"12px 16px 0"}}><div style={{fontWeight:600,fontSize:17,marginBottom:12}}>Account Details</div>
      {[["PROGRAM",pg?.name],["RESTAURANT",u.restaurant],["BATCH",u.batch],["EMAIL",u.email]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:16,background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,marginBottom:8,fontFamily:FC,fontWeight:700,fontSize:14,letterSpacing:1}}><span>{l}</span><span style={{fontWeight:500,color:"#888",fontSize:12}}>{v}</span></div>))}
    </div>
    <div style={{padding:"0 16px 100px"}}><button style={{...BO,width:"100%",borderColor:"#ddd",color:"#333"}} onClick={onO}>SIGN OUT</button></div>
    <BNav active="profile" onH={onB} onB={onBd||(() =>{})} onP={()=>{}}/>
  </div>
);}

// ─── ADMIN DASHBOARD (FULL WIDTH, BATCH FILTERING) ──────────────────────────

// ─── ACTIVITIES LIST ─────────────────────────────────────────────────────────
function ActivitiesV({u,acts,batchControl,actComps,onAct,onB}){
  const pg=PROGRAMS[u.program];
  const bk=(batchControl||{})[u.batch]||{};
  return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
    <div style={{margin:"16px 16px 0",background:"#000",borderRadius:16,padding:"16px 20px 14px",color:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:22,fontWeight:900,fontFamily:FG,letterSpacing:1}}>WORKSHOP ACTIVITIES</div>
          <div style={{marginTop:8,padding:"6px 12px",background:"rgba(255,211,0,0.1)",borderRadius:8,display:"inline-block"}}><span style={{fontSize:13,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:1}}>{u.batch}</span></div>
        </div>
        {LOGOS[u.program]&&<img src={LOGOS[u.program]} alt={pg?.name} style={{height:52,objectFit:"contain"}}/>}
      </div>
    </div>
    <div style={{padding:"12px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,fontSize:17}}>Activities</span><button style={{background:"none",border:"none",color:"#999",fontSize:12,fontWeight:700,fontFamily:FC,letterSpacing:1,cursor:"pointer"}} onClick={onB}>LOGOUT</button></div>
      {acts.map((act,i)=>{
        const userDone=actComps.some(c=>c.activityId===act.id);
        const isActive=bk.activeActivity===act.id;
        const isCompleted=(bk.completedActivities||[]).includes(act.id)||userDone;
        const status=userDone?"done":isActive?"active":"locked";
        return (
          <button key={act.id} onClick={()=>{if(status==="active")onAct(act);}} disabled={status!=="active"} style={{display:"flex",alignItems:"center",width:"100%",padding:16,background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,marginBottom:6,cursor:status==="active"?"pointer":"default",textAlign:"left",fontFamily:FB,color:"#1a1a1a",opacity:status==="locked"?0.4:1,transition:"all 0.2s"}}>
            <div style={{marginRight:14}}><div style={{width:36,height:36,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:800,fontSize:15,color:status==="done"?"#fff":"#000",background:status==="done"?"#007A33":"#FFD300"}}>
              {status==="done"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              :status==="active"?(act.type==="coolroom_countdown"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>:act.type==="roster_reality"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>:act.type==="self_assessment"?<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>)
              :<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
            </div></div>
            <div style={{flex:1}}><div style={{fontFamily:FC,fontWeight:800,fontSize:16,letterSpacing:0.5}}>{act.title}</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{act.subtitle}</div></div>
            {status==="active"&&<div style={{background:"#FFD300",borderRadius:8,padding:"8px 14px",marginLeft:12}}><span style={{fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:1,color:"#000"}}>START</span></div>}
            {status==="done"&&<div style={{fontSize:13,fontFamily:FC,fontWeight:700,color:"#007A33",letterSpacing:0.5,marginLeft:12}}>DONE</div>}
            {status==="locked"&&<div style={{fontSize:22,color:"#ccc",marginLeft:8,fontWeight:300}}>{"\u203A"}</div>}
          </button>
        );
      })}
    </div>
  </div>
);}

// ─── WAITING ─────────────────────────────────────────────────────────────────
function WaitingV({u,onB}){const pg=PROGRAMS[u.program];return (
  <div className="view-enter" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",padding:32,background:"#f5f5f0",textAlign:"center"}}>
    <div style={{width:80,height:80,borderRadius:40,background:"#007A33",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div style={{fontSize:32,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:8}}>GREAT WORK TODAY!</div>
    <p style={{fontSize:15,color:"#888",lineHeight:1.6,maxWidth:280,marginBottom:20}}>Your weekly challenges will be unlocked soon. Keep an eye out!</p>
    <div style={{padding:"8px 16px",background:"#000",borderRadius:8,marginBottom:24}}><span style={{fontSize:13,fontFamily:FC,fontWeight:700,color:"#FFD300",letterSpacing:1}}>{u.batch}</span></div>
    {LOGOS[u.program]&&<img src={LOGOS[u.program]} alt={pg?.name} style={{height:60,objectFit:"contain",marginBottom:24}}/>}
    <button style={BO} onClick={onB}>LOGOUT</button>
  </div>
);}

// ─── HUDDLE BUILDER ──────────────────────────────────────────────────────────

// ─── HUDDLE BUILDER ──────────────────────────────────────────────────────────
function HuddleBuilder({act,u,onComplete,onB}){
  const[screen,setScreen]=useState(1);
  const[focus,setFocus]=useState(null);
  const[subFocus,setSubFocus]=useState(null);
  const[script,setScript]=useState(["","","","","","",""]);
  const[recording,setRecording]=useState(false);
  const[audioUrl,setAudioUrl]=useState(null);
  const[recTime,setRecTime]=useState(0);
  const[recDuration,setRecDuration]=useState(0);
  const[partnerName,setPartnerName]=useState("");
  const[feedback,setFeedback]=useState({buyIn:null,repeatable:null,voiceMatch:null,buyInNote:"",repeatableNote:"",voiceMatchNote:""});
  const[partnerNotes,setPartnerNotes]=useState(null);
  const[ssMode,setSsMode]=useState(false);
  const[showScript,setShowScript]=useState(false);
  const mediaRef=React.useRef(null);
  const timerRef=React.useRef(null);
  const chunksRef=React.useRef([]);

  const updateScript=(i,v)=>{const s=[...script];s[i]=v;setScript(s);};

  const assembledScript=HUDDLE_STEPS.map((st,i)=>{
    const prefix=st.prefix?st.prefix+" ":"";
    return prefix+script[i];
  }).join("\n");

  const startRec=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':MediaRecorder.isTypeSupported('audio/webm')?'audio/webm':'audio/mp4';const mr=new MediaRecorder(stream,{mimeType});
      chunksRef.current=[];
      mr.ondataavailable=e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      mr.onstop=()=>{const blob=new Blob(chunksRef.current,{type:mr.mimeType});setAudioUrl(URL.createObjectURL(blob));stream.getTracks().forEach(t=>t.stop());};
      mr.start();
      mediaRef.current=mr;
      setRecording(true);setRecTime(0);setAudioUrl(null);
      timerRef.current=setInterval(()=>{setRecTime(t=>{if(t>=34){mr.stop();clearInterval(timerRef.current);setRecording(false);return 35;}return t+1;});},1000);
    }catch(e){}
  };
  const stopRec=()=>{if(mediaRef.current&&mediaRef.current.state==="recording"){mediaRef.current.stop();clearInterval(timerRef.current);setRecording(false);setRecDuration(recTime);}};

  useEffect(()=>{return()=>{clearInterval(timerRef.current);};},[]);

  const ph=subFocus?HUDDLE_PLACEHOLDERS[subFocus]||[]:[];

  const fbItems=[
    {key:"buyIn",q:"Would the crew buy in to this message?"},
    {key:"repeatable",q:"Could the crew repeat the key line?"},
    {key:"voiceMatch",q:"Does the voice and energy match the message?"},
  ];

  const fieldStyle={width:"100%",padding:"14px 16px",border:"2px solid #e8e8e3",borderRadius:14,fontSize:16,fontFamily:FB,resize:"none",background:"#fff",boxSizing:"border-box",lineHeight:1.5};
  const labelStyle={fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:6,display:"block"};
  const stepLabel={fontSize:14,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1,marginBottom:6};
  const heading={fontSize:28,fontWeight:900,fontFamily:F107,letterSpacing:0.5,marginBottom:8,lineHeight:1.1};
  const subtext={fontSize:16,color:"#999",marginBottom:24,lineHeight:1.5};

  if(ssMode){
    return (
    <div style={{minHeight:"100vh",background:"#fff",padding:24,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <button style={{...BA,alignSelf:"flex-start",marginBottom:16}} onClick={()=>setSsMode(false)}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button>
      <div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:1,marginBottom:20}}>TAKE A SCREENSHOT TO SAVE</div>
      <div style={{width:"100%",maxWidth:360,background:"#000",borderRadius:20,padding:28,color:"#fff"}}>
        <div style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#FFD300",letterSpacing:0.5,marginBottom:6}}>HUDDLE CARD</div>
        <div style={{fontSize:22,fontWeight:900,fontFamily:F107,letterSpacing:0.5,marginBottom:6}}>{u.name.toUpperCase()}</div>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"#FFD300",color:"#000",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[focus]?.label||"").toUpperCase()}</span>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"rgba(255,211,0,0.15)",color:"#FFD300",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[focus]?.subs.find(s=>s.id===subFocus)?.label||"").toUpperCase()}</span>
        </div>
        {HUDDLE_STEPS.map((st,i)=>(
          <div key={i} style={{marginBottom:i===6?0:12}}>
            <div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#666",letterSpacing:1,marginBottom:3}}>{st.label}</div>
            <div style={{fontSize:15,lineHeight:1.5,fontFamily:FB,color:i===5?"#000":"#fff",background:i===5?"#FFD300":"transparent",padding:i===5?"5px 10px":"0",borderRadius:i===5?8:0,fontWeight:i===5?800:400}}>{st.prefix?st.prefix+" ":""}{script[i]}</div>
          </div>
        ))}
        <div style={{marginTop:20,paddingTop:14,borderTop:"1px solid #333",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#666",letterSpacing:0.5}}>PARTNER: {partnerName.toUpperCase()}</span>
          <div style={{display:"flex",gap:8}}>
            {fbItems.map(fi=>(<div key={fi.key} style={{width:10,height:10,borderRadius:5,background:feedback[fi.key]==="yes"?"#007A33":"#FFD300"}}/>))}
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
  <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:48}}>
    <div style={TBar}><button style={BA} onClick={()=>{if(screen===1)onB();else if(screen===4&&showScript){setShowScript(false);}else setScreen(screen-1);}}><svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1 9l8 8"/></svg></button><span style={TT}>HUDDLE BUILDER</span><span style={{width:32}}/></div>
    <div style={{height:4,background:"#e8e8e3"}}><div style={{height:"100%",background:"#FFD300",width:`${(screen/5)*100}%`,transition:"width 0.4s cubic-bezier(0.16,1,0.3,1)"}}/></div>

    {screen===1&&(
    <div className="anim-fade-up" style={{padding:"28px 24px"}}>
      <div style={stepLabel}>STEP 1 OF 5</div>
      <div style={heading}>PICK YOUR FOCUS</div>
      <p style={subtext}>What do you want your crew to nail today?</p>
      {Object.entries(HUDDLE_FOCUSES).map(([k,v])=>(
        <div key={k} style={{marginBottom:14}}>
          <button className="btn-hover" onClick={()=>{setFocus(focus===k?null:k);setSubFocus(null);}} style={{width:"100%",padding:"20px 22px",background:focus===k?"#000":"#fff",color:focus===k?"#FFD300":"#000",border:focus===k?"2px solid #000":"2px solid #e8e8e3",borderRadius:16,fontSize:20,fontWeight:900,fontFamily:F107,letterSpacing:1,cursor:"pointer",textAlign:"left",transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)"}}>{v.label}</button>
          {focus===k&&(
            <div className="anim-fade-up" style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:12,paddingLeft:4}}>
              {v.subs.map(s=>(
                <button key={s.id} className="btn-hover" onClick={()=>{setSubFocus(s.id);setScript(["","","","","","",""]);setScreen(2);}} style={{padding:"13px 18px 11px",background:subFocus===s.id?"#FFD300":"#fff",color:subFocus===s.id?"#000":"#333",border:subFocus===s.id?"2px solid #FFD300":"2px solid #e8e8e3",borderRadius:12,fontSize:15,fontWeight:700,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s cubic-bezier(0.16,1,0.3,1)",lineHeight:1}}>{s.label}</button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
    )}

    {screen===2&&(
    <div style={{padding:"28px 24px"}}>
      <div style={stepLabel}>STEP 2 OF 5</div>
      <div style={heading}>BUILD YOUR SCRIPT</div>
      <p style={subtext}>Fill in each line. Keep it tight - aim for 30 seconds total.</p>
      {partnerNotes&&(
        <div className="anim-scale-in" style={{background:"#FFF8E0",border:"2px solid #FFD300",borderRadius:16,padding:18,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,color:"#000",letterSpacing:1,marginBottom:8}}>PARTNER FEEDBACK</div>
          {partnerNotes.map((n,i)=>n?<div key={i} style={{fontSize:15,color:"#666",marginBottom:4,lineHeight:1.4}}>- {n}</div>:null)}
        </div>
      )}
      {HUDDLE_STEPS.map((st,i)=>(
        <div key={i} style={{marginBottom:18}}>
          <div style={{...labelStyle,color:i===5?"#000":"#999"}}>{st.label}{i===5?<span style={{color:"#FFD300",marginLeft:8,fontWeight:700}}>THE LINE THEY REMEMBER</span>:""}</div>
          {st.prefix&&<div style={{fontSize:15,fontWeight:600,fontFamily:FB,color:"#000",marginBottom:6}}>{st.prefix}</div>}
          {i===6?<div style={{fontSize:14,color:"#bbb",fontStyle:"italic",padding:"14px 0"}}>This stays the same - your closing line.</div>
          :<textarea value={script[i]} onChange={e=>updateScript(i,e.target.value)} placeholder={ph[i]||""} rows={ph[i]&&ph[i].length>60?3:2} style={{...fieldStyle,fontSize:i===5?17:16,fontWeight:i===5?700:400}}/>}
          {i!==6&&script[i]&&<div style={{fontSize:13,fontWeight:600,fontFamily:FC,color:"#ccc",marginTop:4,textAlign:"right"}}>{script[i].split(/\s+/).filter(Boolean).length} words</div>}
        </div>
      ))}
      <button className="btn-hover" style={{...BY,width:"100%",marginTop:12,padding:"18px 32px",fontSize:17,borderRadius:16,opacity:script.slice(0,6).every(s=>s.trim())?1:0.35}} disabled={!script.slice(0,6).every(s=>s.trim())} onClick={()=>setScreen(3)}>NEXT</button>
    </div>
    )}

    {screen===3&&(
    <div style={{padding:"28px 24px"}}>
      <div style={stepLabel}>STEP 3 OF 5</div>
      <div style={heading}>RECORD & TIME IT</div>
      <p style={subtext}>Read your script aloud. Aim for under 30 seconds.</p>
      <div style={{background:"#fff",border:"2px solid #e8e8e3",borderRadius:16,padding:18,marginBottom:24,maxHeight:220,overflowY:"auto"}}>
        {HUDDLE_STEPS.map((st,i)=>(
          <div key={i} style={{marginBottom:8}}>
            <span style={{fontSize:15,fontFamily:FB,fontWeight:400,color:"#333",lineHeight:1.5}}>{st.prefix?st.prefix+" ":""}{script[i]}</span>
          </div>
        ))}
      </div>
      {typeof navigator!=="undefined"&&navigator.mediaDevices?(
        <div style={{textAlign:"center"}}>
          <button className="btn-hover" onClick={recording?stopRec:startRec} style={{width:88,height:88,borderRadius:44,border:"none",background:recording?"#E3000B":"#000",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",transition:"all 0.25s cubic-bezier(0.16,1,0.3,1)",boxShadow:recording?"0 0 0 8px rgba(227,0,11,0.15)":"none"}}>
            {recording?<div style={{width:26,height:26,borderRadius:5,background:"#fff"}}/>:<div style={{width:28,height:28,borderRadius:14,background:"#E3000B"}}/>}
          </button>
          <div style={{fontSize:56,fontWeight:900,fontFamily:F107,color:recTime>=30?"#E3000B":recTime>=25?"#FFD300":"#000",transition:"color 0.3s",letterSpacing:0}}>{recTime}s</div>
          <div style={{fontSize:14,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5,marginTop:6}}>{recording?"RECORDING...":"TARGET: UNDER 30 SECONDS"}</div>
          {recTime>=35&&<div style={{fontSize:15,fontWeight:700,color:"#E3000B",marginTop:10}}>Too long - tighten it up!</div>}
          {audioUrl&&!recording&&(
            <div style={{marginTop:20}}>
              <audio src={audioUrl} controls style={{width:"100%",marginBottom:10,borderRadius:40}}/>
              <div style={{fontSize:15,fontWeight:700,fontFamily:FC,color:"#999",marginBottom:12}}>Duration: {recDuration}s</div>
              <button className="btn-hover" onClick={()=>{setAudioUrl(null);setRecTime(0);}} style={{...BO,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}}>RE-RECORD</button>
            </div>
          )}
        </div>
      ):(
        <div style={{textAlign:"center",padding:24}}>
          <div style={{fontSize:16,color:"#999",marginBottom:16,lineHeight:1.5}}>Practice reading your script aloud. Time yourself - aim for under 30 seconds.</div>
          <button className="btn-hover" onClick={()=>{if(!recording){setRecording(true);setRecTime(0);timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000);}else{clearInterval(timerRef.current);setRecording(false);setRecDuration(recTime);}}} style={{...BY,margin:"0 auto",fontSize:17,padding:"18px 32px"}}>{recording?"STOP":"START TIMER"}</button>
          <div style={{fontSize:56,fontWeight:900,fontFamily:F107,color:recTime>=30?"#E3000B":recTime>=25?"#FFD300":"#000",marginTop:16,letterSpacing:0}}>{recTime}s</div>
        </div>
      )}
      <button className="btn-hover" style={{...BY,width:"100%",marginTop:14,padding:"18px 32px",fontSize:17,borderRadius:16,opacity:(audioUrl||recDuration>0)?1:0.35}} disabled={!audioUrl&&recDuration===0} onClick={()=>setScreen(4)}>NEXT</button>
    </div>
    )}

    {screen===4&&(
    <div style={{padding:"28px 24px"}}>
      <div style={stepLabel}>STEP 4 OF 5</div>
      <div style={heading}>PARTNER FEEDBACK</div>
      <div className="anim-scale-in" style={{background:"#FFD300",borderRadius:16,padding:20,marginBottom:24,textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:900,fontFamily:F107,letterSpacing:0.5}}>HAND YOUR PHONE TO YOUR PARTNER</div>
      </div>
      {audioUrl&&(
        <div style={{background:"#fff",border:"2px solid #e8e8e3",borderRadius:16,padding:16,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,color:"#999",letterSpacing:1,marginBottom:8}}>REPLAY THE HUDDLE</div>
          <audio src={audioUrl} controls style={{width:"100%",borderRadius:40}}/>
        </div>
      )}
      <div style={{marginBottom:20}}>
        <div style={{...labelStyle,color:"#999"}}>PARTNER NAME</div>
        <input value={partnerName} onChange={e=>setPartnerName(e.target.value)} placeholder="Their name" style={{...fieldStyle}}/>
      </div>
      {fbItems.map(fi=>(
        <div key={fi.key} style={{marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,fontFamily:FC,color:"#000",marginBottom:10,lineHeight:1.3,letterSpacing:0}}>{fi.q}</div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-hover" onClick={()=>setFeedback(f=>({...f,[fi.key]:"yes"}))} style={{flex:1,padding:"14px",borderRadius:12,border:feedback[fi.key]==="yes"?"2px solid #007A33":"2px solid #e8e8e3",background:feedback[fi.key]==="yes"?"#007A33":"#fff",color:feedback[fi.key]==="yes"?"#fff":"#000",fontSize:16,fontWeight:800,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>YES</button>
            <button className="btn-hover" onClick={()=>setFeedback(f=>({...f,[fi.key]:"not_yet"}))} style={{flex:1,padding:"14px",borderRadius:12,border:feedback[fi.key]==="not_yet"?"2px solid #FFD300":"2px solid #e8e8e3",background:feedback[fi.key]==="not_yet"?"#FFF8E0":"#fff",color:"#000",fontSize:16,fontWeight:800,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>NOT YET</button>
          </div>
          {feedback[fi.key]==="not_yet"&&(
            <input value={feedback[fi.key+"Note"]||""} onChange={e=>setFeedback(f=>({...f,[fi.key+"Note"]:e.target.value}))} placeholder="What would make it land?" style={{...fieldStyle,border:"2px solid #FFD300",marginTop:10,background:"#FFF8E0"}}/>
          )}
        </div>
      ))}
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:24}}>
        <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16,opacity:(partnerName&&fbItems.every(fi=>feedback[fi.key]))?1:0.35}} disabled={!partnerName||!fbItems.every(fi=>feedback[fi.key])} onClick={()=>setScreen(5)}>LOOKS GOOD</button>
        <button className="btn-hover" style={{...BO,width:"100%",padding:"16px 32px",fontSize:15,borderRadius:16}} onClick={()=>{const notes=fbItems.map(fi=>feedback[fi.key]==="not_yet"?feedback[fi.key+"Note"]:"").filter(Boolean);setPartnerNotes(notes.length?notes:null);setScreen(2);}}>REWRITE</button>
      </div>
    </div>
    )}

    {screen===5&&(
    <div style={{padding:"28px 24px"}}>
      <div style={stepLabel}>STEP 5 OF 5</div>
      <div style={heading}>COMMIT & SHARE</div>
      <div style={{background:"#000",borderRadius:20,padding:24,color:"#fff",marginBottom:24}}>
        <div style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#FFD300",letterSpacing:0.5,marginBottom:6}}>YOUR HUDDLE</div>
        <div style={{fontSize:20,fontWeight:900,fontFamily:F107,letterSpacing:0.5,marginBottom:10}}>{u.name.toUpperCase()}</div>
        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"#FFD300",color:"#000",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[focus]?.label||"").toUpperCase()}</span>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,padding:"4px 10px",background:"rgba(255,211,0,0.15)",color:"#FFD300",borderRadius:6,letterSpacing:0.5}}>{(HUDDLE_FOCUSES[focus]?.subs.find(s=>s.id===subFocus)?.label||"").toUpperCase()}</span>
        </div>
        {HUDDLE_STEPS.map((st,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:700,color:"#666",fontFamily:FC}}>{st.prefix?st.prefix+" ":""}</span>
            <span style={{fontSize:15,fontFamily:FB,fontWeight:i===5?800:400,color:i===5?"#000":"#fff",background:i===5?"#FFD300":"transparent",padding:i===5?"3px 8px":"0",borderRadius:6}}>{script[i]}</span>
          </div>
        ))}
        <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #333",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,fontFamily:FC,color:"#666",letterSpacing:0.5}}>PARTNER: {partnerName.toUpperCase()}</span>
          <div style={{display:"flex",gap:8}}>
            {fbItems.map(fi=>(<div key={fi.key} style={{width:10,height:10,borderRadius:5,background:feedback[fi.key]==="yes"?"#007A33":"#FFD300"}}/>))}
          </div>
        </div>
      </div>
      <button className="btn-hover" style={{...BY,width:"100%",marginBottom:14,padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setSsMode(true)}>SCREENSHOT YOUR CARD</button>
      <button className="btn-hover" style={{...BO,width:"100%",marginBottom:14,padding:"16px 32px",fontSize:15,borderRadius:16}} onClick={()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);const ds=d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";const de=new Date(d.getTime()+1800000).toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";const details=encodeURIComponent(assembledScript);window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pre-Shift+Huddle&details=${details}&dates=${ds}/${de}`,"_blank");}}>SET REMINDER</button>
      <div style={{background:"#fff",border:"2px solid #e8e8e3",borderRadius:16,padding:18,marginBottom:24}}>
        <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#000",marginBottom:10}}>PROOF RULES FOR YOUR CHALLENGE</div>
        <div style={{fontSize:15,color:"#666",lineHeight:1.6}}>
          - Record yourself delivering the huddle (voice note or video)<br/>
          - One evidence photo from the shift showing the impact<br/>
          - No guest faces in any photos
        </div>
      </div>
      <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>onComplete({activityId:act.id,type:"huddle_builder",focus,subFocus,script,assembledScript,crewLine:script[5],partnerName,partnerFeedback:feedback,allYes:feedback.buyIn==="yes"&&feedback.repeatable==="yes"&&feedback.voiceMatch==="yes"})}>COMPLETE ACTIVITY</button>
    </div>
    )}
  </div>
);}

// ─── COOL ROOM 360 VIEWER ────────────────────────────────────────────────────
// Replace these URLs with your own 360 equirectangular cool room photos
// Version A = full stock, Version B = 3 items removed (after blackout)
// Current: placeholder warehouse panorama from Poly Haven (CC0). Replace with actual cool room photos.
const COOLROOM_IMG_A = "/360-fridge.jpg";
const COOLROOM_IMG_B = "/360-line.jpg";
const HAZARD_IMG = "/360-prep.jpg";

function PanoViewer({imgSrc,onYawPitch}){
  const canvasRef=useRef(null);
  const glRef=useRef(null);
  const texRef=useRef(null);
  const progRef=useRef(null);
  const yawRef=useRef(0);
  const pitchRef=useRef(0);
  const onYPRef=useRef(onYawPitch);
  onYPRef.current=onYawPitch;
  const dragRef=useRef({active:false,lastX:0,lastY:0,velX:0,velY:0,lastT:0});
  const rafRef=useRef(null);
  const mountedRef=useRef(true);

  const VERT=`attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*0.5+0.5;gl_Position=vec4(a_pos,0.0,1.0);}`;
  const FRAG=`precision mediump float;
uniform sampler2D u_tex;uniform float u_yaw;uniform float u_pitch;uniform float u_aspect;varying vec2 v_uv;
const float PI=3.14159265;
void main(){
  float hfov=tan(radians(40.0));
  float x=(v_uv.x-0.5)*2.0*hfov*u_aspect;
  float y=(v_uv.y-0.5)*2.0*hfov;
  vec3 ray=normalize(vec3(x,y,-1.0));
  float cp=cos(u_pitch),sp=sin(u_pitch);
  ray=vec3(ray.x, cp*ray.y-sp*ray.z, sp*ray.y+cp*ray.z);
  float cy=cos(u_yaw),sy=sin(u_yaw);
  ray=vec3(cy*ray.x+sy*ray.z, ray.y, -sy*ray.x+cy*ray.z);
  float lon=atan(ray.x,ray.z);
  float lat=asin(clamp(ray.y,-1.0,1.0));
  vec2 uv=vec2(-lon/(2.0*PI)+0.5, -lat/PI+0.5);
  gl_FragColor=texture2D(u_tex,uv);
}`;

  const initGL=useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const gl=canvas.getContext("webgl",{antialias:false,alpha:false});if(!gl)return;
    glRef.current=gl;
    const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,VERT);gl.compileShader(vs);
    const fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,FRAG);gl.compileShader(fs);
    const pg=gl.createProgram();gl.attachShader(pg,vs);gl.attachShader(pg,fs);gl.linkProgram(pg);
    progRef.current=pg;gl.useProgram(pg);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const aPos=gl.getAttribLocation(pg,"a_pos");gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
    texRef.current=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texRef.current);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([40,40,40,255]));
  },[]);

  const render=useCallback(()=>{
    const gl=glRef.current,pg=progRef.current,canvas=canvasRef.current;
    if(!gl||!pg||!canvas)return;
    canvas.width=canvas.clientWidth*window.devicePixelRatio;
    canvas.height=canvas.clientHeight*window.devicePixelRatio;
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform1f(gl.getUniformLocation(pg,"u_yaw"),yawRef.current);
    gl.uniform1f(gl.getUniformLocation(pg,"u_pitch"),pitchRef.current);
    gl.uniform1f(gl.getUniformLocation(pg,"u_aspect"),canvas.width/canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  },[]);

  const loadTex=useCallback((src)=>{
    const gl=glRef.current;if(!gl||!src)return;
    const img=new Image();img.crossOrigin="anonymous";
    img.onload=()=>{
      gl.bindTexture(gl.TEXTURE_2D,texRef.current);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      render();
    };
    img.src=src;
  },[render]);

  useEffect(()=>{initGL();loadTex(imgSrc);render();return ()=>{mountedRef.current=false;cancelAnimationFrame(rafRef.current);};},[]);
  useEffect(()=>{loadTex(imgSrc);},[imgSrc,loadTex]);

  // Animation loop for momentum
  useEffect(()=>{
    const loop=()=>{
      if(!mountedRef.current)return;
      const d=dragRef.current;
      if(!d.active&&(Math.abs(d.velX)>0.0001||Math.abs(d.velY)>0.0001)){
        yawRef.current+=d.velX;d.velX*=0.92;
        pitchRef.current+=d.velY;d.velY*=0.92;
        pitchRef.current=Math.max(-Math.PI/3,Math.min(Math.PI/3,pitchRef.current));
        render();
      }
      if(onYPRef.current)onYPRef.current(yawRef.current,pitchRef.current);
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[render]);

  const onStart=(e)=>{
    e.preventDefault();
    const p=e.touches?e.touches[0]:e;
    dragRef.current={active:true,lastX:p.clientX,lastY:p.clientY,velX:0,velY:0,lastT:Date.now()};
  };
  const onMove=(e)=>{
    if(!dragRef.current.active)return;
    e.preventDefault();
    const p=e.touches?e.touches[0]:e;
    const dx=p.clientX-dragRef.current.lastX;
    const dy=p.clientY-dragRef.current.lastY;
    const now=Date.now();const dt=Math.max(1,now-dragRef.current.lastT);
    yawRef.current+=dx*0.002;
    pitchRef.current+=dy*0.002;
    pitchRef.current=Math.max(-Math.PI/3,Math.min(Math.PI/3,pitchRef.current));
    dragRef.current.velX=dx*0.002/dt*16;
    dragRef.current.velY=dy*0.002/dt*16;
    dragRef.current.lastX=p.clientX;dragRef.current.lastY=p.clientY;dragRef.current.lastT=now;
    render();
    if(onYPRef.current)onYPRef.current(yawRef.current,pitchRef.current);
  };
  const onEnd=()=>{dragRef.current.active=false;};

  if(!imgSrc){
    return (
      <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#222",color:"#888",fontFamily:FC,fontSize:13,letterSpacing:1,textAlign:"center",padding:20}}>
        <div>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" style={{marginBottom:8}}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>
          <div>360 IMAGE PLACEHOLDER</div>
          <div style={{fontSize:11,color:"#555",marginTop:4}}>Set COOLROOM_IMG_A / _B in code</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{height:"100%",position:"relative",touchAction:"none"}}>
      <canvas ref={canvasRef} style={{width:"100%",height:"100%",display:"block",cursor:"grab"}}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}/>
      <div style={{position:"absolute",bottom:8,left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
        <span style={{background:"rgba(0,0,0,0.6)",color:"#fff",padding:"4px 12px",borderRadius:20,fontSize:11,fontFamily:FC,letterSpacing:1}}>DRAG TO LOOK AROUND 360</span>
      </div>
    </div>
  );
}

// ─── COOL ROOM COUNTDOWN ────────────────────────────────────────────────────
function CoolRoomCountdown({act,u,onComplete,onB,coolroomImgs}){
  const _imgs=coolroomImgs||{};
  const _imgA=_imgs.imgA||COOLROOM_IMG_A;
  const _imgB=_imgs.imgB||COOLROOM_IMG_B;
  const[screen,setScreen]=useState(1);
  const[phase,setPhase]=useState("ready");
  const[countItems,setCountItems]=useState([{product:"",quantity:"",unit:""},{product:"",quantity:"",unit:""},{product:"",quantity:"",unit:""},{product:"",quantity:"",unit:""},{product:"",quantity:"",unit:""}]);
  const[timeLeft,setTimeLeft]=useState(120);
  const[blackoutDone,setBlackoutDone]=useState(false);
  const[showVersionA,setShowVersionA]=useState(true);
  const[blackoutActive,setBlackoutActive]=useState(false);
  const[partnerCount,setPartnerCount]=useState("");
  const[noticedBlackout,setNoticedBlackout]=useState(null);
  const[reflection,setReflection]=useState("");
  const[compareTime,setCompareTime]=useState(60);
  const timerRef=useRef(null);
  const compareRef=useRef(null);
  const countSheetRef=useRef(null);

  // Main 2-min countdown
  useEffect(()=>{
    if(phase==="counting"||phase==="countingB"){
      timerRef.current=setInterval(()=>{
        setTimeLeft(prev=>{
          if(prev<=1){
            clearInterval(timerRef.current);
            setPhase("timesup");
            return 0;
          }
          // Blackout at 60s remaining
          if(prev===61&&!blackoutDone){
            setBlackoutActive(true);
            setShowVersionA(false);
            setTimeout(()=>{
              setBlackoutActive(false);
              setBlackoutDone(true);
              setPhase("countingB");
            },3000);
          }
          return prev-1;
        });
      },1000);
      return ()=>clearInterval(timerRef.current);
    }
  },[phase,blackoutDone]);

  // Auto-advance after time's up
  useEffect(()=>{
    if(phase==="timesup"){
      const t=setTimeout(()=>setScreen(3),2000);
      return ()=>clearTimeout(t);
    }
  },[phase]);

  // Compare timer (non-blocking)
  useEffect(()=>{
    if(screen===3){
      setCompareTime(60);
      compareRef.current=setInterval(()=>{
        setCompareTime(prev=>{
          if(prev<=1){clearInterval(compareRef.current);return 0;}
          return prev-1;
        });
      },1000);
      return ()=>clearInterval(compareRef.current);
    }
  },[screen]);

  const[preCount,setPreCount]=useState(0);const[imgLoaded,setImgLoaded]=useState(false);
  // Preload 360 image
  useEffect(()=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>setImgLoaded(true);img.onerror=()=>setImgLoaded(true);img.src=_imgA;return()=>{img.onload=null;};},[_imgA]);
  // 3-2-1 countdown before timer starts
  useEffect(()=>{if(phase==="precount"&&preCount>0){const t=setTimeout(()=>setPreCount(c=>c-1),1000);return()=>clearTimeout(t);}
    if(phase==="precount"&&preCount===0){setPhase("counting");}
  },[phase,preCount]);
  const startCounting=()=>{setScreen(2);setPreCount(3);setPhase("precount");};
  const updateItem=(idx,field,val)=>{const c=[...countItems];c[idx]={...c[idx],[field]:val};setCountItems(c);};
  const addRow=()=>{setCountItems([...countItems,{product:"",quantity:"",unit:""}]);setTimeout(()=>{if(countSheetRef.current)countSheetRef.current.scrollTop=countSheetRef.current.scrollHeight;},100);};
  const removeRow=(idx)=>{if(countItems.length>1)setCountItems(countItems.filter((_,i)=>i!==idx));};
  const filledItems=countItems.filter(i=>i.product.trim());
  const fmt=(s)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const timerColor=timeLeft>60?"#1a1a1a":timeLeft>30?"#FFD300":"#E3000B";
  const isTimesUp=phase==="timesup";
  const prog=screen/5*100;

  const removedItems=[
    {item:"Brisket",qty:"1 box",location:"Top shelf, right side"},
    {item:"Limes",qty:"2 bags",location:"Middle shelf, center"},
    {item:"Avocados",qty:"1 box",location:"Floor, left side"}
  ];

  return (
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
      {/* Blackout overlay */}
      {blackoutActive&&<div style={{position:"fixed",inset:0,background:"#000",zIndex:9999}}/>}

      {/* Progress bar */}
      <div style={{height:4,background:"#e8e8e3"}}><div style={{height:4,background:"#FFD300",width:`${prog}%`,transition:"width 0.3s"}}/></div>

      {/* Screen 1 - Briefing */}
      {screen===1&&(
        <div style={{padding:"24px 20px"}}>
          <button style={{background:"none",border:"none",fontSize:14,fontWeight:700,fontFamily:FC,color:"#888",letterSpacing:1,cursor:"pointer",marginBottom:16}} onClick={onB}>&lt; BACK</button>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{width:80,height:80,borderRadius:40,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 8h.01M6 12h.01M6 16h.01"/></svg>
            </div>
            <div style={{fontSize:28,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:6}}>COOL ROOM COUNTDOWN</div>
            <div style={{fontSize:15,color:"#888",fontFamily:FB}}>Monday morning. You're opening. Time to count.</div>
          </div>
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:20,marginBottom:16}}>
            <p style={{fontSize:15,lineHeight:1.6,color:"#333",fontFamily:FB,margin:0}}>You'll see a 360-degree view of a cool room. You have <strong>2 minutes</strong> to count everything you can see. Record product name, quantity, and unit. Work alone - no talking.</p>
          </div>
          <div style={{background:"#FFF8E0",borderLeft:"4px solid #FFD300",borderRadius:8,padding:16,marginBottom:32}}>
            <p style={{fontSize:14,lineHeight:1.5,color:"#666",fontFamily:FB,margin:0}}>This is exactly what your Shift Leader does every Sunday morning. Let's see how accurate you are under pressure.</p>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}><button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16,opacity:imgLoaded?1:0.6}} onClick={startCounting}>{imgLoaded?"START COUNTING":"LOADING IMAGE..."}</button></div>
        </div>
      )}

      {/* Screen 2 - The Count */}
      {screen===2&&(
        <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 4px)",position:"relative"}}>
          {/* 3-2-1 countdown overlay */}
          {phase==="precount"&&(<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",zIndex:50,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:120,fontWeight:900,fontFamily:F107,color:preCount>0?"#FFD300":"#007A33"}}>{preCount>0?preCount:"GO!"}</div>
            <div style={{fontSize:16,fontFamily:FC,fontWeight:700,color:"#888",marginTop:12}}>GET READY TO COUNT</div>
            {!imgLoaded&&<div style={{fontSize:12,fontFamily:FC,color:"#FFB800",marginTop:20}}>Loading 360 image...</div>}
          </div>)}
          {/* Timer */}
          <div style={{padding:"10px 20px",background:"#fff",borderBottom:"1px solid #e8e8e3",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
            <div style={{position:"absolute",left:20,fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888"}}>STEP 2/5</div>
            <div style={{fontSize:40,fontWeight:900,fontFamily:FG,color:timerColor,letterSpacing:3,textAlign:"center"}}>
              {isTimesUp?<span style={{fontSize:20,letterSpacing:1}}>TIME'S UP</span>:fmt(timeLeft)}
            </div>
            <div style={{position:"absolute",right:20,fontSize:11,fontFamily:FC,fontWeight:700,letterSpacing:0.5,color:"#888",textAlign:"right"}}>
              {timeLeft<=60&&timeLeft>30&&"1 MIN LEFT"}
              {timeLeft<=30&&timeLeft>0&&"HURRY!"}
            </div>
          </div>

          {/* Cool Room 360 Viewer */}
          <div style={{flex:"0 0 auto",height:"40vh",margin:"0 8px",borderRadius:8,overflow:"hidden",border:"1px solid #333",background:"#222"}}>
            <PanoViewer imgSrc={showVersionA?_imgA:_imgB}/>
          </div>

          {/* Count Sheet */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",padding:"8px 12px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1}}>COUNT SHEET</div>
              <div style={{fontSize:12,fontFamily:FC,color:"#888",fontWeight:700}}>{filledItems.length} ITEMS</div>
            </div>
            <div ref={countSheetRef} style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:8}}>
              {countItems.map((item,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center",opacity:isTimesUp?0.5:1}}>
                  <input disabled={isTimesUp} value={item.product} onChange={e=>updateItem(i,"product",e.target.value)} placeholder="Product" style={{flex:3,padding:"10px 8px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FB,background:"#fff"}}/>
                  <input disabled={isTimesUp} type="number" value={item.quantity} onChange={e=>updateItem(i,"quantity",e.target.value)} placeholder="#" style={{flex:1,padding:"10px 6px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FB,textAlign:"center",background:"#fff"}}/>
                  <input disabled={isTimesUp} value={item.unit} onChange={e=>updateItem(i,"unit",e.target.value)} placeholder="unit" style={{flex:1.5,padding:"10px 6px",borderRadius:8,border:"1px solid #ddd",fontSize:14,fontFamily:FB,background:"#fff"}}/>
                  {!isTimesUp&&countItems.length>1&&<button onClick={()=>removeRow(i)} style={{background:"none",border:"none",fontSize:18,color:"#ccc",cursor:"pointer",padding:"0 4px",lineHeight:1}}>x</button>}
                </div>
              ))}
              {!isTimesUp&&<button onClick={addRow} style={{width:"100%",padding:"10px",borderRadius:8,border:"2px dashed #ddd",background:"transparent",fontSize:13,fontWeight:700,fontFamily:FC,letterSpacing:1,color:"#888",cursor:"pointer",marginTop:2}}>+ ADD ROW</button>}
            </div>
          </div>
        </div>
      )}

      {/* Screen 3 - Compare */}
      {screen===3&&(
        <div style={{padding:"24px 20px"}}>
          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 3/5</div>
          <div style={{fontSize:24,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:6}}>COMPARE YOUR COUNT</div>
          <p style={{fontSize:15,color:"#666",fontFamily:FB,lineHeight:1.5,marginBottom:16}}>Turn to the person next to you. Compare your counts.</p>
          {compareTime>0&&<div style={{textAlign:"center",marginBottom:16}}><span style={{fontSize:14,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:1}}>{fmt(compareTime)} remaining</span></div>}
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:10,color:"#888"}}>YOUR COUNT ({filledItems.length} ITEMS)</div>
            {filledItems.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<filledItems.length-1?"1px solid #f0f0f0":"none",fontSize:14,fontFamily:FB}}>
                <span>{item.product}</span>
                <span style={{color:"#888"}}>{item.quantity} {item.unit}</span>
              </div>
            ))}
            {filledItems.length===0&&<div style={{fontSize:14,color:"#ccc",fontFamily:FB,textAlign:"center",padding:12}}>No items recorded</div>}
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>{filledItems.length>0?`YOUR PARTNER'S COUNT FOR "${filledItems[Math.floor(filledItems.length/2)].product.toUpperCase()}"`:"PARTNER'S TOTAL ITEM COUNT"}</div>
            <input type="number" value={partnerCount} onChange={e=>setPartnerCount(e.target.value)} placeholder={filledItems.length>0?`How many did they count? e.g. ${filledItems[Math.floor(filledItems.length/2)].quantity||"3"}`:"e.g. 12"} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:16,fontFamily:FB,background:"#fff",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}><button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(4)}>NEXT</button></div>
        </div>
      )}

      {/* Screen 4 - The Reveal */}
      {screen===4&&(
        <div style={{padding:"24px 20px"}}>
          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 4/5</div>
          {noticedBlackout===null?(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:8}}>DID YOU NOTICE?</div>
              <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:24,marginBottom:24}}>
                <p style={{fontSize:17,fontWeight:700,fontFamily:FB,lineHeight:1.5,margin:0}}>Did you notice that 3 items disappeared when the screen went black?</p>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn-hover" style={{...BY,flex:1,fontSize:14,minWidth:0,padding:"14px 16px"}} onClick={()=>setNoticedBlackout(true)}>YES I NOTICED</button>
                <button className="btn-hover" style={{...BO,flex:1,fontSize:14,minWidth:0,padding:"14px 16px"}} onClick={()=>setNoticedBlackout(false)}>NO I MISSED IT</button>
              </div>
            </div>
          ):(
            <div>
              <div style={{fontSize:22,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:16}}>WHAT CHANGED</div>
              {removedItems.map((r,i)=>(
                <div key={i} style={{background:"#fff",borderLeft:"4px solid #E3000B",borderRadius:8,padding:14,marginBottom:10}}>
                  <div style={{fontSize:15,fontWeight:800,fontFamily:FC,letterSpacing:0.5}}><span style={{color:"#E3000B"}}>MISSING:</span> {r.item} ({r.qty})</div>
                  <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:4}}>{r.location}</div>
                </div>
              ))}
              <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:20,marginTop:20,marginBottom:16}}>
                <p style={{fontSize:16,fontWeight:700,fontFamily:FB,lineHeight:1.5,margin:"0 0 8px"}}>Same cool room. Same 2 minutes. Everyone got a different count.</p>
                <p style={{fontSize:14,color:"#666",fontFamily:FB,lineHeight:1.5,margin:0}}>That's what happens in your restaurant every time someone rushes a stock count.</p>
              </div>
              <div style={{background:"#FFF8E0",border:"2px solid #FFD300",borderRadius:14,padding:20,marginBottom:24}}>
                <div style={{fontSize:14,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:12,color:"#000"}}>YOUR COUNT ACCURACY TARGETS</div>
                <div style={{fontSize:13,fontFamily:FB,lineHeight:1.8,color:"#333"}}>
                  <div>- Daily variance target: less than 1kg per protein - anything over = immediate recount</div>
                  <div>- Daily waste target: under 0.7% of sales</div>
                  <div>- Inventory efficiency: high-use items 4-5 days on hand max</div>
                  <div>- Closing stock: 15-20% target. Above 20% = over-ordering or dead stock</div>
                  <div>- Count bounce (e.g. chicken -0.6, +3.7, -6.0 across 3 days) = miscount - recount on day 2</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center"}}><button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(5)}>NEXT</button></div>
            </div>
          )}
        </div>
      )}

      {/* Screen 5 - Commit */}
      {screen===5&&(
        <div style={{padding:"24px 20px"}}>
          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 5/5</div>
          <div style={{fontSize:24,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:16}}>YOUR COMMITMENT</div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>WHAT'S THE ONE THING YOU'LL PUT IN PLACE?</div>
            <textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="e.g., I'll always recount when a number looks off. I'll make sure counts happen before the rush, not during." rows={4} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
          </div>
          <div style={{background:"#000",borderRadius:14,padding:20,marginBottom:24}}>
            <p style={{fontSize:15,fontWeight:700,fontFamily:FB,lineHeight:1.6,color:"#fff",margin:0}}>Same cool room. Same 2 minutes. Nobody got the same count. If the count is wrong, everything downstream is wrong. <span style={{color:"#FFD300"}}>The count is the foundation - always double-check.</span></p>
          </div>
          <div style={{display:"flex",justifyContent:"center"}}><button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>onComplete({activityId:act.id,type:"coolroom_countdown",countItems:filledItems,totalItemsCounted:filledItems.length,partnerCount,noticedBlackout,reflection,timeSpent:120})}>COMPLETE ACTIVITY</button></div>
        </div>
      )}

      {/* Times up toast */}
      {isTimesUp&&screen===2&&<div style={{position:"fixed",top:"50%",left:0,right:0,display:"flex",justifyContent:"center",transform:"translateY(-50%)",zIndex:9998,pointerEvents:"none"}}><div style={{padding:"20px 32px",borderRadius:14,background:"#E3000B",color:"#fff",fontSize:22,fontWeight:900,fontFamily:F107,letterSpacing:2,boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}}>PENS DOWN!</div></div>}
    </div>
  );
}

// ─── ROSTER REALITY ─────────────────────────────────────────────────────────
function RosterReality({act,u,onComplete,onB}){
  const[screen,setScreen]=useState(1);
  const[s1Answers,setS1Answers]=useState(["","",""]);
  const[s2Answers,setS2Answers]=useState(["","",""]);// week, year, 200 restaurants
  const[s2Text,setS2Text]=useState("");
  const[s3Answer,setS3Answer]=useState("");
  const[s1Revealed,setS1Revealed]=useState(false);
  const[s2Revealed,setS2Revealed]=useState(false);
  const[s3Revealed,setS3Revealed]=useState(false);
  const[takeaway,setTakeaway]=useState("");
  const prog=screen/7*100;

  const DataRow=({label,value,alt,red})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderBottom:"1px solid #f0f0eb",background:alt?"#fafaf6":"#fff"}}><span style={{fontSize:14,fontFamily:FB,color:"#666"}}>{label}</span><span style={{fontSize:14,fontFamily:FC,fontWeight:800,color:red?"#E3000B":"#000"}}>{value}</span></div>);

  const AnswerCard=({label,text})=>(<div style={{background:"#fff",borderLeft:"4px solid #007A33",borderRadius:8,padding:16,marginBottom:12}}><div style={{fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#007A33",marginBottom:6}}>{label}</div><div style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#333"}}>{text}</div></div>);

  const InsightCard=({text})=>(<div style={{background:"#FFF8E0",borderLeft:"4px solid #FFD300",borderRadius:8,padding:16,marginBottom:20}}><p style={{fontSize:14,lineHeight:1.6,color:"#333",fontFamily:FB,margin:0,fontWeight:600}}>{text}</p></div>);

  const ImpactNum=({num,label})=>(<div style={{textAlign:"center",marginBottom:12}}><div style={{fontSize:28,fontWeight:900,fontFamily:FC,color:"#E3000B",lineHeight:1.2}}>{num}</div><div style={{fontSize:12,fontFamily:FC,color:"#888",letterSpacing:1,marginTop:4}}>{label}</div></div>);

  return (
    <div className="view-enter" style={{minHeight:"100vh",background:"#f5f5f0",paddingBottom:40}}>
      <div style={{height:4,background:"#e8e8e3"}}><div style={{height:4,background:"#FFD300",width:`${prog}%`,transition:"width 0.3s"}}/></div>

      {/* Screen 1 - Restaurant Briefing */}
      {screen===1&&(<div style={{padding:"24px 20px"}}>
        <button style={{background:"none",border:"none",fontSize:14,fontWeight:700,fontFamily:FC,color:"#888",letterSpacing:1,cursor:"pointer",marginBottom:16}} onClick={onB}>&lt; BACK</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:28,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:4}}>ROSTER REALITY</div>
          <div style={{fontSize:15,color:"#888",fontFamily:FB}}>Three decisions. One restaurant.</div>
        </div>
        <div style={{background:"#000",borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{fontSize:20,fontWeight:900,fontFamily:F107,color:"#fff",letterSpacing:1,marginBottom:14}}>GYG HARRINGTON PARK</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1,marginBottom:4}}>WEEKLY SALES</div><div style={{fontSize:18,fontWeight:900,fontFamily:FC,color:"#FFD300"}}>$68,000</div></div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1,marginBottom:4}}>CREW</div><div style={{fontSize:18,fontWeight:900,fontFamily:FC,color:"#fff"}}>42</div></div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1,marginBottom:4}}>FORMAT</div><div style={{fontSize:14,fontWeight:700,fontFamily:FC,color:"#fff"}}>Drive-thru strip</div></div>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:12}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1,marginBottom:4}}>ARM</div><div style={{fontSize:14,fontWeight:700,fontFamily:FC,color:"#fff"}}>Jordan Malik</div><div style={{fontSize:11,color:"#888"}}>18 months</div></div>
          </div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:12}}>
          <p style={{fontSize:15,lineHeight:1.6,color:"#333",fontFamily:FB,margin:0}}>Harrington Park is performing - but not as well as it could be. You're about to find out why across three scenarios.</p>
        </div>
        <InsightCard text="Work through each scenario individually. Your facilitator will bring the room together after each round."/>
        <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(2)}>BEGIN SCENARIO 1</button>
      </div>)}

      {/* Screen 2 - Scenario 1: The Forecast Problem */}
      {screen===2&&(<div style={{padding:"24px 20px"}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 2/7</div>
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:1,marginBottom:8}}>SCENARIO 1: THE FORECAST PROBLEM</div>
          <p style={{fontSize:14,lineHeight:1.5,color:"#ccc",fontFamily:FB,margin:0}}>It's the week of the Ding Dong campaign launch. Jordan built the roster 10 days earlier using last week's sales as the forecast. Nobody updated the Ops Labour Tool before the roster went out.</p>
        </div>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8e8e3",overflow:"hidden",marginBottom:20}}>
          <DataRow label="Forecast sales" value="$68,000"/>
          <DataRow label="Actual sales" value="$84,500" alt/>
          <DataRow label="Campaign uplift" value="24%"/>
          <DataRow label="Rostered hours" value="569" alt/>
          <DataRow label="Model hours at actual sales" value="635"/>
          <DataRow label="Actual SPLH" value="$149" alt red/>
          <DataRow label="SPLH target" value="$115-$125"/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>Q1: HOW MANY HOURS UNDERSTAFFED?</div>
          <input type="number" value={s1Answers[0]} onChange={e=>{const a=[...s1Answers];a[0]=e.target.value;setS1Answers(a);}} placeholder="Hours" style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:16,fontFamily:FB,background:"#fff",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>Q2: WHAT DOES AN SPLH OF $149 TELL YOU?</div>
          <textarea value={s1Answers[1]} onChange={e=>{const a=[...s1Answers];a[1]=e.target.value;setS1Answers(a);}} placeholder="Think about what it feels like on the floor..." rows={4} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>Q3: WHAT WOULD HAVE BEEN DIFFERENT?</div>
          <textarea value={s1Answers[2]} onChange={e=>{const a=[...s1Answers];a[2]=e.target.value;setS1Answers(a);}} placeholder="What changes downstream?" rows={3} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
        </div>
        {!s1Revealed?<button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16,opacity:s1Answers.every(a=>a.trim())?1:0.4}} disabled={!s1Answers.every(a=>a.trim())} onClick={()=>setS1Revealed(true)}>REVEAL ANSWERS</button>
        :<div>
          <div style={{fontSize:16,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:12}}>ANSWERS</div>
          <AnswerCard label="A1 - HOURS GAP" text="66 hours. The model called for 635 hours at $84,500 in actual sales. Jordan rostered 569 - built to the $68,000 forecast. That's a 66-hour gap across the week."/>
          <AnswerCard label="A2 - SPLH IMPACT" text="The SPLH target is $115-$125. At $149, Harrington Park is $24 above the ceiling - the kitchen is significantly understaffed relative to volume. KDS times blow out, drive-thru times suffer, CPT goes up. Every complaint is a lost return visit. The guest experience Jordan spent 18 months building gets eroded in one week - because the forecast wasn't updated."/>
          <AnswerCard label="A3 - WHAT CHANGES" text="The Ops Labour Tool would have called for 635 hours instead of 569. Jordan would have rostered 1-2 extra per shift across peaks. SPLH would have sat inside the target window. KDS and CPT would have been protected. One update before the roster changes everything downstream."/>
          <InsightCard text="Sales forecasting isn't a finance job. It's an ARM job. If you know a campaign, school holidays, or a local event is coming - update the forecast BEFORE you build the roster."/>
          <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(3)}>BEGIN SCENARIO 2</button>
        </div>}
      </div>)}

      {/* Screen 3 - Scenario 2: The AHR Problem */}
      {screen===3&&(<div style={{padding:"24px 20px",overflow:"hidden"}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 4/7</div>
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:1,marginBottom:8}}>SCENARIO 2: THE AHR PROBLEM</div>
          <p style={{fontSize:14,lineHeight:1.5,color:"#ccc",fontFamily:FB,margin:0}}>Different week. Sales are on track at $68,000. But Jordan's labour percentage is 34% against a bench of 30%. The hours aren't the problem. The cost of the hours is.</p>
        </div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16}}>
          <div style={{background:"#fff",borderRadius:14,border:"1px solid #e8e8e3",overflow:"hidden",minWidth:360}}>
            <div style={{display:"flex",padding:"10px 14px",background:"#1a1a1a",color:"#fff",fontSize:11,fontFamily:FC,fontWeight:700,letterSpacing:1.5}}>
              <div style={{flex:2}}>CLASSIFICATION</div><div style={{flex:1,textAlign:"right"}}>% HRS</div><div style={{flex:1,textAlign:"right"}}>HRS/WK</div><div style={{flex:1,textAlign:"right"}}>RATE</div>
            </div>
            {[{c:"Casual 21+",p:"48%",h:"273",r:"$33.19"},{c:"Casual 19",p:"22%",h:"125",r:"$26.55"},{c:"Part-Time 21+",p:"18%",h:"102",r:"$26.56"},{c:"Full-Time 21+",p:"8%",h:"46",r:"$26.56"},{c:"Management",p:"4%",h:"23",r:"Salaried"}].map((row,i)=>(
              <div key={i} style={{display:"flex",padding:"12px 14px",borderBottom:"1px solid #f0f0eb",background:i%2?"#fafaf6":"#fff",fontSize:13,fontFamily:FB}}>
                <div style={{flex:2,fontWeight:600}}>{row.c}</div><div style={{flex:1,textAlign:"right"}}>{row.p}</div><div style={{flex:1,textAlign:"right"}}>{row.h}</div><div style={{flex:1,textAlign:"right",fontWeight:700,fontFamily:FC}}>{row.r}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1}}>ACTUAL AHR</div><div style={{fontSize:20,fontWeight:900,fontFamily:FC,color:"#E3000B"}}>$29.87</div></div>
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1}}>BENCH AHR</div><div style={{fontSize:20,fontWeight:900,fontFamily:FC,color:"#007A33"}}>$27.94</div></div>
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1}}>GAP</div><div style={{fontSize:20,fontWeight:900,fontFamily:FC,color:"#E3000B"}}>$1.93/hr</div></div>
          <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,padding:12,textAlign:"center"}}><div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1}}>CREW HRS/WK</div><div style={{fontSize:20,fontWeight:900,fontFamily:FC}}>546</div></div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>Q1: WHAT DOES THE GAP COST?</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",boxSizing:"border-box"}}>
            <input type="text" value={s2Answers[0]} onChange={e=>{const a=[...s2Answers];a[0]=e.target.value;setS2Answers(a);}} placeholder="$ per week" style={{width:"100%",padding:"14px 12px",borderRadius:10,border:"1px solid #ddd",fontSize:14,fontFamily:FB,background:"#fff",boxSizing:"border-box",maxWidth:"100%"}}/>
            <input type="text" value={s2Answers[1]} onChange={e=>{const a=[...s2Answers];a[1]=e.target.value;setS2Answers(a);}} placeholder="$ per year" style={{width:"100%",padding:"14px 12px",borderRadius:10,border:"1px solid #ddd",fontSize:14,fontFamily:FB,background:"#fff",boxSizing:"border-box",maxWidth:"100%"}}/>
            <input type="text" value={s2Answers[2]} onChange={e=>{const a=[...s2Answers];a[2]=e.target.value;setS2Answers(a);}} placeholder="$ across 200 restaurants" style={{width:"100%",padding:"14px 12px",borderRadius:10,border:"1px solid #ddd",fontSize:14,fontFamily:FB,background:"#fff",boxSizing:"border-box",maxWidth:"100%"}}/>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>Q2: WHAT TWO CHANGES WOULD HAVE THE BIGGEST IMPACT?</div>
          <textarea value={s2Text} onChange={e=>setS2Text(e.target.value)} placeholder="Lever 1: ... Lever 2: ..." rows={5} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
        </div>
        {!s2Revealed?<button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16,opacity:(s2Answers.every(a=>a.trim())&&s2Text.trim())?1:0.4}} disabled={!(s2Answers.every(a=>a.trim())&&s2Text.trim())} onClick={()=>setS2Revealed(true)}>REVEAL ANSWERS</button>
        :<div>
          <div style={{fontSize:16,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:12}}>ANSWERS</div>
          <div style={{background:"#fff",borderLeft:"4px solid #007A33",borderRadius:8,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#007A33",marginBottom:10}}>A1 - THE COST</div>
            <div style={{display:"flex",justifyContent:"space-around",marginBottom:12}}>
              <ImpactNum num="$1,056" label="PER WEEK"/>
              <ImpactNum num="$54,921" label="PER YEAR"/>
            </div>
            <ImpactNum num="~$11 MILLION" label="ACROSS 200 RESTAURANTS"/>
            <p style={{fontSize:13,color:"#666",fontFamily:FB,lineHeight:1.5,margin:"8px 0 0",textAlign:"center"}}>Sitting in crew mix decisions ARMs make every roster.</p>
          </div>
          <div style={{background:"#fff",borderLeft:"4px solid #007A33",borderRadius:8,padding:16,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#007A33",marginBottom:8}}>A2 - THE LEVERS</div>
            <p style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#333",margin:"0 0 10px"}}><strong>Lever 1 - Shift casual 21+ hours to PT or FT.</strong> Casual 21+ costs $33.19/hr. PT or FT 21+ costs $26.56/hr. That's $6.63 saved per hour. Shifting just 10% of total hours (57 hours) saves $377/week = $19,617/year.</p>
            <p style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#333",margin:0}}><strong>Lever 2 - Increase the junior mix in appropriate roles.</strong> Casual 19 costs $26.55/hr vs casual 21+ at $33.19/hr - a $6.64/hr difference. Neither lever requires reducing headcount or hours - just changing who fills them.</p>
          </div>
          <InsightCard text="AHR isn't something that happens to you. It's something you build or erode - shift by shift, roster by roster. Know your bench AHR and have a plan to close the gap."/>
          <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(4)}>BEGIN SCENARIO 3</button>
        </div>}
      </div>)}

      {/* Screen 4 - Scenario 3: The Mid-Shift Moment */}
      {screen===4&&(<div style={{padding:"24px 20px"}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 6/7</div>
        <div style={{background:"#000",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:18,fontWeight:900,fontFamily:F107,color:"#FFD300",letterSpacing:1}}>SCENARIO 3: THE MID-SHIFT MOMENT</div>
        </div>
        <div style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:14,padding:16,marginBottom:16}}>
          <p style={{fontSize:15,lineHeight:1.5,color:"#333",fontFamily:FB,margin:0}}>It's Tuesday. 2pm. Jordan checks the daily labour Power BI report.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
          {[{l:"Sales at 2pm",v:"$4,850"},{l:"Projected daily",v:"$7,200"},{l:"Forecast",v:"$9,500"},{l:"Below forecast",v:"$2,300",red:true},{l:"On shift til 6pm",v:"14"},{l:"Model says",v:"9"},{l:"Surplus",v:"5 people",red:true},{l:"Jordan's action",v:"Nothing",red:true}].map((s,i)=>(
            <div key={i} style={{background:"#fff",border:"1px solid #e8e8e3",borderRadius:12,padding:12}}>
              <div style={{fontSize:11,fontFamily:FC,color:"#888",letterSpacing:1}}>{s.l.toUpperCase()}</div>
              <div style={{fontSize:18,fontWeight:900,fontFamily:FC,color:s.red?"#E3000B":"#000",marginTop:2}}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>WHAT DO YOU DO?</div>
          <textarea value={s3Answer} onChange={e=>setS3Answer(e.target.value)} placeholder="What actions would you take right now?" rows={5} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
        </div>
        {!s3Revealed?<button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16,opacity:s3Answer.trim()?1:0.4}} disabled={!s3Answer.trim()} onClick={()=>setS3Revealed(true)}>REVEAL ANSWER</button>
        :<div>
          <div style={{fontSize:16,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:12}}>ANSWER</div>
          <AnswerCard label="WHAT JORDAN CAN DO RIGHT NOW" text="Offer early finishes to volunteers - no forced send-home, many will take it. Consolidate tasks, move people onto extended breaks to reduce active headcount. Check if any crew can move onto training hours - keeps them productive, coded separately on Power BI. Note the forecast gap for next week's roster build."/>
          <div style={{background:"#fff",borderLeft:"4px solid #E3000B",borderRadius:8,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#E3000B",marginBottom:10}}>COST OF DOING NOTHING</div>
            <p style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#333",margin:"0 0 10px"}}>5 surplus people x 4 hours x $31.50 avg rate =</p>
            <ImpactNum num="$630" label="TODAY"/>
            <p style={{fontSize:14,fontFamily:FB,lineHeight:1.6,color:"#333",margin:"8px 0",textAlign:"center"}}>If this happens twice a week:</p>
            <ImpactNum num="$65,520" label="PER YEAR"/>
            <p style={{fontSize:14,fontWeight:700,fontFamily:FB,color:"#E3000B",textAlign:"center",margin:"8px 0 0"}}>That's not a bad week. That's a habit.</p>
          </div>
          <InsightCard text="The ARMs who check Power BI mid-shift on slow days and act on it protect their labour percentage week after week. The ones who don't are the ones wondering why their numbers are off at end of month."/>
          <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>setScreen(5)}>NEXT</button>
        </div>}
      </div>)}

      {/* Screen 5 - Commit & Takeaways */}
      {screen===5&&(<div style={{padding:"24px 20px"}}>
        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:1,color:"#888",marginBottom:16}}>STEP 7/7</div>
        <div style={{fontSize:24,fontWeight:900,fontFamily:F107,letterSpacing:1,marginBottom:16}}>THREE DECISIONS</div>
        {[{n:"1",title:"UPDATE YOUR FORECAST",text:"Update your forecast before you build the roster. Campaigns, school holidays, local events - if you know it's coming, the Ops Labour Tool needs to know too."},{n:"2",title:"KNOW YOUR BENCH AHR",text:"Know your bench AHR and close the gap deliberately. Shift casual 21+ to permanent. Increase junior mix in the right roles. Every $1.93/hr gap costs $55K a year."},{n:"3",title:"CHECK POWER BI MID-SHIFT",text:"Check Power BI mid-shift on slow days and act on it. Offer early finishes, consolidate tasks, move crew to training. Doing nothing twice a week costs $65K a year."}].map(d=>(
          <div key={d.n} style={{display:"flex",gap:14,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:18,background:"#FFD300",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:900,fontSize:18,flexShrink:0,lineHeight:1,color:"#000"}}>{d.n}</div>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800,fontFamily:FC,letterSpacing:0.5,marginBottom:4}}>{d.title}</div><div style={{fontSize:14,fontFamily:FB,lineHeight:1.5,color:"#555"}}>{d.text}</div></div>
          </div>
        ))}
        <div style={{background:"#000",borderRadius:14,padding:20,marginBottom:20,marginTop:8}}>
          <p style={{fontSize:16,fontWeight:700,fontFamily:FB,lineHeight:1.6,color:"#fff",margin:0,textAlign:"center"}}>By the time you read it on the P&L, the decision was made <span style={{color:"#FFD300"}}>three weeks ago.</span></p>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:800,fontFamily:FC,letterSpacing:1,marginBottom:8}}>WHAT'S THE ONE THING YOU'RE TAKING BACK?</div>
          <textarea value={takeaway} onChange={e=>setTakeaway(e.target.value)} placeholder="Be specific - what will you do differently?" rows={3} style={{width:"100%",padding:"14px 12px",borderRadius:12,border:"1px solid #ddd",fontSize:15,fontFamily:FB,background:"#fff",resize:"vertical",boxSizing:"border-box",lineHeight:1.5}}/>
        </div>
        <button className="btn-hover" style={{...BY,width:"100%",padding:"18px 32px",fontSize:17,borderRadius:16}} onClick={()=>onComplete({activityId:act.id,type:"roster_reality",scenario1:{answers:s1Answers,hoursGap:s1Answers[0]},scenario2:{answers:s2Answers,text:s2Text,weeklyCost:s2Answers[0]},scenario3:{answer:s3Answer},takeaway})}>COMPLETE ACTIVITY</button>
      </div>)}
    </div>
  );
}

function AdminDash({us,co,ch:allCh,onB,lunchConfig,onUpdateLunchConfig,onUpdateComps,onUpdateCh,onDeleteUser,onChangePass,batchControl,activityComps,onUpdateBatchControl,coolroomImgs,onUpdateCoolroomImg,flash,onPreviewActivity,onPreviewChallenge,activityConfig,onUpdateActivityConfig}){
  const[tab,sT]=useState("overview");
  const[isMobile,setIsMobile]=useState(typeof window!=="undefined"&&window.innerWidth<900);
  const[sideOpen,setSideOpen]=useState(false);
  const[fp,sFp]=useState("all");
  const[fb,sFb]=useState("all");
  const[editUser,setEditUser]=useState(null);
  const[newPass,setNewPass]=useState("");
  const[confirmDel,setConfirmDel]=useState(null);
  const[editCh,setEditCh]=useState(null);
  const[expandedSub,setExpandedSub]=useState(null);
  const[lightboxImg,setLightboxImg]=useState(null);
  const[peopleTab,setPeopleTab]=useState("participants");
  const[searchQ,setSearchQ]=useState("");
  const[editActType,setEditActType]=useState(null);
  const[iconPickerCb,setIconPickerCb]=useState(null);
  const[iconPickerCurrent,setIconPickerCurrent]=useState("");
  const[hotspotEditor,setHotspotEditor]=useState(false);
  const[editorYP,setEditorYP]=useState({yaw:0,pitch:0});
  const editorViewRef=useRef(null);
  const[contentProg,setContentProg]=useState("lse");
  const[contentSection,setContentSection]=useState(null);
  useEffect(()=>{const h=()=>{setIsMobile(window.innerWidth<900);if(window.innerWidth>=900)setSideOpen(false);};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);

  const challenges=allCh||DEFAULT_CHALLENGES;
  const batches=[...new Set(us.map(u=>u.batch).filter(Boolean))].sort().reverse();
  const filtered=us.filter(u=>{if(fp!=="all"&&u.program!==fp)return false;if(fb!=="all"&&u.batch!==fb)return false;if(searchQ){const q=searchQ.toLowerCase();return u.name?.toLowerCase().includes(q)||u.email?.toLowerCase().includes(q)||u.restaurant?.toLowerCase().includes(q);}return true;});
  const filteredCo=co.filter(c=>{if(fp!=="all"&&c.program!==fp)return false;if(fb!=="all"&&c.batch!==fb)return false;return true;});
  const uP=id=>co.filter(c=>c.userId===id).reduce((s,c)=>s+c.points+(c.bonusApproved?c.bonusPoints||0:0),0);
  const uD=id=>co.filter(c=>c.userId===id).length;
  const totalU=filtered.length;
  const totalC=filteredCo.length;
  const avgS=totalU?Math.round(filteredCo.reduce((s,c)=>s+c.points,0)/totalU):0;
  const compR=totalU?Math.round(totalC/(totalU*4)*100):0;

  const weekStats=[1,2,3,4].map(w=>{
    const wkIds=Object.values(challenges).flat().filter(c=>c.week===w).map(c=>c.id);
    const eligible=filtered.filter(u=>getUserWeek(u.createdAt)>=w);
    const completed=eligible.filter(u=>co.some(c=>c.userId===u.id&&wkIds.includes(c.challengeId)));
    return{week:w,eligible:eligible.length,completed:completed.length};
  });

  const batchSchedule=batches.map(b=>{
    const bu=us.filter(u=>u.batch===b);if(!bu.length)return null;
    const earliest=bu.reduce((min,u)=>!min||new Date(u.createdAt)<new Date(min)?u.createdAt:min,null);
    const currentWk=getUserWeek(earliest);const nextWk=Math.min(currentWk+1,5);
    const nextDate=nextWk<=4?new Date(new Date(earliest).getTime()+nextWk*7*24*60*60*1000):null;
    return{batch:b,program:bu[0]?.program,currentWk,nextWk,nextDate,users:bu.length};
  }).filter(Boolean);

  // CSV exports
  const exportData=()=>{
    const hdr=["Name","Position","Restaurant","Program","Batch","Week","Completions","Score","Active"];
    const rows=filtered.map(u=>[u.name,u.position,u.restaurant,PROGRAMS[u.program]?.name||u.program,u.batch,getUserWeek(u.createdAt),uD(u.id),uP(u.id),uD(u.id)>=getUserWeek(u.createdAt)?"Yes":"Behind"]);
    const esc=v=>{const s=String(v);return s.includes(",")||s.includes('"')?'"'+s.replace(/"/g,'""')+ '"':s;};
    const csv="\uFEFF"+[hdr.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="GYG-Challenge-Hub-"+(fp!=="all"?fp:"all")+"-"+(fb!=="all"?fb:"all")+"-"+new Date().toISOString().slice(0,10)+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  };
  const exportLunch=()=>{
    const hdr=["Name","Restaurant","Program","Batch","Meal Type","Filling"];
    const rows=filtered.map(u=>[u.name,u.restaurant,PROGRAMS[u.program]?.name||u.program,u.batch,u.lunchType?u.lunchType.toUpperCase():"NO ORDER",u.lunchFilling?(LUNCH_MENU.fillings.find(fl=>fl.id===u.lunchFilling)?.name||u.lunchFilling):"-"]);
    const esc=v=>{const s=String(v);return s.includes(",")||s.includes('"')?'"'+s.replace(/"/g,'""')+ '"':s;};
    const csv="\uFEFF"+[hdr.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="GYG-Lunch-Orders-"+(fb!=="all"?fb:"all")+"-"+new Date().toISOString().slice(0,10)+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  };
  const saveCh=(progId,idx,field,value)=>{const updated=JSON.parse(JSON.stringify(challenges));const q=acfg.activeQuarter?.[progId]||"Q1";const key=q==="Q1"?progId:`${progId}_${q}`;if(!updated[key])updated[key]=JSON.parse(JSON.stringify(DEFAULT_CHALLENGES[key]||[]));updated[key][idx][field]=value;onUpdateCh(updated);};
  const compressImage=(file,maxW=2048,q=0.7)=>new Promise(resolve=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,maxW/img.width);c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",q));};img.src=URL.createObjectURL(file);});

  // Nav
  const navItems=[
    {id:"overview",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>},
    {id:"content",label:"Content",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>},
    {id:"people",label:"People",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>},
    {id:"submissions",label:"Submissions",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>},
  ];

  // Shared styles - Apple-inspired, GYG on brand
  const card={background:"#fff",borderRadius:16,border:"none",padding:isMobile?16:24,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.03)"};
  const secTitle={fontFamily:FC,fontWeight:800,fontSize:15,letterSpacing:0.5,color:"#1a1a1a",marginBottom:16};
  const subLabel={fontFamily:FC,fontWeight:700,fontSize:11,letterSpacing:1,color:"#999",marginBottom:8,textTransform:"uppercase"};
  const btnY={padding:"11px 22px",background:"#FFD300",color:"#000",border:"none",borderRadius:12,fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"};
  const btnB={padding:"11px 22px",background:"#1a1a1a",color:"#FFD300",border:"none",borderRadius:12,fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"};
  const btnR={padding:"11px 22px",background:"#E3000B",color:"#fff",border:"none",borderRadius:12,fontFamily:FC,fontWeight:800,fontSize:13,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"};
  const btnG={padding:"11px 22px",background:"#f5f5f0",color:"#555",border:"none",borderRadius:12,fontFamily:FC,fontWeight:700,fontSize:13,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"};
  const inp={padding:"12px 16px",border:"1px solid #e8e8e3",borderRadius:12,fontFamily:FB,fontSize:14,outline:"none",width:"100%",boxSizing:"border-box",background:"#f8f8f5",transition:"border 0.2s,background 0.2s"};
  const pill=a=>({padding:"9px 18px",borderRadius:24,border:"none",background:a?"#FFD300":"#f0f0eb",color:a?"#000":"#888",fontFamily:FC,fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"});

  // Stat card
  const StatCard=({n,l,c})=>(<div style={{...card,textAlign:"center",padding:isMobile?"18px 12px":"24px 16px",flex:1,minWidth:isMobile?100:0}}><div style={{fontSize:isMobile?26:36,fontWeight:900,fontFamily:FC,color:c||"#1a1a1a",lineHeight:1}}>{n}</div><div style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#aaa",letterSpacing:0.5,marginTop:6}}>{l}</div></div>);

  /* ═══ OVERVIEW ═══ */
  const renderOverview=()=>(<div>
    <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>{[{n:totalU,l:"PARTICIPANTS"},{n:totalC,l:"SUBMISSIONS"},{n:avgS,l:"AVG SCORE"},{n:`${compR}%`,l:"COMPLETION"}].map((s,i)=><StatCard key={i} {...s}/>)}</div>

    <div style={secTitle}>Weekly Scoreboard</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8,marginBottom:28}}>
      {weekStats.map(w=>(<div key={w.week} style={{background:w.completed===w.eligible&&w.eligible>0?"#007A33":"#1a1a1a",borderRadius:12,padding:isMobile?"12px 8px":"16px 12px",textAlign:"center"}}>
        <div style={{fontFamily:FC,fontWeight:900,fontSize:isMobile?18:24,color:"#fff"}}>{w.completed}<span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.4)"}}>/{w.eligible}</span></div>
        <div style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#FFD300",letterSpacing:1,marginTop:4}}>WEEK {w.week}</div>
        <div style={{height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,marginTop:8,overflow:"hidden"}}><div style={{height:"100%",width:w.eligible?`${w.completed/w.eligible*100}%`:"0%",background:w.completed===w.eligible&&w.eligible>0?"#fff":"#FFD300",borderRadius:2,transition:"width 0.4s"}}/></div>
      </div>))}
    </div>

    <div style={secTitle}>Batch Performance</div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill, minmax(280px, 1fr))",gap:12,marginBottom:28}}>
      {batches.map(b=>{const bu=us.filter(u=>u.batch===b);const bc2=co.filter(c=>c.batch===b);const rate=bu.length?Math.round(bc2.length/(bu.length*4)*100):0;return(
        <div key={b} style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5}}>{b}</span><span style={{fontFamily:FC,fontWeight:900,fontSize:20,color:rate>=75?"#007A33":rate>=25?"#FFB800":"#E3000B"}}>{rate}%</span></div>
          <div style={{height:6,background:"#f0f0eb",borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:`${rate}%`,background:rate>=75?"#007A33":rate>=25?"#FFB800":"#E3000B",borderRadius:3,transition:"width 0.4s"}}/></div>
          <div style={{fontSize:12,color:"#999",fontFamily:FB}}>{bu.length} participants - {bc2.length} submissions</div>
        </div>
      );})}
      {batches.length===0&&<div style={{color:"#999",fontFamily:FC,padding:24,textAlign:"center"}}>No batches yet</div>}
    </div>

    <div style={secTitle}>Batch Schedule</div>
    <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill, minmax(300px, 1fr))",gap:12,marginBottom:28}}>
      {batchSchedule.map(bs=>{const prog=PROGRAMS[bs.program];const bu=us.filter(u=>u.batch===bs.batch);const activeCount=bu.filter(u=>uD(u.id)>=getUserWeek(u.createdAt)).length;return(
        <div key={bs.batch} style={card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5}}>{bs.batch}</span><span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#999"}}>{prog?.short}</span></div>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            {[1,2,3,4].map(w=>(<div key={w} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:8,background:w<=bs.currentWk?"#FFD300":w===bs.currentWk+1?"#f5f5f0":"#fafafa",border:w===bs.currentWk+1?"1px dashed #ccc":"1px solid transparent"}}>
              <div style={{fontFamily:FC,fontWeight:900,fontSize:13,color:w<=bs.currentWk?"#000":"#ccc"}}>W{w}</div>
              <div style={{fontSize:10,fontWeight:700,fontFamily:FC,color:w<=bs.currentWk?"#000":"#bbb",letterSpacing:0.5}}>{w<bs.currentWk?"DONE":w===bs.currentWk?"LIVE":w===bs.currentWk+1?"NEXT":"---"}</div>
            </div>))}
          </div>
          {bs.nextDate&&bs.nextWk<=4&&<div style={{fontSize:13,color:"#888",marginBottom:8,fontFamily:FB}}>Week {bs.nextWk} unlocks: <strong style={{color:"#000"}}>{bs.nextDate.toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</strong></div>}
          {bs.currentWk>=4&&<div style={{fontSize:12,color:"#007A33",fontWeight:700,fontFamily:FC}}>All weeks unlocked</div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:8,paddingTop:8,borderTop:"1px solid #f0f0eb"}}><span style={{color:"#999"}}>{bs.users} participants</span><span style={{fontWeight:700,color:activeCount===bs.users?"#007A33":"#FFB800"}}>{activeCount}/{bs.users} on track</span></div>
        </div>
      );})}
    </div>

    <div style={secTitle}>By Program</div>
    <div style={{...card,padding:0,overflow:"hidden"}}>
      {[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map((p,pi)=>{const pu=us.filter(u=>u.program===p.id),pc=co.filter(c=>c.program===p.id);const rate=pu.length?Math.round(pc.length/(pu.length*4)*100):0;return(
        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:isMobile?"12px 14px":"14px 20px",borderBottom:pi<3?"1px solid #f0f0eb":"none"}}>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:FC,fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div><div style={{fontSize:12,color:"#999",fontFamily:FB}}>{pu.length} people - {pc.length} submissions</div></div>
          <div style={{width:100,height:6,background:"#f0f0eb",borderRadius:3,overflow:"hidden",flexShrink:0}}><div style={{height:"100%",width:`${rate}%`,background:"#FFD300",borderRadius:3,transition:"width 0.4s"}}/></div>
          <span style={{fontFamily:FC,fontWeight:800,fontSize:13,color:rate>=50?"#007A33":"#999",minWidth:36,textAlign:"right"}}>{rate}%</span>
        </div>
      );})}
    </div>
    <div style={secTitle}>Export Data</div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <button onClick={exportData} style={{...btnB,display:"flex",alignItems:"center",gap:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>PARTICIPANTS CSV</button>
      <button onClick={exportLunch} style={{...btnB,display:"flex",alignItems:"center",gap:6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>LUNCH ORDERS CSV</button>
    </div>
  </div>);

  /* ═══ ACTIVITIES ═══ */
  const acfg=activityConfig||{};
  const saveAcfg=(type,updates)=>{const cfg={...acfg,[type]:{...(acfg[type]||{}),...updates}};onUpdateActivityConfig(cfg);};
  const addHotspot=(yaw,pitch)=>{const hz=acfg.hazard_hunt?.zones||[...HAZARD_ZONES];const newId="hz_"+Date.now();const fb={...(acfg.hazard_hunt?.feedback||{...HAZARD_FEEDBACK})};fb[newId]={hazard:true,title:"NEW HAZARD",desc:"Edit this description"};hz.push({id:newId,yaw,pitch,size:44});saveAcfg("hazard_hunt",{zones:hz,feedback:fb});};
  const removeHotspot=(id)=>{const hz=(acfg.hazard_hunt?.zones||[...HAZARD_ZONES]).filter(z=>z.id!==id);const fb={...(acfg.hazard_hunt?.feedback||{...HAZARD_FEEDBACK})};delete fb[id];saveAcfg("hazard_hunt",{zones:hz,feedback:fb});};
  const updateHotspotFb=(id,field,val)=>{const fb={...(acfg.hazard_hunt?.feedback||{...HAZARD_FEEDBACK})};fb[id]={...(fb[id]||{}),[field]:val};saveAcfg("hazard_hunt",{feedback:fb});};
  const updateHotspotZone=(idx,field,val)=>{const hz=[...(acfg.hazard_hunt?.zones||[...HAZARD_ZONES])];hz[idx]={...hz[idx],[field]:val};saveAcfg("hazard_hunt",{zones:hz});};
  const updateChaosProb=(idx,field,val)=>{const probs=[...(acfg.shift_in_chaos?.problems||[...CHAOS_PROBLEMS])];probs[idx]={...probs[idx],[field]:val};saveAcfg("shift_in_chaos",{problems:probs});};

  // Toggle switch component
  const Toggle=({on,onToggle,label,sub})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0"}}>
    <div><div style={{fontSize:14,fontWeight:600,fontFamily:FB,color:"#1a1a1a"}}>{label}</div>{sub&&<div style={{fontSize:12,color:"#999",fontFamily:FB,marginTop:2}}>{sub}</div>}</div>
    <div onClick={onToggle} style={{width:48,height:28,borderRadius:14,background:on?"#007A33":"#ddd",cursor:"pointer",transition:"background 0.3s",position:"relative",flexShrink:0}}>
      <div style={{width:24,height:24,borderRadius:12,background:"#fff",position:"absolute",top:2,left:on?22:2,transition:"left 0.3s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
    </div>
  </div>);

  /* ═══ CONTENT (unified activities + challenges) ═══ */
  const renderContent=()=>{
    const prog=PROGRAMS[contentProg];
    const activeQ=acfg.activeQuarter?.[contentProg]||"Q1";
    const activeQW=QUARTERLY_WORKSHOPS[contentProg]?.[activeQ]||null;
    const chKey=activeQ==="Q1"?contentProg:`${contentProg}_${activeQ}`;
    const progChallenges=(challenges||DEFAULT_CHALLENGES)[chKey]||DEFAULT_CHALLENGES[chKey]||[];
    const progActQ=acfg.activeQuarter?.[contentProg]||"Q1";const progActKey=progActQ==="Q1"?contentProg:`${contentProg}_${progActQ}`;
    const progActivities=DEFAULT_ACTIVITIES[progActKey]||DEFAULT_ACTIVITIES[contentProg]||[];
    // All content items for this program
    const allItems=[
      ...progActivities.map(a=>({...a,kind:"activity",label:"Activity"})),
      ...progChallenges.map(c=>({...c,kind:"challenge",label:`Week ${c.week}`})),
    ];
    // Batch controls for this program
    // Filter batches to active quarter - batches tagged with quarter in batchControl, or untagged = Q1
    const progBatches=batches.filter(b=>{if(!us.some(u=>u.batch===b&&u.program===contentProg))return false;const bk=(batchControl||{})[b];const batchQ=bk?.quarter||"Q1";return batchQ===activeQ;});

    return(<div>
      {/* Program selector */}
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=>(
          <button key={p.id} onClick={()=>{setContentProg(p.id);setContentSection(null);}} style={{padding:"10px 20px",borderRadius:24,border:"none",background:contentProg===p.id?"#1a1a1a":"#fff",color:contentProg===p.id?"#FFD300":"#888",fontFamily:FC,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s",boxShadow:contentProg===p.id?"none":"0 1px 3px rgba(0,0,0,0.04)"}}>{p.short}</button>
        ))}
      </div>

      {/* Program header */}
      <div style={{...card,background:"#1a1a1a",color:"#fff",padding:isMobile?20:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:F107,fontWeight:900,fontSize:isMobile?20:24,letterSpacing:0.5}}>{prog?.name||contentProg.toUpperCase()}</div>
            <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:4}}>
              {QUARTERLY_WORKSHOPS[contentProg]?(<>{activeQW?.name||"No workshop selected"} - </>):""}{allItems.length} items - {progBatches.length} active batches
            </div>
          </div>
          {LOGOS[contentProg]&&<img src={LOGOS[contentProg]} alt="" style={{height:contentProg==="essentials"?56:52,objectFit:"contain",opacity:0.9}}/>}
        </div>
      </div>

      {/* Quarter switcher - not for LSE */}
      {QUARTERLY_WORKSHOPS[contentProg]&&(<div style={{...card,padding:isMobile?16:20,marginTop:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:FC,fontWeight:800,fontSize:14}}>CONTENT LIBRARY</div>
          <div style={{fontSize:11,color:"#888",fontFamily:FC}}>Active quarter highlighted</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.entries(QUARTERLY_WORKSHOPS[contentProg]).map(([qKey,qVal])=>{
            const isActive=(acfg.activeQuarter?.[contentProg]||"Q1")===qKey;
            return(<button key={qKey} onClick={()=>{const aq={...(acfg.activeQuarter||{}),  [contentProg]:qKey};saveAcfg("activeQuarter",aq);flash(`${qKey} activated for ${prog?.short||contentProg}`,true);}} style={{padding:"12px 14px",borderRadius:12,border:isActive?"2px solid #FFD300":"1px solid #e8e8e3",background:isActive?"#FFF8E0":"#fff",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:FC,fontWeight:900,fontSize:16,color:isActive?"#000":"#888"}}>{qKey}</span>
                {isActive&&<span style={{fontSize:9,fontFamily:FC,fontWeight:800,color:"#007A33",background:"#f0f8f0",padding:"4px 8px 3px",borderRadius:6,lineHeight:1}}>ACTIVE</span>}
              </div>
              <div style={{fontSize:12,fontFamily:FC,fontWeight:600,color:isActive?"#555":"#bbb",marginTop:4}}>{qVal.name}</div>
            </button>);
          })}
        </div>
        <div style={{fontSize:11,color:"#999",fontFamily:FB,marginTop:10,lineHeight:1.5}}>Switching quarters changes which challenges participants see. Existing submissions are preserved. Build challenges for each quarter in the challenge editor below.</div>
      </div>)}

      {/* Content items */}
      <div style={{marginTop:8}}>
        {allItems.length===0&&<div style={{...card,textAlign:"center",padding:40,color:"#999",fontFamily:FC}}>No content for this program yet</div>}
        {allItems.map((item,idx)=>{
          const isOpen=contentSection===item.id;
          const isDone=item.kind==="challenge"&&co.some(c=>c.challengeId===item.id);
          const chIdx=item.kind==="challenge"?progChallenges.findIndex(c=>c.id===item.id):-1;
          return(
          <div key={item.id} style={{...card,padding:0,overflow:"hidden",marginBottom:12,border:isOpen?"2px solid #FFD300":"none"}}>
            {/* Item header */}
            <div onClick={()=>setContentSection(isOpen?null:item.id)} style={{display:"flex",alignItems:"center",padding:isMobile?"14px 16px":"18px 24px",cursor:"pointer",gap:14}}>
              <div style={{width:36,height:36,borderRadius:10,background:item.kind==="activity"?"#FFD300":"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {item.kind==="activity"?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                :<span style={{fontFamily:FC,fontWeight:900,fontSize:14,color:"#FFD300"}}>{item.week}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:FC,fontWeight:800,fontSize:15,letterSpacing:0.3}}>{item.title}</div>
                <div style={{fontSize:13,color:"#999",fontFamily:FB,marginTop:1}}>{item.subtitle}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span style={{fontSize:11,fontFamily:FC,fontWeight:700,padding:"5px 10px 4px",borderRadius:8,lineHeight:1,background:item.kind==="activity"?"#FFF8E0":"#f5f5f0",color:item.kind==="activity"?"#B8860B":"#999"}}>{item.kind==="activity"?"ACTIVITY":"CHALLENGE"}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" style={{transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s"}}><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>

            {/* Expanded editor */}
            {isOpen&&(
              <div style={{padding:isMobile?"0 16px 16px":"0 24px 24px",borderTop:"1px solid #f0f0eb"}}>
                {/* Preview + basic fields */}
                <div style={{display:"flex",gap:8,marginTop:16,marginBottom:16}}>
                  <button onClick={()=>{if(item.kind==="activity")onPreviewActivity(item);else onPreviewChallenge(item);}} style={{...btnB,flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Preview
                  </button>
                </div>

                {/* Challenge fields */}
                {item.kind==="challenge"&&chIdx>=0&&(<div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                    <div><div style={subLabel}>TITLE</div><input value={item.title} onChange={e=>saveCh(contentProg,chIdx,"title",e.target.value)} style={inp}/></div>
                    <div><div style={subLabel}>SUBTITLE</div><input value={item.subtitle} onChange={e=>saveCh(contentProg,chIdx,"subtitle",e.target.value)} style={inp}/></div>
                  </div>
                  <div style={{marginBottom:12}}><div style={subLabel}>DESCRIPTION</div><textarea value={item.description} onChange={e=>saveCh(contentProg,chIdx,"description",e.target.value)} rows={3} style={{...inp,resize:"vertical"}}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>DELIVERABLE</div><input value={item.deliverable} onChange={e=>saveCh(contentProg,chIdx,"deliverable",e.target.value)} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>TIP</div><input value={item.tip} onChange={e=>saveCh(contentProg,chIdx,"tip",e.target.value)} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>BONUS CONDITION</div><input value={item.bonusCondition} onChange={e=>saveCh(contentProg,chIdx,"bonusCondition",e.target.value)} style={inp}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
                    <div><div style={subLabel}>POINTS</div><input type="number" value={item.points} onChange={e=>saveCh(contentProg,chIdx,"points",parseInt(e.target.value)||0)} style={{...inp,textAlign:"center"}}/></div>
                    <div><div style={subLabel}>BONUS PTS</div><input type="number" value={item.bonusPoints} onChange={e=>saveCh(contentProg,chIdx,"bonusPoints",parseInt(e.target.value)||0)} style={{...inp,textAlign:"center"}}/></div>
                    <div><div style={subLabel}>ICON</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {(()=>{const ri=resolveChIcon(item);return ri?<div style={{width:36,height:36,borderRadius:8,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>{typeof ri==="string"?<img src={ri} alt="" style={{width:24,height:24,objectFit:"contain"}}/>:ri}</div>:null;})()}
                        <button onClick={()=>{setIconPickerCurrent(item.icon||"");setIconPickerCb(()=>v=>saveCh(contentProg,chIdx,"icon",v));}} style={{...btnG,flex:1,fontSize:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:6}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                          {item.icon&&item.icon!=="none"?(ICON_LIBRARY_DEFS[item.icon]?.label||item.icon.replace(/_/g," ").toUpperCase()):"CHOOSE ICON"}
                        </button>
                        <label style={{padding:"6px 12px",borderRadius:8,background:"#f5f5f0",border:"1px solid #e0e0db",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                          UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,64/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);saveCh(contentProg,chIdx,"icon",c.toDataURL("image/png"));};img.src=URL.createObjectURL(f);}}/>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Hazard Hunt specific */}
                  {item.type==="hazard_hunt"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Hazard Hunt Settings</div>

                    {/* 360 Image Upload */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:8}}>360 Kitchen Image</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <input value={acfg.hazard_hunt?.image||"/360-prep.jpg"} onChange={e=>saveAcfg("hazard_hunt",{image:e.target.value})} placeholder="/360-image.jpg" style={{...inp,flex:1,fontSize:12,padding:"8px 12px"}}/>
                        <label style={{...btnY,padding:"8px 14px",fontSize:11,display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                          UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const file=e.target.files[0];if(!file)return;saveAcfg("hazard_hunt",{image:URL.createObjectURL(file)});flash("Image set",true);}}/></label>
                      </div>
                    </div>

                    {/* Timer & Gameplay */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Timer</div>
                      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                        <div style={{flex:1}}><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Hunt duration</div><div style={{display:"flex",alignItems:"center",gap:6}}><input type="number" value={acfg.hazard_hunt?.timerDuration||90} onChange={e=>saveAcfg("hazard_hunt",{timerDuration:parseInt(e.target.value)||90})} style={{...inp,width:70,textAlign:"center",padding:"8px"}}/><span style={{fontSize:12,color:"#999"}}>seconds</span></div></div>
                        <div style={{flex:1}}><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Speed bonus if all found within</div><div style={{display:"flex",alignItems:"center",gap:6}}><input type="number" value={acfg.hazard_hunt?.speedThreshold||60} onChange={e=>saveAcfg("hazard_hunt",{speedThreshold:parseInt(e.target.value)||60})} style={{...inp,width:70,textAlign:"center",padding:"8px"}}/><span style={{fontSize:12,color:"#999"}}>seconds</span></div></div>
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Points</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Per hazard found</div><input type="number" value={acfg.hazard_hunt?.ptsPerHazard||20} onChange={e=>saveAcfg("hazard_hunt",{ptsPerHazard:parseInt(e.target.value)||20})} style={{...inp,textAlign:"center",padding:"8px"}}/></div>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Speed bonus</div><input type="number" value={acfg.hazard_hunt?.speedBonusPts||20} onChange={e=>saveAcfg("hazard_hunt",{speedBonusPts:parseInt(e.target.value)||20})} style={{...inp,textAlign:"center",padding:"8px"}}/></div>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Decoy avoided bonus</div><input type="number" value={acfg.hazard_hunt?.decoyAvoidPts||10} onChange={e=>saveAcfg("hazard_hunt",{decoyAvoidPts:parseInt(e.target.value)||10})} style={{...inp,textAlign:"center",padding:"8px"}}/></div>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Text response bonus</div><input type="number" value={acfg.hazard_hunt?.textResponsePts||20} onChange={e=>saveAcfg("hazard_hunt",{textResponsePts:parseInt(e.target.value)||20})} style={{...inp,textAlign:"center",padding:"8px"}}/></div>
                      </div>
                      <div style={{marginTop:8}}><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Decoy tap penalty</div><input type="number" value={acfg.hazard_hunt?.decoyPenalty||10} onChange={e=>saveAcfg("hazard_hunt",{decoyPenalty:parseInt(e.target.value)||10})} style={{...inp,width:80,textAlign:"center",padding:"8px"}}/></div>
                    </div>

                    {/* Hotspot Visibility */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:8}}>Hotspot Visibility</div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,color:"#888"}}>Hidden</span>
                        <input type="range" min="0" max="1" step="0.1" value={acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1} onChange={e=>saveAcfg("hazard_hunt",{hotspotOpacity:parseFloat(e.target.value)})} style={{flex:1,accentColor:"#FFD300"}}/>
                        <span style={{fontSize:11,color:"#888"}}>Visible</span>
                        <span style={{fontFamily:FC,fontWeight:800,fontSize:13,minWidth:36,textAlign:"right"}}>{Math.round((acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1)*100)}%</span>
                      </div>
                    </div>

                    {/* Open Text Question */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:8}}>Post-Hunt Question</div>
                      <input value={acfg.hazard_hunt?.openQuestion||"What's the first thing you'd say to your crew about what you just saw?"} onChange={e=>saveAcfg("hazard_hunt",{openQuestion:e.target.value})} style={inp}/>
                    </div>
                    {/* Hotspot editor */}
                    <div style={{marginBottom:8}}>
                      {hotspotEditor?(<div>
                        <div style={{position:"relative",height:220,borderRadius:12,overflow:"hidden",marginBottom:8}} ref={editorViewRef}>
                          <PanoViewer imgSrc={acfg.hazard_hunt?.image||HAZARD_IMG} onYawPitch={(y,p)=>setEditorYP({yaw:y,pitch:p})}/>
                          {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{const vw=editorViewRef.current?.clientWidth||400;const vh=220;const proj=projectToScreen(z.yaw,z.pitch,editorYP.yaw,editorYP.pitch,vw,vh);if(!proj)return null;const sz=14*proj.scale;const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};return <div key={z.id} style={{position:"absolute",left:proj.x-sz/2,top:proj.y-sz/2,width:sz,height:sz,borderRadius:"50%",background:fb2.hazard?"#007A33":"#E3000B",border:"2px solid #fff",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:900}}>{zi+1}</div>;})}
                          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:6,pointerEvents:"none",width:18,height:18,border:"2px solid #FFD300",borderRadius:"50%"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>addHotspot(editorYP.yaw,editorYP.pitch)} style={{...btnY,flex:1,fontSize:12,padding:"10px"}}>Drop Hotspot</button>
                          <button onClick={()=>setHotspotEditor(false)} style={{...btnG,fontSize:12,padding:"10px"}}>Close</button>
                        </div>
                      </div>):(<div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setHotspotEditor(true)} style={{...btnB,flex:1,fontSize:12}}>Open Hotspot Editor</button>
                        <button onClick={()=>{saveAcfg("hazard_hunt",{zones:[...HAZARD_ZONES],feedback:{...HAZARD_FEEDBACK}});flash("Reset to 7 default hotspots",true);}} style={{...btnG,fontSize:12}}>Reset Defaults</button>
                      </div>)}
                    </div>
                    {/* Hotspot list */}
                    <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginTop:12,marginBottom:6}}>HOTSPOTS ({(acfg.hazard_hunt?.zones||HAZARD_ZONES).length})</div>
                    {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};return(
                      <div key={z.id} style={{background:"#fff",borderRadius:12,padding:12,marginBottom:8,border:`2px solid ${fb2.hazard?"#007A33":"#E3000B"}`}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:12,background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{zi+1}</span>
                          <input value={fb2.title||""} onChange={e=>updateHotspotFb(z.id,"title",e.target.value)} style={{...inp,flex:1,fontSize:13,fontWeight:700,padding:"6px 10px"}} placeholder="Hazard title"/>
                          <button onClick={()=>updateHotspotFb(z.id,"hazard",!fb2.hazard)} style={{padding:"5px 10px 4px",borderRadius:8,border:"none",background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",fontSize:10,fontFamily:FC,fontWeight:700,cursor:"pointer",flexShrink:0,lineHeight:1}}>{fb2.hazard?"HAZARD":"DECOY"}</button>
                          <button onClick={()=>removeHotspot(z.id)} style={{padding:"5px 8px",borderRadius:8,border:"none",background:"#f0f0eb",color:"#E3000B",fontSize:11,cursor:"pointer",flexShrink:0}}>X</button>
                        </div>
                        <textarea value={fb2.desc||""} onChange={e=>updateHotspotFb(z.id,"desc",e.target.value)} rows={2} placeholder="Description shown in popup when tapped (e.g. 'Cross-contamination risk. Chemicals must be stored away from food prep areas.')" style={{...inp,fontSize:12,padding:"8px 10px",resize:"vertical",width:"100%",boxSizing:"border-box",color:"#555"}}/>
                      </div>
                    );})}
                  </div>)}

                  {/* Shift in Chaos specific */}
                  {item.type==="shift_in_chaos"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Shift in Chaos Settings</div>

                    {/* Scoring */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Scoring</div>
                      <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10,lineHeight:1.5}}>Points are awarded based on how close the ranking is to the expert order. Accuracy = percentage match. Points = base points x accuracy.</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Bonus threshold</div><div style={{display:"flex",alignItems:"center",gap:6}}><input type="number" value={acfg.shift_in_chaos?.bonusThreshold||80} onChange={e=>saveAcfg("shift_in_chaos",{bonusThreshold:parseInt(e.target.value)||80})} style={{...inp,width:60,textAlign:"center",padding:"8px"}}/><span style={{fontSize:12,color:"#999"}}>% accuracy</span></div></div>
                        <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Top batch bonus</div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:"#999"}}>Top</span><input type="number" value={acfg.shift_in_chaos?.topN||3} onChange={e=>saveAcfg("shift_in_chaos",{topN:parseInt(e.target.value)||3})} style={{...inp,width:50,textAlign:"center",padding:"8px"}}/><span style={{fontSize:12,color:"#999"}}>in batch</span></div></div>
                      </div>
                      <div style={{marginTop:10,padding:"10px 12px",background:"#f8f8f5",borderRadius:8,fontSize:12,color:"#666",fontFamily:FB}}>
                        <strong>Example:</strong> 100 base pts, 75% accuracy = 75 pts earned. Bonus ({acfg.shift_in_chaos?.bonusThreshold||80}%+ or top {acfg.shift_in_chaos?.topN||3}) = +{item?.bonusPoints||50} pts.
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Content</div>
                      <div style={{marginBottom:10}}><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Scene briefing</div><textarea value={acfg.shift_in_chaos?.briefing||"It's 12:05pm. Saturday. GYG is slammed. Everything below just happened in the last 10 minutes. Rank them 1-12 in order of what you deal with FIRST."} onChange={e=>saveAcfg("shift_in_chaos",{briefing:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                      <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Prevention question</div><textarea value={acfg.shift_in_chaos?.preventionQ||"What's one thing that would have prevented this shift from getting to this point?"} onChange={e=>saveAcfg("shift_in_chaos",{preventionQ:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                    </div>

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={subLabel}>PROBLEMS (expert order) - {(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).length} items</div>
                      <button onClick={()=>{const probs=[...(acfg.shift_in_chaos?.problems||[...CHAOS_PROBLEMS])];probs.push({id:`cp${Date.now()}`,text:"New problem description",category:"operational"});saveAcfg("shift_in_chaos",{problems:probs});}} style={{padding:"7px 14px 6px",borderRadius:8,lineHeight:1,border:"none",background:"#FFD300",color:"#000",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>+ ADD</button>
                    </div>
                    {(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).map((p,pi)=>(
                      <div key={p.id||pi} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderTop:pi>0?"1px solid #e8e8e3":"none"}}>
                        <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#1a1a1a",color:"#FFD300",width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:8}}>{pi+1}</span>
                        <textarea value={p.text} onChange={e=>updateChaosProb(pi,"text",e.target.value)} rows={2} style={{...inp,flex:1,resize:"vertical",fontSize:13,padding:"8px 12px"}}/>
                        <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0,marginTop:6}}>
                          {["safety","operational","cosmetic"].map(cat=>(<button key={cat} onClick={()=>updateChaosProb(pi,"category",cat)} style={{padding:"4px 8px 3px",borderRadius:6,lineHeight:1,border:"none",background:p.category===cat?(cat==="safety"?"#E3000B":cat==="operational"?"#FFD300":"#999"):"transparent",color:p.category===cat?"#fff":"#ccc",fontSize:9,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>{cat.slice(0,3).toUpperCase()}</button>))}
                          <button onClick={()=>{const probs=[...(acfg.shift_in_chaos?.problems||[...CHAOS_PROBLEMS])];probs.splice(pi,1);saveAcfg("shift_in_chaos",{problems:probs});}} style={{padding:"4px 8px 3px",borderRadius:6,lineHeight:1,border:"none",background:"transparent",color:"#E3000B",fontSize:9,fontFamily:FC,fontWeight:700,cursor:"pointer",marginTop:2}}>DEL</button>
                        </div>
                      </div>
                    ))}
                  </div>)}
                </div>)}

                  {/* Spot the Moment specific */}
                  {item.type==="spot_the_moment"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Spot the Moment Settings</div>

                    {/* Scoring */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Bonus</div>
                      <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10,lineHeight:1.5}}>When this % of batch swipes "come back" on a participant's photos, they earn bonus points.</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{fontSize:11,color:"#888",fontFamily:FC}}>Approval threshold</div>
                        <input type="number" value={acfg.spot_the_moment?.bonusThreshold||60} onChange={e=>saveAcfg("spot_the_moment",{bonusThreshold:parseInt(e.target.value)||60})} style={{...inp,width:60,textAlign:"center",padding:"8px"}}/>
                        <span style={{fontSize:12,color:"#999"}}>%</span>
                      </div>
                    </div>

                    {/* Swipe words */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Swipe Words</div>
                      <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10}}>After each swipe, participants pick one word to describe the photo.</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {(acfg.spot_the_moment?.words||SWIPE_WORDS).map((w,wi)=>(
                          <div key={wi} style={{display:"flex",alignItems:"center",gap:4,background:"#f8f8f5",borderRadius:8,padding:"4px 8px"}}>
                            <input value={w} onChange={e=>{const ws=[...(acfg.spot_the_moment?.words||[...SWIPE_WORDS])];ws[wi]=e.target.value;saveAcfg("spot_the_moment",{words:ws});}} style={{...inp,width:80,fontSize:12,padding:"4px 6px",border:"none",background:"transparent"}}/>
                            <button onClick={()=>{const ws=[...(acfg.spot_the_moment?.words||[...SWIPE_WORDS])];ws.splice(wi,1);saveAcfg("spot_the_moment",{words:ws});}} style={{background:"none",border:"none",color:"#E3000B",cursor:"pointer",fontSize:11,padding:0}}>x</button>
                          </div>
                        ))}
                        <button onClick={()=>{const ws=[...(acfg.spot_the_moment?.words||[...SWIPE_WORDS]),"new"];saveAcfg("spot_the_moment",{words:ws});}} style={{padding:"4px 12px",borderRadius:8,border:"1px dashed #ccc",background:"transparent",fontSize:11,fontFamily:FC,cursor:"pointer",color:"#888"}}>+ ADD</button>
                      </div>
                    </div>

                    {/* Seed photos */}
                    <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div><div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a"}}>Seed Photos</div><div style={{fontSize:11,color:"#888",fontFamily:FB}}>Pre-loaded photos for first participants to swipe</div></div>
                        <label style={{padding:"7px 14px 6px",borderRadius:8,lineHeight:1,border:"none",background:"#FFD300",color:"#000",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>
                          + UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,600/img.width);c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);const b64=c.toDataURL("image/jpeg",0.7);const seeds=[...(acfg.spot_the_moment?.seedPhotos||[...DEFAULT_SEED_PHOTOS])];seeds.push({id:`sp${Date.now()}`,url:b64,caption:"Uploaded photo"});saveAcfg("spot_the_moment",{seedPhotos:seeds});};img.src=URL.createObjectURL(f);}}/>
                        </label>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                        {(acfg.spot_the_moment?.seedPhotos||DEFAULT_SEED_PHOTOS).map((sp,si)=>(
                          <div key={sp.id||si} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1"}}>
                            <img src={sp.url||sp.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} crossOrigin="anonymous" onError={e=>{e.target.style.background="#ddd";e.target.alt="Failed to load";}}/>
                            <button onClick={()=>{const seeds=[...(acfg.spot_the_moment?.seedPhotos||[...DEFAULT_SEED_PHOTOS])];seeds.splice(si,1);saveAcfg("spot_the_moment",{seedPhotos:seeds});}} style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:10,background:"#E3000B",color:"#fff",border:"none",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
                            <input value={sp.caption||""} onChange={e=>{const seeds=[...(acfg.spot_the_moment?.seedPhotos||[...DEFAULT_SEED_PHOTOS])];seeds[si]={...seeds[si],caption:e.target.value};saveAcfg("spot_the_moment",{seedPhotos:seeds});}} placeholder="Caption" style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.7)",color:"#fff",border:"none",padding:"4px 6px",fontSize:10,fontFamily:FB}}/>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shot list */}
                    <div style={{background:"#fff",borderRadius:12,padding:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a"}}>Shot Prompts</div>
                        <button onClick={()=>{const sl=[...(acfg.spot_the_moment?.shotList||[...SHOT_LIST])];sl.push({day:sl.length+1,prompt:"New photo prompt"});saveAcfg("spot_the_moment",{shotList:sl});}} style={{padding:"4px 12px",borderRadius:8,border:"none",background:"#FFD300",color:"#000",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>+ ADD</button>
                      </div>
                      {(acfg.spot_the_moment?.shotList||SHOT_LIST).map((shot,si)=>(
                        <div key={si} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#1a1a1a",color:"#FFD300",width:22,height:22,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{si+1}</span>
                          <input value={shot.prompt} onChange={e=>{const sl=[...(acfg.spot_the_moment?.shotList||[...SHOT_LIST])];sl[si]={...sl[si],prompt:e.target.value};saveAcfg("spot_the_moment",{shotList:sl});}} style={{...inp,flex:1,fontSize:12,padding:"6px 10px"}}/>
                          <button onClick={()=>{const sl=[...(acfg.spot_the_moment?.shotList||[...SHOT_LIST])];sl.splice(si,1);saveAcfg("spot_the_moment",{shotList:sl});}} style={{background:"none",border:"none",color:"#E3000B",cursor:"pointer",fontSize:11,padding:"4px",flexShrink:0}}>x</button>
                        </div>
                      ))}
                    </div>
                  </div>)}

                  {/* Guest Dollar Trail */}
                  {item.type==="guest_dollar_trail"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Guest Dollar Trail Settings</div>
                    <div style={subLabel}>MOMENTS ({(acfg.guest_dollar_trail?.moments||GDT_MOMENTS).length})</div>
                    {(acfg.guest_dollar_trail?.moments||GDT_MOMENTS).map((m,mi)=>(<div key={mi} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:6}}>
                      <div style={{fontFamily:FC,fontWeight:800,fontSize:13,marginBottom:4}}>{m.title}</div>
                      <div style={{fontSize:11,color:"#888",fontFamily:FB}}>{m.scene}</div>
                      <div style={{display:"flex",gap:6,marginTop:4}}>
                        <span style={{fontSize:10,fontFamily:FC,color:"#007A33"}}>Right: +${m.optB.counterChange}</span>
                        <span style={{fontSize:10,fontFamily:FC,color:"#E3000B"}}>Wrong: ${m.optA.counterChange}</span>
                      </div>
                    </div>))}
                  </div>)}
                  {/* Triage Call */}
                  {item.type==="triage_call"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Triage Call Settings</div>
                    <div style={{marginBottom:12}}><div style={subLabel}>TIME LIMIT</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.triage_call?.timeLimit||10} onChange={e=>saveAcfg("triage_call",{timeLimit:parseInt(e.target.value)||10})} style={{...inp,width:60,textAlign:"center"}}/><span style={{fontSize:11,color:"#999"}}>sec</span></div></div>
                    <div style={subLabel}>CALLS ({(acfg.triage_call?.calls||TRIAGE_CALLS).length})</div>
                    {(acfg.triage_call?.calls||TRIAGE_CALLS).map((c2,ci)=>(<div key={ci} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:4}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                        <input value={c2.arm} onChange={e=>{const cl=[...(acfg.triage_call?.calls||[...TRIAGE_CALLS])];cl[ci]={...cl[ci],arm:e.target.value};saveAcfg("triage_call",{calls:cl});}} style={{...inp,width:70,fontWeight:700,fontSize:12,padding:"4px 6px"}}/>
                        <input value={c2.restaurant} onChange={e=>{const cl=[...(acfg.triage_call?.calls||[...TRIAGE_CALLS])];cl[ci]={...cl[ci],restaurant:e.target.value};saveAcfg("triage_call",{calls:cl});}} style={{...inp,flex:1,fontSize:12,padding:"4px 6px"}}/>
                        <select value={c2.correct} onChange={e=>{const cl=[...(acfg.triage_call?.calls||[...TRIAGE_CALLS])];cl[ci]={...cl[ci],correct:e.target.value};saveAcfg("triage_call",{calls:cl});}} style={{...inp,width:65,fontSize:10,padding:"4px"}}><option value="act">Act</option><option value="hold">Hold</option></select>
                      </div>
                      <textarea value={c2.situation} onChange={e=>{const cl=[...(acfg.triage_call?.calls||[...TRIAGE_CALLS])];cl[ci]={...cl[ci],situation:e.target.value};saveAcfg("triage_call",{calls:cl});}} rows={2} style={{...inp,resize:"vertical",fontSize:11,padding:"4px 8px"}}/>
                    </div>))}
                  </div>)}
                  {/* RM Brief */}
                  {item.type==="rm_brief"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>RM Brief Settings</div>
                    {[["FOCUS OPTIONS",acfg.rm_brief?.focus||RMB_FOCUS,"focus"],[" DATA OPTIONS",acfg.rm_brief?.data||RMB_DATA,"data"],["CTA OPTIONS",acfg.rm_brief?.cta||RMB_CTA,"cta"]].map(([label,opts,key])=>(<div key={key} style={{marginBottom:12}}>
                      <div style={subLabel}>{label}</div>
                      {opts.map((o,oi)=>(<div key={oi} style={{display:"flex",gap:4,alignItems:"center",marginBottom:2}}>
                        <span style={{width:8,height:8,borderRadius:4,background:o.correct?"#007A33":"#E3000B",flexShrink:0}}/>
                        <input value={o.text} onChange={e=>{const arr=[...opts];arr[oi]={...arr[oi],text:e.target.value};saveAcfg("rm_brief",{[key]:arr});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                      </div>))}
                    </div>))}
                  </div>)}
                  {/* Numbers Don't Lie */}
                  {item.type==="numbers_dont_lie"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Numbers Don't Lie Settings</div>
                    <div style={subLabel}>ROUNDS ({(acfg.numbers_dont_lie?.rounds||NDL_ROUNDS).length})</div>
                    {(acfg.numbers_dont_lie?.rounds||NDL_ROUNDS).map((r,ri)=>(<div key={ri} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:6}}>
                      <div style={{fontFamily:FC,fontWeight:800,fontSize:13,marginBottom:4}}>{r.restaurant}{r.subtitle?` (${r.subtitle})`:""}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {Object.entries(r.pl).filter(([k])=>!k.includes("Target")).map(([k,v])=>(<span key={k} style={{fontSize:10,fontFamily:FC,color:"#888"}}>{k}: {v}</span>))}
                      </div>
                      <div style={{fontSize:10,color:"#007A33",fontFamily:FC,marginTop:4}}>3 taps per round. Max 8 pts.</div>
                    </div>))}
                  </div>)}
                  {/* Shift Call */}
                  {item.type==="shift_call"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Shift Call Settings</div>
                    <div style={{marginBottom:14}}><div style={subLabel}>TIME LIMIT PER SCENARIO</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.shift_call?.timeLimit||10} onChange={e=>saveAcfg("shift_call",{timeLimit:parseInt(e.target.value)||10})} style={{...inp,width:60,textAlign:"center"}}/><span style={{fontSize:11,color:"#999"}}>seconds</span></div></div>
                    <div style={subLabel}>SCENARIOS ({(acfg.shift_call?.scenarios||SHIFT_SCENARIOS).length})</div>
                    {(acfg.shift_call?.scenarios||SHIFT_SCENARIOS).map((sc,si)=>(
                      <div key={si} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:6}}>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={sc.day} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],day:e.target.value};saveAcfg("shift_call",{scenarios:s});}} style={{...inp,width:80,fontSize:12,padding:"4px 8px"}} placeholder="Day"/>
                          <input value={sc.time} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],time:e.target.value};saveAcfg("shift_call",{scenarios:s});}} style={{...inp,width:60,fontSize:12,padding:"4px 8px"}} placeholder="Time"/>
                          <select value={sc.correct} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],correct:e.target.value};saveAcfg("shift_call",{scenarios:s});}} style={{...inp,width:70,fontSize:11,padding:"4px"}}><option value="react">React</option><option value="hold">Hold</option></select>
                        </div>
                        <textarea value={sc.situation} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],situation:e.target.value};saveAcfg("shift_call",{scenarios:s});}} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontFamily:FC}}>Cost/day:</span><input type="number" value={sc.costDaily} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],costDaily:parseInt(e.target.value)||0};saveAcfg("shift_call",{scenarios:s});}} style={{...inp,width:60,fontSize:11,padding:"4px 6px",textAlign:"center"}}/></div>
                          <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#888",fontFamily:FC}}>Cost/yr:</span><input type="number" value={sc.costAnnual} onChange={e=>{const s=[...(acfg.shift_call?.scenarios||[...SHIFT_SCENARIOS])];s[si]={...s[si],costAnnual:parseInt(e.target.value)||0};saveAcfg("shift_call",{scenarios:s});}} style={{...inp,width:80,fontSize:11,padding:"4px 6px",textAlign:"center"}}/></div>
                        </div>
                      </div>
                    ))}
                  </div>)}

                  {/* Make the Call */}
                  {item.type==="make_the_call"&&(()=>{const mtcCrew=acfg.make_the_call?.crew||MTC_CREW;const mtcDecs=acfg.make_the_call?.decisions||MTC_DECISIONS;return(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Make the Call Settings</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:12}}>6 roster decisions with dual AHR + SPLH tracking.</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Starting AHR</div><input type="number" step="0.01" value={acfg.make_the_call?.startAHR||39.20} onChange={e=>saveAcfg("make_the_call",{startAHR:parseFloat(e.target.value)||39.20})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>AHR Target</div><input type="number" step="0.01" value={acfg.make_the_call?.targetAHR||37.10} onChange={e=>saveAcfg("make_the_call",{targetAHR:parseFloat(e.target.value)||37.10})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Total Hours</div><input type="number" value={acfg.make_the_call?.totalHours||546} onChange={e=>saveAcfg("make_the_call",{totalHours:parseInt(e.target.value)||546})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Starting SPLH</div><input type="number" value={acfg.make_the_call?.startSPLH||122} onChange={e=>saveAcfg("make_the_call",{startSPLH:parseInt(e.target.value)||122})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>SPLH Low</div><input type="number" value={acfg.make_the_call?.splhLow||115} onChange={e=>saveAcfg("make_the_call",{splhLow:parseInt(e.target.value)||115})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                      <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>SPLH High</div><input type="number" value={acfg.make_the_call?.splhHigh||125} onChange={e=>saveAcfg("make_the_call",{splhHigh:parseInt(e.target.value)||125})} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                    </div>
                    <div style={subLabel}>CREW ({mtcCrew.length})</div>
                    {mtcCrew.map((c,ci)=>(
                      <div key={ci} style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,background:"#fff",borderRadius:8,padding:"6px 10px"}}>
                        <input value={c.name} onChange={e=>{const cr=[...mtcCrew];cr[ci]={...cr[ci],name:e.target.value};saveAcfg("make_the_call",{crew:cr});}} style={{...inp,width:65,fontWeight:700,fontSize:12,padding:"4px 6px"}}/>
                        <span style={{fontSize:10,color:"#888",fontFamily:FC}}>{c.classification}</span>
                        <span style={{fontSize:10,color:"#888"}}>${c.rate}</span>
                        <span style={{fontSize:10,color:"#888"}}>{c.baseHours}hrs</span>
                        <span style={{fontSize:9,fontFamily:FC,fontWeight:700,color:c.status==="Available"?"#007A33":c.status.includes("limit")?"#E3000B":"#FFB800"}}>{c.status}</span>
                      </div>
                    ))}
                    <div style={{...subLabel,marginTop:12}}>DECISIONS ({mtcDecs.length})</div>
                    {mtcDecs.map((dec,di)=>(
                      <div key={di} style={{background:"#fff",borderRadius:8,padding:10,marginBottom:4}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:18,height:18,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{di+1}</span>
                          <span style={{fontFamily:FC,fontWeight:700,fontSize:12}}>{dec.day} {dec.time}</span>
                          <span style={{fontSize:9,fontFamily:FC,fontWeight:700,padding:"2px 6px",borderRadius:4,background:dec.type==="send_home"?"#f0f8f0":dec.type==="react_up"?"#fef0f0":"#FFF8E0",color:dec.type==="send_home"?"#007A33":dec.type==="react_up"?"#E3000B":"#B8860B"}}>{dec.type.replace(/_/g," ").toUpperCase()}</span>
                          {(dec.labels||[]).map((l,li)=>(<span key={li} style={{fontSize:8,fontFamily:FC,fontWeight:700,color:"#FFB800"}}>{l}</span>))}
                        </div>
                        <div style={{fontSize:10,color:"#888",fontFamily:FB}}>A: {dec.optionA.label||mtcCrew.find(c=>c.id===dec.optionA.crewId)?.name||"Option A"} {dec.optionA.correct?"(correct)":""} | B: {dec.optionB.label||mtcCrew.find(c=>c.id===dec.optionB.crewId)?.name||"Option B"} {dec.optionB.correct?"(correct)":""}</div>
                      </div>
                    ))}
                  </div>);})()}

                  {/* Swap the Shift */}
                  {item.type==="swap_the_shift"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Swap the Shift Settings</div>
                    <div style={subLabel}>ROSTER ({(acfg.swap_the_shift?.roster||SWAP_ROSTER).length} crew)</div>
                    <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:8}}>Swappable crew have swap options. Non-swappable are locked.</div>
                    {(acfg.swap_the_shift?.roster||SWAP_ROSTER).map((c,ci)=>{const sw=(acfg.swap_the_shift?.swaps||SWAP_OPTIONS)[c.id];return(
                      <div key={ci} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:4}}>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <input value={c.name} onChange={e=>{const r=[...(acfg.swap_the_shift?.roster||[...SWAP_ROSTER])];r[ci]={...r[ci],name:e.target.value};saveAcfg("swap_the_shift",{roster:r});}} style={{...inp,width:70,fontWeight:700,fontSize:13,padding:"4px 8px"}}/>
                          <span style={{fontSize:11,color:"#888",fontFamily:FC}}>{c.classification}</span>
                          <span style={{fontSize:11,color:"#888",fontFamily:FC}}>${c.rate}/hr</span>
                          <span style={{fontSize:11,color:"#888",fontFamily:FC}}>{c.hours}hrs</span>
                          <span style={{fontSize:10,fontFamily:FC,fontWeight:700,color:c.swappable?"#FFD300":"#999",background:c.swappable?"#000":"#f0f0eb",padding:"2px 6px",borderRadius:4}}>{c.swappable?"SWAP":"FIXED"}</span>
                        </div>
                        {c.swappable&&sw&&<div style={{fontSize:11,color:"#007A33",fontFamily:FC,marginTop:4}}>→ {sw.newClassification} (${sw.newRate}) saves ${sw.annualSaving.toLocaleString()}/yr</div>}
                      </div>
                    );})}
                  </div>)}

                  {/* Bench Builder */}
                  {item.type==="bench_builder"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Bench Builder Settings</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:12}}>3 levels with crew pools, target AHR, and hours budgets. Crew rates are fixed from GYG commercial files.</div>
                    {(acfg.bench_builder?.levels||BENCH_LEVELS).map((lv,li)=>(
                      <div key={li} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8}}>
                        <div style={{fontFamily:FC,fontWeight:800,fontSize:13,marginBottom:8}}>{lv.name}</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                          <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Hours</div><input type="number" value={lv.totalHours} onChange={e=>{const l=[...(acfg.bench_builder?.levels||[...BENCH_LEVELS])];l[li]={...l[li],totalHours:parseInt(e.target.value)||0};saveAcfg("bench_builder",{levels:l});}} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                          <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Current AHR</div><input type="number" step="0.01" value={lv.currentAHR} onChange={e=>{const l=[...(acfg.bench_builder?.levels||[...BENCH_LEVELS])];l[li]={...l[li],currentAHR:parseFloat(e.target.value)||0};saveAcfg("bench_builder",{levels:l});}} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                          <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>Target AHR</div><input type="number" step="0.01" value={lv.targetAHR} onChange={e=>{const l=[...(acfg.bench_builder?.levels||[...BENCH_LEVELS])];l[li]={...l[li],targetAHR:parseFloat(e.target.value)||0};saveAcfg("bench_builder",{levels:l});}} style={{...inp,textAlign:"center",fontSize:12}}/></div>
                        </div>
                      </div>
                    ))}
                  </div>)}

                  {/* Perm or Pass */}
                  {item.type==="perm_or_pass"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Perm or Pass Settings</div>
                    <div style={subLabel}>PROFILES ({(acfg.perm_or_pass?.profiles||PERM_PROFILES).length})</div>
                    {(acfg.perm_or_pass?.profiles||PERM_PROFILES).map((pr,pi)=>(
                      <div key={pi} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8}}>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={pr.name} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],name:e.target.value};saveAcfg("perm_or_pass",{profiles:p});}} style={{...inp,width:80,fontWeight:700,fontSize:13,padding:"6px 10px"}} placeholder="Name"/>
                          <input type="number" value={pr.months} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],months:parseInt(e.target.value)||0};saveAcfg("perm_or_pass",{profiles:p});}} style={{...inp,width:50,fontSize:12,padding:"6px",textAlign:"center"}}/>
                          <span style={{fontSize:10,color:"#888",alignSelf:"center"}}>mths</span>
                          <input type="number" value={pr.avgHours} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],avgHours:parseInt(e.target.value)||0};saveAcfg("perm_or_pass",{profiles:p});}} style={{...inp,width:50,fontSize:12,padding:"6px",textAlign:"center"}}/>
                          <span style={{fontSize:10,color:"#888",alignSelf:"center"}}>hrs</span>
                        </div>
                        <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC}}>OBJECTION</div><textarea value={pr.objection} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],objection:e.target.value};saveAcfg("perm_or_pass",{profiles:p});}} rows={1} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/></div>
                        {pr.options.map((opt,oi)=>(
                          <div key={oi} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                            <span style={{width:8,height:8,borderRadius:4,background:opt.lands?"#007A33":"#E3000B",flexShrink:0}}/>
                            <input value={opt.text} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],options:[...p[pi].options]};p[pi].options[oi]={...opt,text:e.target.value};saveAcfg("perm_or_pass",{profiles:p});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                          </div>
                        ))}
                        <div style={{marginTop:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC}}>COACHING TIP</div><textarea value={pr.coachingTip} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],coachingTip:e.target.value};saveAcfg("perm_or_pass",{profiles:p});}} rows={2} style={{...inp,resize:"vertical",fontSize:11,padding:"4px 8px"}}/></div>
                        <div style={{marginTop:4}}><div style={{fontSize:10,color:"#888",fontFamily:FC}}>BUSINESS SAVING</div><input value={pr.businessSaving} onChange={e=>{const p=[...(acfg.perm_or_pass?.profiles||[...PERM_PROFILES])];p[pi]={...p[pi],businessSaving:e.target.value};saveAcfg("perm_or_pass",{profiles:p});}} style={{...inp,fontSize:11,padding:"4px 8px"}}/></div>
                      </div>
                    ))}
                  </div>)}

                  {/* Your Restaurant */}
                  {item.type==="your_restaurant"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Your Restaurant Settings</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB}}>Slider-based data entry. All benchmarks are from GYG commercial files.</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
                      <div><div style={subLabel}>NETWORK AHR TARGET</div><input type="number" step="0.01" value={acfg.your_restaurant?.networkTarget||37.10} onChange={e=>saveAcfg("your_restaurant",{networkTarget:parseFloat(e.target.value)||37.10})} style={{...inp,textAlign:"center"}}/></div>
                      <div><div style={subLabel}>PERM TARGET %</div><input type="number" value={acfg.your_restaurant?.permTarget||40} onChange={e=>saveAcfg("your_restaurant",{permTarget:parseInt(e.target.value)||40})} style={{...inp,textAlign:"center"}}/></div>
                    </div>
                  </div>)}

                  {/* 30-Second Sell */}
                  {item.type==="thirty_second_sell"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>30-Second Sell Settings</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                      <div><div style={subLabel}>DURATION</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.thirty_second_sell?.timer||30} onChange={e=>saveAcfg("thirty_second_sell",{timer:parseInt(e.target.value)||30})} style={{...inp,width:60,textAlign:"center"}}/><span style={{fontSize:11,color:"#999"}}>sec</span></div></div>
                      <div><div style={subLabel}>CAMERA</div><select value={acfg.thirty_second_sell?.camera||"user"} onChange={e=>saveAcfg("thirty_second_sell",{camera:e.target.value})} style={inp}><option value="user">Front</option><option value="environment">Back</option></select></div>
                      <div><div style={subLabel}>RESOLUTION</div><select value={acfg.thirty_second_sell?.resolution||360} onChange={e=>saveAcfg("thirty_second_sell",{resolution:parseInt(e.target.value)})} style={inp}><option value={240}>240p</option><option value={360}>360p</option><option value={480}>480p</option><option value={720}>720p</option></select></div>
                    </div>
                    <div style={subLabel}>MENU ITEMS ({(acfg.thirty_second_sell?.items||SELL_ITEMS).length})</div>
                    <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:8}}>Each item gets one recording. Add/remove/rename items.</div>
                    {(acfg.thirty_second_sell?.items||SELL_ITEMS).map((item2,ii)=>(
                      <div key={ii} style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                        <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{ii+1}</span>
                        <input value={item2.name} onChange={e=>{const items2=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS])];items2[ii]={...items2[ii],name:e.target.value};saveAcfg("thirty_second_sell",{items:items2});}} style={{...inp,flex:1,fontSize:13,padding:"6px 10px"}}/>
                        <button onClick={()=>{const items2=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS])];items2.splice(ii,1);saveAcfg("thirty_second_sell",{items:items2});}} style={{width:24,height:24,borderRadius:12,background:"#E3000B",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
                      </div>
                    ))}
                    <button onClick={()=>{const items2=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS]),{id:`item_${Date.now()}`,name:"New Item"}];saveAcfg("thirty_second_sell",{items:items2});}} style={{width:"100%",padding:"8px",background:"#fff",border:"1px dashed #ccc",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer",marginTop:4}}>+ ADD ITEM</button>
                  </div>)}

                  {/* Recovery Race */}
                  {item.type==="recovery_race"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Recovery Race Settings</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                      <div><div style={subLabel}>DECISION TIMER</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.recovery_race?.decisionTimer||8} onChange={e=>saveAcfg("recovery_race",{decisionTimer:parseInt(e.target.value)||8})} style={{...inp,width:60,textAlign:"center"}}/><span style={{fontSize:11,color:"#999"}}>sec</span></div></div>
                      <div><div style={subLabel}>BONUS THRESHOLD</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.recovery_race?.bonusThreshold||75} onChange={e=>saveAcfg("recovery_race",{bonusThreshold:parseInt(e.target.value)||75})} style={{...inp,width:60,textAlign:"center"}}/><span style={{fontSize:11,color:"#999"}}>%</span></div></div>
                    </div>
                    <div style={subLabel}>SCENARIOS ({(acfg.recovery_race?.scenarios||RECOVERY_SCENARIOS).length})</div>
                    {(acfg.recovery_race?.scenarios||RECOVERY_SCENARIOS).map((scen,si)=>(
                      <div key={scen.id||si} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{si+1}</span>
                          <input value={scen.title} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],title:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,flex:1,fontWeight:700,fontSize:13,padding:"6px 10px"}}/>
                        </div>
                        <textarea value={scen.setup} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],setup:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px",marginBottom:8}}/>
                        {scen.decisions.map((dec,di)=>(
                          <div key={di} style={{borderLeft:"3px solid #FFD300",paddingLeft:8,marginBottom:6}}>
                            <div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#999"}}>STEP {di+1}</div>
                            {dec.situation&&<input value={dec.situation} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],situation:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,fontSize:11,padding:"4px 8px",marginBottom:4}}/>}
                            {dec.options.map((opt,oi)=>(
                              <div key={oi} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                                <span style={{width:8,height:8,borderRadius:4,background:opt.outcome==="good"?"#007A33":opt.outcome==="neutral"?"#FFB800":"#E3000B",flexShrink:0}}/>
                                <input value={opt.text} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],options:[...s[si].decisions[di].options]};s[si].decisions[di].options[oi]={...opt,text:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                                <select value={opt.outcome} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],options:[...s[si].decisions[di].options]};s[si].decisions[di].options[oi]={...opt,outcome:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,width:65,fontSize:10,padding:"4px"}}><option value="good">Good</option><option value="neutral">Okay</option><option value="bad">Bad</option></select>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>)}

                  {/* Shift Leader Lens */}
                  {item.type==="shift_leader_lens"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                    <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Shift Leader Lens Settings</div>
                    <div style={subLabel}>SITUATIONS ({(acfg.shift_leader_lens?.clips||SLL_CLIPS).length})</div>
                    {(acfg.shift_leader_lens?.clips||SLL_CLIPS).map((clip,ci)=>(
                      <div key={clip.id||ci} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{ci+1}</span>
                          <input value={clip.title} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],title:e.target.value};saveAcfg("shift_leader_lens",{clips});}} style={{...inp,flex:1,fontWeight:700,fontSize:13,padding:"6px 10px"}}/>
                          <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips.splice(ci,1);saveAcfg("shift_leader_lens",{clips});}} style={{width:24,height:24,borderRadius:12,background:"#E3000B",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
                        </div>
                        <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:2}}>SCENARIO</div><textarea value={clip.desc} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],desc:e.target.value};saveAcfg("shift_leader_lens",{clips});}} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/></div>
                        <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:2}}>QUESTION</div><input value={clip.q} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],q:e.target.value};saveAcfg("shift_leader_lens",{clips});}} style={{...inp,fontSize:12,padding:"6px 10px"}}/></div>
                        <div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:4}}>OPTIONS</div>
                        {clip.options.map((opt,oi)=>(
                          <div key={oi} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                            <span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#999",width:16}}>{String.fromCharCode(65+oi)}</span>
                            <input value={opt} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:[...clips[ci].options]};clips[ci].options[oi]=e.target.value;saveAcfg("shift_leader_lens",{clips});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                            <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:clips[ci].options.filter((_,i)=>i!==oi)};saveAcfg("shift_leader_lens",{clips});}} style={{width:18,height:18,borderRadius:9,background:"#ddd",color:"#999",border:"none",fontSize:10,cursor:"pointer"}}>x</button>
                          </div>
                        ))}
                        <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:[...clips[ci].options,"New option"]};saveAcfg("shift_leader_lens",{clips});}} style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#007A33",background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}>+ ADD OPTION</button>
                      </div>
                    ))}
                    <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS]),{id:`c${Date.now()}`,title:"New Situation",desc:"Describe the scenario...",q:"What do you do?",options:["Option A","Option B","Option C","Option D"]}];saveAcfg("shift_leader_lens",{clips});}} style={{width:"100%",padding:"8px",background:"#fff",border:"1px dashed #ccc",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer",marginTop:4}}>+ ADD SITUATION</button>
                  </div>)}

                {/* Activity editors */}
                {item.kind==="activity"&&item.type==="huddle_builder"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Huddle Builder Settings</div>
                  <div style={subLabel}>FOCUS AREAS</div>
                  {Object.entries(acfg.huddle_builder?.focuses||HUDDLE_FOCUSES).map(([fKey,fVal])=>(
                    <div key={fKey} style={{background:"#fff",borderRadius:10,padding:12,marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <input value={fVal.label||fKey} onChange={e=>{const f={...(acfg.huddle_builder?.focuses||{...HUDDLE_FOCUSES})};f[fKey]={...f[fKey],label:e.target.value};saveAcfg("huddle_builder",{focuses:f});}} style={{...inp,fontWeight:700,fontSize:14,flex:1,padding:"8px 12px"}}/>
                      </div>
                      <div style={subLabel}>SUB-FOCUSES</div>
                      {(fVal.subs||[]).map((sub,si)=>(
                        <div key={sub.id||si} style={{display:"flex",gap:6,marginBottom:4}}>
                          <input value={sub.label} onChange={e=>{const f={...(acfg.huddle_builder?.focuses||{...HUDDLE_FOCUSES})};const subs=[...f[fKey].subs];subs[si]={...subs[si],label:e.target.value};f[fKey]={...f[fKey],subs};saveAcfg("huddle_builder",{focuses:f});}} style={{...inp,flex:1,fontSize:13,padding:"6px 10px"}}/>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={{...subLabel,marginTop:16}}>SCRIPT STEPS</div>
                  {(acfg.huddle_builder?.steps||HUDDLE_STEPS).map((step,si)=>(
                    <div key={si} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                      <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#FFD300",color:"#000",padding:"5px 8px 4px",borderRadius:6,lineHeight:1,flexShrink:0,minWidth:80,textAlign:"center"}}>{step.label}</span>
                      <input value={step.prefix} onChange={e=>{const steps=[...(acfg.huddle_builder?.steps||[...HUDDLE_STEPS])];steps[si]={...steps[si],prefix:e.target.value};saveAcfg("huddle_builder",{steps});}} placeholder="Prefix text" style={{...inp,flex:1,fontSize:13,padding:"6px 10px"}}/>
                    </div>
                  ))}
                </div>)}

                {item.kind==="activity"&&item.type==="coolroom_countdown"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Cool Room Countdown Settings</div>

                  {/* 360 Images */}
                  <div style={{marginBottom:16}}>
                    <div style={subLabel}>360 IMAGES</div>
                    {[["imgA","Image A - Before Blackout",COOLROOM_IMG_A],["imgB","Image B - After Blackout",COOLROOM_IMG_B]].map(([key,label,fallback])=>{
                      const currentImg=acfg.coolroom?.[key];
                      return(<div key={key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,background:"#fff",borderRadius:10,padding:10}}>
                        <div style={{width:80,height:56,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#222"}}>
                          {(currentImg||fallback)?<img src={currentImg||fallback} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#666",fontFamily:FC}}>NONE</div>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#555",marginBottom:6}}>{label}</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <label style={{...btnY,padding:"6px 12px",fontSize:11,display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                              UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const file=e.target.files[0];if(!file)return;const url=URL.createObjectURL(file);saveAcfg("coolroom",{[key]:url});flash("Image set - use public folder path for production",true);}}/></label>
                            <input value={currentImg||fallback} onChange={e=>saveAcfg("coolroom",{[key]:e.target.value})} placeholder="/360-image.jpg" style={{...inp,flex:1,fontSize:11,padding:"6px 10px"}}/>
                          </div>
                        </div>
                      </div>);
                    })}
                    <div style={{fontSize:11,color:"#999",fontFamily:FC}}>Enter a path like /360-fridge.jpg or upload. Per-batch overrides are in Batch Controls.</div>
                  </div>

                  {/* Game Settings */}
                  <div style={{marginBottom:16}}>
                    <div style={subLabel}>GAME SETTINGS</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>TIMER (SEC)</div><input type="number" value={acfg.coolroom?.timerDuration||120} onChange={e=>saveAcfg("coolroom",{timerDuration:parseInt(e.target.value)||120})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>COMPARE TIME (SEC)</div><input type="number" value={acfg.coolroom?.compareTime||60} onChange={e=>saveAcfg("coolroom",{compareTime:parseInt(e.target.value)||60})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>BLACKOUT AT (SEC LEFT)</div><input type="number" value={acfg.coolroom?.blackoutAt||60} onChange={e=>saveAcfg("coolroom",{blackoutAt:parseInt(e.target.value)||60})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>BLACKOUT DURATION (SEC)</div><input type="number" value={acfg.coolroom?.blackoutDur||3} onChange={e=>saveAcfg("coolroom",{blackoutDur:parseInt(e.target.value)||3})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>COUNT SHEET ROWS</div><input type="number" value={acfg.coolroom?.countRows||5} onChange={e=>saveAcfg("coolroom",{countRows:parseInt(e.target.value)||5})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                      <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5}}>TIMER WARN (SEC)</div><input type="number" value={acfg.coolroom?.timerWarn||30} onChange={e=>saveAcfg("coolroom",{timerWarn:parseInt(e.target.value)||30})} style={{...inp,textAlign:"center",marginTop:4}}/></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{marginBottom:12}}>
                    <div style={subLabel}>CONTENT</div>
                    <div style={{marginBottom:8}}><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5,marginBottom:4}}>BRIEFING TEXT</div><textarea value={acfg.coolroom?.briefing||"You have 2 minutes. Count everything you can see. Product name, quantity, unit. The clock doesn't wait."} onChange={e=>saveAcfg("coolroom",{briefing:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                    <div style={{marginBottom:8}}><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5,marginBottom:4}}>COMPARE PROMPT</div><input value={acfg.coolroom?.comparePrompt||"How many items did your partner count?"} onChange={e=>saveAcfg("coolroom",{comparePrompt:e.target.value})} style={inp}/></div>
                    <div style={{marginBottom:8}}><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5,marginBottom:4}}>REVEAL QUESTION</div><input value={acfg.coolroom?.revealQ||"Did you notice the change?"} onChange={e=>saveAcfg("coolroom",{revealQ:e.target.value})} style={inp}/></div>
                    <div><div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#aaa",letterSpacing:0.5,marginBottom:4}}>REFLECTION QUESTION</div><input value={acfg.coolroom?.reflectionQ||"What will you do differently next time you count stock?"} onChange={e=>saveAcfg("coolroom",{reflectionQ:e.target.value})} style={inp}/></div>
                  </div>
                </div>)}

                {item.kind==="activity"&&item.type==="roster_reality"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Roster Reality Settings</div>
                  <div style={{marginBottom:12}}><div style={subLabel}>RESTAURANT NAME</div><input value={acfg.roster?.restaurantName||"GYG Harrington Park"} onChange={e=>saveAcfg("roster",{restaurantName:e.target.value})} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 1 TITLE</div><input value={acfg.roster?.s1Title||"The Forecast Problem"} onChange={e=>saveAcfg("roster",{s1Title:e.target.value})} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 1 DESCRIPTION</div><textarea value={acfg.roster?.s1Desc||"Monday's forecast says 180 transactions. You've rostered for 220."} onChange={e=>saveAcfg("roster",{s1Desc:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 2 TITLE</div><input value={acfg.roster?.s2Title||"The AHR Problem"} onChange={e=>saveAcfg("roster",{s2Title:e.target.value})} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 2 DESCRIPTION</div><textarea value={acfg.roster?.s2Desc||"Your Average Hourly Rate is $39.20 vs the $37.10 benchmark."} onChange={e=>saveAcfg("roster",{s2Desc:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 3 TITLE</div><input value={acfg.roster?.s3Title||"The Mid-Shift Moment"} onChange={e=>saveAcfg("roster",{s3Title:e.target.value})} style={inp}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>SCENARIO 3 DESCRIPTION</div><textarea value={acfg.roster?.s3Desc||"Tuesday 2pm. Floor is quiet. 3 crew on. None are casuals."} onChange={e=>saveAcfg("roster",{s3Desc:e.target.value})} rows={2} style={{...inp,resize:"vertical"}}/></div>
                  <div style={{marginBottom:12}}><div style={subLabel}>FINAL REFLECTION QUESTION</div><input value={acfg.roster?.reflectionQ||"What's the one thing you'll do differently on your next roster?"} onChange={e=>saveAcfg("roster",{reflectionQ:e.target.value})} style={inp}/></div>
                </div>)}

                {item.kind==="activity"&&item.type==="self_assessment"&&(<div style={{background:"#f8f8f5",borderRadius:14,padding:16,marginBottom:12}}>
                  <div style={{fontFamily:FC,fontWeight:800,fontSize:14,marginBottom:14}}>Self Assessment Settings</div>

                  {/* Instruction text */}
                  <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                    <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:10}}>Instructions</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:8}}>These 4 instructions are shown before the assessment begins.</div>
                    {(acfg.self_assessment?.instructions||[
                      {bold:"Read each statement carefully.",desc:"Take your time to understand the specific statement."},
                      {bold:"Evaluate yourself.",desc:"Select the number that most reflects your behaviour (1: never, 2: sometimes, 3: always)."},
                      {bold:"Be Honest.",desc:"Evaluate yourself based on your experiences as a leader."},
                      {bold:"Be Open to Feedback.",desc:"Consider seeking input from peers, mentors, or supervisors."},
                    ]).map((inst,ii)=>(
                      <div key={ii} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                        <span style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#FFD300",background:"#000",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{ii+1}</span>
                        <div style={{flex:1}}>
                          <input value={inst.bold} onChange={e=>{const insts=[...(acfg.self_assessment?.instructions||[{bold:"Read each statement carefully.",desc:"Take your time to understand the specific statement."},{bold:"Evaluate yourself.",desc:"Select the number that most reflects your behaviour (1: never, 2: sometimes, 3: always)."},{bold:"Be Honest.",desc:"Evaluate yourself based on your experiences as a leader."},{bold:"Be Open to Feedback.",desc:"Consider seeking input from peers, mentors, or supervisors."}])];insts[ii]={...insts[ii],bold:e.target.value};saveAcfg("self_assessment",{instructions:insts});}} style={{...inp,fontWeight:700,fontSize:13,padding:"6px 10px",marginBottom:4}}/>
                          <input value={inst.desc} onChange={e=>{const insts=[...(acfg.self_assessment?.instructions||[{bold:"Read each statement carefully.",desc:"Take your time to understand the specific statement."},{bold:"Evaluate yourself.",desc:"Select the number that most reflects your behaviour (1: never, 2: sometimes, 3: always)."},{bold:"Be Honest.",desc:"Evaluate yourself based on your experiences as a leader."},{bold:"Be Open to Feedback.",desc:"Consider seeking input from peers, mentors, or supervisors."}])];insts[ii]={...insts[ii],desc:e.target.value};saveAcfg("self_assessment",{instructions:insts});}} style={{...inp,fontSize:12,padding:"6px 10px",color:"#666"}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Categories and statements */}
                  <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                    <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:6}}>Categories {"&"} Statements ({(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES).reduce((s,c)=>s+c.items.length,0)} total)</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10}}>Edit category titles and individual statement text. Statements are rated 1 (Never) to 3 (Always).</div>
                    {(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES).map((cat,ci)=>(
                      <div key={cat.id} style={{marginBottom:12,borderBottom:ci<(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES).length-1?"1px solid #f0f0eb":"none",paddingBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <input value={cat.title} onChange={e=>{const cats=JSON.parse(JSON.stringify(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES));cats[ci].title=e.target.value;saveAcfg("self_assessment",{categories:cats});}} style={{...inp,fontWeight:800,fontSize:13,flex:1,padding:"6px 10px"}}/>
                          <span style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",marginLeft:8,flexShrink:0}}>{cat.items.length} items</span>
                        </div>
                        {cat.items.map((item,ii)=>(
                          <div key={item.id} style={{display:"flex",gap:6,marginBottom:4,alignItems:"center"}}>
                            <span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#bbb",width:16,flexShrink:0}}>{ii+1}</span>
                            <input value={item.text} onChange={e=>{const cats=JSON.parse(JSON.stringify(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES));cats[ci].items[ii].text=e.target.value;saveAcfg("self_assessment",{categories:cats});}} style={{...inp,fontSize:12,padding:"5px 8px",flex:1}}/>
                            <button onClick={()=>{const cats=JSON.parse(JSON.stringify(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES));cats[ci].items.splice(ii,1);saveAcfg("self_assessment",{categories:cats});}} style={{background:"none",border:"none",color:"#E3000B",cursor:"pointer",fontSize:14,padding:"2px 6px",fontWeight:700}}>x</button>
                          </div>
                        ))}
                        <button onClick={()=>{const cats=JSON.parse(JSON.stringify(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES));cats[ci].items.push({id:`${cat.id}_${Date.now()}`,text:"New statement"});saveAcfg("self_assessment",{categories:cats});}} style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#007A33",background:"none",border:"none",cursor:"pointer",padding:"4px 0",letterSpacing:0.5}}>+ ADD STATEMENT</button>
                      </div>
                    ))}
                    <button onClick={()=>{const cats=JSON.parse(JSON.stringify(acfg.self_assessment?.categories||ASSESSMENT_CATEGORIES));cats.push({id:`cat_${Date.now()}`,title:"New Category",items:[{id:`item_${Date.now()}`,text:"New statement"}]});saveAcfg("self_assessment",{categories:cats});}} style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#FFD300",background:"#000",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",letterSpacing:0.5,marginTop:4}}>+ ADD CATEGORY</button>
                  </div>

                  {/* Score bands */}
                  <div style={{background:"#fff",borderRadius:12,padding:14,marginBottom:14}}>
                    <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:6}}>Score Bands</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10}}>Max score = statements x 3. Adjust band ranges and feedback text.</div>
                    {(acfg.self_assessment?.bands||SCORE_BANDS).map((b,bi)=>(
                      <div key={bi} style={{borderLeft:`4px solid ${b.color}`,padding:"10px 12px",marginBottom:8,background:"#f8f8f5",borderRadius:"0 10px 10px 0"}}>
                        <div style={{display:"flex",gap:8,marginBottom:6}}>
                          <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>MIN</div><input type="number" value={b.min} onChange={e=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].min=parseInt(e.target.value)||0;saveAcfg("self_assessment",{bands});}} style={{...inp,width:50,padding:"4px 6px",textAlign:"center",fontSize:13}}/></div>
                          <div><div style={{fontSize:10,color:"#888",fontFamily:FC}}>MAX</div><input type="number" value={b.max} onChange={e=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].max=parseInt(e.target.value)||0;saveAcfg("self_assessment",{bands});}} style={{...inp,width:50,padding:"4px 6px",textAlign:"center",fontSize:13}}/></div>
                        </div>
                        <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC}}>TITLE</div><input value={b.title} onChange={e=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].title=e.target.value;saveAcfg("self_assessment",{bands});}} style={{...inp,fontSize:12,padding:"5px 8px"}}/></div>
                        <div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:4}}>FEEDBACK POINTS</div>
                        {b.feedback.map((f,fi)=>(
                          <div key={fi} style={{display:"flex",gap:4,marginBottom:3}}>
                            <input value={f} onChange={e=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].feedback[fi]=e.target.value;saveAcfg("self_assessment",{bands});}} style={{...inp,fontSize:11,padding:"4px 6px",flex:1}}/>
                            <button onClick={()=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].feedback.splice(fi,1);saveAcfg("self_assessment",{bands});}} style={{background:"none",border:"none",color:"#E3000B",cursor:"pointer",fontSize:12,padding:"2px 4px"}}>x</button>
                          </div>
                        ))}
                        <button onClick={()=>{const bands=JSON.parse(JSON.stringify(acfg.self_assessment?.bands||SCORE_BANDS));bands[bi].feedback.push("New feedback point");saveAcfg("self_assessment",{bands});}} style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#007A33",background:"none",border:"none",cursor:"pointer",padding:"2px 0"}}>+ ADD FEEDBACK</button>
                      </div>
                    ))}
                  </div>

                  {/* Reflection questions */}
                  <div style={{background:"#fff",borderRadius:12,padding:14}}>
                    <div style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#1a1a1a",marginBottom:6}}>Reflection Questions</div>
                    <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:10}}>Shown after results. All 4 are required before completing.</div>
                    {[
                      {key:"q1",label:"Question 1 (Strengths)",def:'I believe my two strengths are (based on the self-assessment or your own conclusion) and why:'},
                      {key:"q2",label:"Question 2 (Strengths feel)",def:'How does this make me feel? Are your results a surprise to you?'},
                      {key:"q3",label:"Question 3 (Opportunities)",def:'I believe my two opportunities are (based on the self-assessment or your own conclusion) and why:'},
                      {key:"q4",label:"Question 4 (Opportunities feel)",def:'How does this make me feel? Are your results a surprise to you?'},
                    ].map(q=>(
                      <div key={q.key} style={{marginBottom:8}}>
                        <div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:3}}>{q.label.toUpperCase()}</div>
                        <textarea value={acfg.self_assessment?.reflectionQs?.[q.key]||q.def} onChange={e=>{const rqs={...(acfg.self_assessment?.reflectionQs||{}),[q.key]:e.target.value};saveAcfg("self_assessment",{reflectionQs:rqs});}} rows={2} style={{...inp,fontSize:12,resize:"vertical",padding:"6px 8px"}}/>
                      </div>
                    ))}
                  </div>
                </div>)}

                {item.kind==="activity"&&!["huddle_builder","coolroom_countdown","roster_reality","self_assessment"].includes(item.type)&&(<div>
                  <div style={{fontSize:13,color:"#888",fontFamily:FB,padding:"8px 0"}}>Activity type: <strong>{(item.type||"standard").replace(/_/g," ")}</strong></div>
                </div>)}
              </div>
            )}
          </div>);
        })}
      </div>

      {/* Batch controls */}
      {progBatches.length>0&&(<div style={{marginTop:24}}>
        <div style={secTitle}>Batch Controls</div>
        {progBatches.map(b=>{
          const batchUsers=us.filter(u=>u.batch===b);
          const bk=(batchControl||{})[b]||{activeActivity:null,completedActivities:[],challengesUnlocked:false,quarter:activeQ};
          const aqx=acfg.activeQuarter?.[contentProg]||"Q1";const akx=aqx==="Q1"?contentProg:`${contentProg}_${aqx}`;const acts=DEFAULT_ACTIVITIES[akx]||DEFAULT_ACTIVITIES[contentProg]||[];
          const toggleAct=(actId,newState)=>{const updated={...(batchControl||{})};const nbk={...bk};
            if(newState==="active"){nbk.activeActivity=actId;nbk.completedActivities=(nbk.completedActivities||[]).filter(id=>id!==actId);}
            else if(newState==="completed"){nbk.activeActivity=nbk.activeActivity===actId?null:nbk.activeActivity;nbk.completedActivities=[...new Set([...(nbk.completedActivities||[]),actId])];}
            else{nbk.activeActivity=nbk.activeActivity===actId?null:nbk.activeActivity;nbk.completedActivities=(nbk.completedActivities||[]).filter(id=>id!==actId);}
            updated[b]=nbk;onUpdateBatchControl(updated);};
          return(
          <div key={b} style={card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:FC,fontWeight:800,fontSize:16,letterSpacing:0.3}}>{b}</span><span style={{fontSize:9,fontFamily:FC,fontWeight:700,padding:"3px 6px",borderRadius:4,background:"#FFD300",color:"#000"}}>{bk.quarter||"Q1"}</span></div><div style={{fontSize:13,color:"#999",fontFamily:FB}}>{batchUsers.length} participants</div></div>
            </div>

            <Toggle on={bk.skipActivities} onToggle={()=>{const updated={...(batchControl||{})};const newSkip=!bk.skipActivities;updated[b]={...bk,skipActivities:newSkip};if(newSkip)updated[b].challengesUnlocked=true;onUpdateBatchControl(updated);}} label="Skip Activities" sub="Send participants straight to challenges"/>
            <Toggle on={bk.challengesUnlocked} onToggle={()=>{const updated={...(batchControl||{})};updated[b]={...bk,challengesUnlocked:!bk.challengesUnlocked};onUpdateBatchControl(updated);}} label="Unlock Challenges" sub="Allow weekly challenge submissions"/>

            {acts.length>0&&!bk.skipActivities&&(<div style={{borderTop:"1px solid #f0f0eb",marginTop:8,paddingTop:12}}>
              <div style={subLabel}>ACTIVITIES</div>
              {acts.map(act=>{const isActive=bk.activeActivity===act.id;const isCompleted=(bk.completedActivities||[]).includes(act.id);const done=new Set((activityComps||[]).filter(c=>c.batch===b&&c.activityId===act.id).map(c=>c.userId)).size;return(
                <div key={act.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f5f5f0"}}>
                  <div><div style={{fontSize:14,fontWeight:600,fontFamily:FB}}>{act.title}</div><div style={{fontSize:12,color:"#999"}}>{done}/{batchUsers.length} done</div></div>
                  <select value={isCompleted?"completed":isActive?"active":"locked"} onChange={e=>toggleAct(act.id,e.target.value)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid #e8e8e3",fontFamily:FC,fontWeight:700,fontSize:12,background:isCompleted?"#007A33":isActive?"#FFD300":"#f5f5f0",color:isCompleted?"#fff":isActive?"#000":"#888",cursor:"pointer",outline:"none"}}>
                    <option value="locked">Locked</option><option value="active">Live</option><option value="completed">Done</option>
                  </select>
                </div>
              );})}
            </div>)}
          </div>);
        })}
      </div>)}
    </div>);
  };

  const renderActivities=()=>{
    const actTypes=[
      {type:"coolroom_countdown",label:"COOL ROOM COUNTDOWN",prog:"nextgen",desc:"360 image with timed stock counting"},
      {type:"roster_reality",label:"ROSTER REALITY",prog:"nextgen",desc:"Labour cost scenario activity"},
      {type:"huddle_builder",label:"SAY IT LIKE A LEADER",prog:"essentials",desc:"Interactive huddle script builder"},
    ];
    return(<div>
    {/* Activity Content Editors */}
    <div style={secTitle}>Activity Content Editor</div>
    <div style={{marginBottom:24}}>
      {actTypes.map(at=>{const isOpen=editActType===at.type;return(
        <div key={at.type} style={{...card,border:isOpen?"2px solid #FFD300":"1px solid #e8e8e3",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setEditActType(isOpen?null:at.type)}>
            <div><div style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5}}>{at.label}</div><div style={{fontSize:12,color:"#999",fontFamily:FB}}>{PROGRAMS[at.prog]?.short} - {at.desc}</div></div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={e=>{e.stopPropagation();const act=Object.values(DEFAULT_ACTIVITIES).flat().find(a=>a.type===at.type);if(act)onPreviewActivity(act);}} style={{...btnB,padding:"6px 12px",fontSize:11}}>PREVIEW</button>
              <span style={{fontSize:20,color:"#ccc",transition:"transform 0.2s",transform:isOpen?"rotate(90deg)":"none"}}>{"\u203A"}</span>
            </div>
          </div>

          {isOpen&&at.type==="hazard_hunt"&&(
            <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
              {/* 360 Image */}
              <div style={{marginBottom:16}}>
                <div style={subLabel}>360 IMAGE</div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:"#666",fontFamily:FB}}>{acfg.hazard_hunt?.image||"Default: /360-prep.jpg"}</span>
                  <label style={{...btnY,padding:"8px 14px",fontSize:12,display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                    UPLOAD 360<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const s=Math.min(1,2048/Math.max(img.width,img.height));c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);const b64=c.toDataURL("image/jpeg",0.6);if(b64.length>900000){flash("Image too large - try a smaller file",false);return;}saveAcfg("hazard_hunt",{image:b64});flash("360 image uploaded!",true);};img.src=ev.target.result;};reader.readAsDataURL(file);}}/></label>
                </div>
              </div>

              {/* Hotspot Opacity */}
              <div style={{marginBottom:16}}>
                <div style={subLabel}>HOTSPOT VISIBILITY</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <input type="range" min="0" max="1" step="0.1" value={acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1} onChange={e=>saveAcfg("hazard_hunt",{hotspotOpacity:parseFloat(e.target.value)})} style={{flex:1,accentColor:"#FFD300"}}/>
                  <span style={{fontFamily:FC,fontWeight:800,fontSize:13,minWidth:40}}>{Math.round((acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1)*100)}%</span>
                </div>
                <div style={{fontSize:11,color:"#999",fontFamily:FC,marginTop:4}}>0% = invisible (hard mode), 100% = fully visible</div>
              </div>

              {/* Hotspot Placement */}
              <div style={{marginBottom:16}}>
                <div style={subLabel}>HOTSPOT PLACEMENT</div>
                {hotspotEditor?(
                  <div>
                    <div style={{position:"relative",height:300,borderRadius:12,overflow:"hidden",marginBottom:8}} ref={editorViewRef}>
                      <PanoViewer imgSrc={acfg.hazard_hunt?.image||HAZARD_IMG} onYawPitch={(y,p)=>setEditorYP({yaw:y,pitch:p})}/>
                      {/* Show existing hotspots projected */}
                      {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{
                        const vw=editorViewRef.current?.clientWidth||400;const vh=editorViewRef.current?.clientHeight||300;
                        const proj=projectToScreen(z.yaw,z.pitch,editorYP.yaw,editorYP.pitch,vw,vh);
                        if(!proj)return null;const sz=20*proj.scale;const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};
                        return <div key={z.id} style={{position:"absolute",left:proj.x-sz/2,top:proj.y-sz/2,width:sz,height:sz,borderRadius:"50%",background:fb2.hazard?"rgba(0,122,51,0.6)":"rgba(227,0,11,0.6)",border:"2px solid #fff",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:900}}>{zi+1}</div>;
                      })}
                      {/* Crosshair */}
                      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:6,pointerEvents:"none"}}>
                        <div style={{width:24,height:24,border:"2px solid #FFD300",borderRadius:"50%"}}/>
                        <div style={{position:"absolute",top:11,left:-6,width:8,height:2,background:"#FFD300"}}/>
                        <div style={{position:"absolute",top:11,left:22,width:8,height:2,background:"#FFD300"}}/>
                        <div style={{position:"absolute",top:-6,left:11,width:2,height:8,background:"#FFD300"}}/>
                        <div style={{position:"absolute",top:22,left:11,width:2,height:8,background:"#FFD300"}}/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,marginBottom:8}}>
                      <button onClick={()=>addHotspot(editorYP.yaw,editorYP.pitch)} style={{...btnY,flex:1,fontSize:12}}>DROP HOTSPOT AT CROSSHAIR</button>
                      <button onClick={()=>setHotspotEditor(false)} style={{...btnG,fontSize:12}}>CLOSE</button>
                    </div>
                    <div style={{fontSize:11,color:"#888",fontFamily:FC}}>Pan the 360 image to position the crosshair over the hazard, then tap DROP HOTSPOT</div>
                  </div>
                ):(
                  <button onClick={()=>setHotspotEditor(true)} style={{...btnB,width:"100%",fontSize:12}}>OPEN 360 HOTSPOT EDITOR</button>
                )}
              </div>

              {/* Hotspot List */}
              <div style={subLabel}>HOTSPOTS ({(acfg.hazard_hunt?.zones||HAZARD_ZONES).length})</div>
              {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};return(
                <div key={z.id} style={{background:"#fff",borderRadius:10,border:"1px solid #e8e8e3",padding:12,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontFamily:FC,fontWeight:900,fontSize:13,background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}>{zi+1}</span>
                      <span style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{fb2.title||z.id}</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>updateHotspotFb(z.id,"hazard",!fb2.hazard)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>{fb2.hazard?"HAZARD":"DECOY"}</button>
                      <button onClick={()=>removeHotspot(z.id)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#f5f5f0",color:"#E3000B",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>DELETE</button>
                    </div>
                  </div>
                  <input value={fb2.title||""} onChange={e=>updateHotspotFb(z.id,"title",e.target.value)} placeholder="Hazard title" style={{...inp,marginBottom:6,fontSize:13}}/>
                  <textarea value={fb2.desc||""} onChange={e=>updateHotspotFb(z.id,"desc",e.target.value)} placeholder="Feedback description shown when tapped" rows={2} style={{...inp,resize:"vertical",fontSize:13}}/>
                  <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                    <span style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#999"}}>SIZE</span>
                    <input type="range" min="20" max="80" value={z.size||44} onChange={e=>updateHotspotZone(zi,"size",parseInt(e.target.value))} style={{flex:1,accentColor:"#FFD300"}}/>
                    <span style={{fontSize:12,fontFamily:FC,fontWeight:700,minWidth:28}}>{z.size||44}</span>
                  </div>
                </div>
              );})}
            </div>
          )}

          {isOpen&&at.type==="shift_in_chaos"&&(
            <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
              <div style={subLabel}>PROBLEMS ({(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).length})</div>
              <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:12}}>Order here is the EXPERT ranking. Participants see them shuffled.</div>
              {(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).map((p,pi)=>(
                <div key={p.id||pi} style={{background:"#fff",borderRadius:10,border:"1px solid #e8e8e3",padding:12,marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{fontFamily:FC,fontWeight:900,fontSize:13,background:"#000",color:"#FFD300",width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{pi+1}</span>
                    <div style={{flex:1}}>
                      <textarea value={p.text} onChange={e=>updateChaosProb(pi,"text",e.target.value)} rows={2} style={{...inp,resize:"vertical",fontSize:13}}/>
                      <div style={{display:"flex",gap:6,marginTop:4}}>
                        {["safety","operational","cosmetic"].map(cat=>(
                          <button key={cat} onClick={()=>updateChaosProb(pi,"category",cat)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:p.category===cat?(cat==="safety"?"#E3000B":cat==="operational"?"#FFD300":"#999"):"#f5f5f0",color:p.category===cat?"#fff":"#888",fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>{cat.toUpperCase()}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOpen&&(at.type==="coolroom_countdown"||at.type==="roster_reality"||at.type==="huddle_builder")&&(
            <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
              <div style={{fontSize:12,color:"#888",fontFamily:FC,textAlign:"center",padding:16}}>Content for this activity type is configured via the batch controls below.</div>
            </div>
          )}
        </div>
      );})}
    </div>

    {/* Batch Controls */}
    <div style={secTitle}>Batch Controls</div>
    {batches.map(b=>{
      const batchUsers=us.filter(u=>u.batch===b);if(!batchUsers.length)return null;
      const prog=batchUsers[0]?.program;const aq=acfg.activeQuarter?.[prog]||"Q1";const actKey=aq==="Q1"?prog:`${prog}_${aq}`;const acts=DEFAULT_ACTIVITIES[actKey]||DEFAULT_ACTIVITIES[prog];if(!acts||!acts.length)return null;
      const bk=(batchControl||{})[b]||{activeActivity:null,completedActivities:[],challengesUnlocked:false};
      const toggleAct=(actId,newState)=>{const updated={...(batchControl||{})};const nbk={...bk};
        if(newState==="active"){nbk.activeActivity=actId;nbk.completedActivities=(nbk.completedActivities||[]).filter(id=>id!==actId);}
        else if(newState==="completed"){nbk.activeActivity=nbk.activeActivity===actId?null:nbk.activeActivity;nbk.completedActivities=[...new Set([...(nbk.completedActivities||[]),actId])];}
        else{nbk.activeActivity=nbk.activeActivity===actId?null:nbk.activeActivity;nbk.completedActivities=(nbk.completedActivities||[]).filter(id=>id!==actId);}
        updated[b]=nbk;onUpdateBatchControl(updated);};
      const completedCount=actId=>new Set((activityComps||[]).filter(c=>c.batch===b&&c.activityId===actId).map(c=>c.userId)).size;
      return(
        <div key={b} style={{...card,border:"2px solid #e8e8e3"}}>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div><div style={{fontSize:16,fontWeight:900,fontFamily:F107,letterSpacing:1}}>{b}</div><div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5,marginTop:2}}>{PROGRAMS[prog]?.name} - {batchUsers.length} participants</div></div>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:16,background:bk.skipActivities?"#FFF8E0":"#f8f8f5",borderRadius:12,border:bk.skipActivities?"2px solid #FFD300":"2px solid #f0f0eb"}}>
            <div><div style={{fontSize:12,fontWeight:900,fontFamily:FC,letterSpacing:1}}>SKIP ACTIVITIES</div><div style={{fontSize:11,color:"#999",fontFamily:FC,marginTop:2}}>Send straight to challenges</div></div>
            <button onClick={()=>{const updated={...(batchControl||{})};const newSkip=!bk.skipActivities;updated[b]={...bk,skipActivities:newSkip};if(newSkip)updated[b].challengesUnlocked=true;onUpdateBatchControl(updated);}} style={{padding:"8px 18px",borderRadius:8,border:"none",background:bk.skipActivities?"#FFD300":"#e8e8e3",color:bk.skipActivities?"#000":"#999",fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>{bk.skipActivities?"ON":"OFF"}</button>
          </div>

          {!bk.skipActivities&&<>{acts.map(act=>{
            const isActive=bk.activeActivity===act.id;const isCompleted=(bk.completedActivities||[]).includes(act.id);const done=completedCount(act.id);
            return(<div key={act.id} style={{background:"#f8f8f5",borderRadius:12,padding:isMobile?12:16,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
                <div><div style={{fontSize:14,fontWeight:900,fontFamily:F107,letterSpacing:0.5}}>{act.title}</div><div style={{fontSize:12,color:"#999",fontFamily:FC}}>{act.subtitle} - {done}/{batchUsers.length} completed</div></div>
                <span style={{fontSize:12,fontWeight:800,fontFamily:FC,padding:"4px 10px",borderRadius:6,background:isCompleted?"#007A33":isActive?"#FFD300":"#e8e8e3",color:isCompleted?"#fff":isActive?"#000":"#999"}}>{isCompleted?"DONE":isActive?"LIVE":"LOCKED"}</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {["locked","active","completed"].map(s=>{const sel=s==="locked"?(!isActive&&!isCompleted):s==="active"?isActive:isCompleted;const bg=s==="locked"?(sel?"#666":"#fff"):s==="active"?(sel?"#FFD300":"#fff"):(sel?"#007A33":"#fff");const col=s==="locked"?(sel?"#fff":"#999"):s==="active"?(sel?"#000":"#999"):(sel?"#fff":"#999");
                  return <button key={s} onClick={()=>toggleAct(act.id,s)} style={{flex:1,minWidth:80,padding:"10px",borderRadius:10,border:sel?`2px solid ${bg}`:"2px solid #e8e8e3",background:bg,color:col,fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>{s.toUpperCase()}</button>;
                })}
              </div>

              {act.type==="coolroom_countdown"&&(isActive||isCompleted)&&(
                <div style={{padding:14,background:"#fff",borderRadius:12,border:"1px solid #e8e8e3"}}>
                  <div style={{fontSize:11,fontWeight:800,fontFamily:FC,letterSpacing:1,color:"#999",marginBottom:12}}>360 IMAGE CONFIG</div>
                  {["imgA","imgB"].map((key,ki)=>{const label=ki===0?"Image A - Before Blackout":"Image B - After Blackout";const currentImg=(coolroomImgs||{})[b]?.[key];return(
                    <div key={key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:ki===0?12:0,flexWrap:"wrap"}}>
                      {currentImg?<img src={currentImg} alt="" style={{width:64,height:44,objectFit:"cover",borderRadius:8,border:"1px solid #e8e8e3"}}/>:<div style={{width:64,height:44,borderRadius:8,background:"#f5f5f0",border:"2px dashed #ddd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#ccc",fontFamily:FC}}>NONE</div>}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontFamily:FC,fontWeight:700,color:"#666",marginBottom:6}}>{label}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <label style={{...btnY,padding:"8px 14px",fontSize:12,display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                            UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const file=e.target.files[0];if(!file)return;try{const b64=await compressImage(file,800,0.5);await onUpdateCoolroomImg(b,key,b64);flash("360 image uploaded!",true);}catch(err){flash("Upload failed",false);}}}/></label>
                          {currentImg&&<button onClick={async()=>{try{await onUpdateCoolroomImg(b,key,null);flash("Image cleared",true);}catch(err){flash("Failed",false);}}} style={{...btnG,padding:"8px 14px",fontSize:12,color:"#E3000B"}}>CLEAR</button>}
                        </div>
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </div>);
          })}

          <div style={{marginTop:4,paddingTop:16,borderTop:"2px solid #f0f0eb",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontSize:12,fontWeight:900,fontFamily:FC,letterSpacing:1}}>UNLOCK CHALLENGES</div><div style={{fontSize:11,color:"#999",fontFamily:FC,marginTop:2}}>Allow weekly challenges</div></div>
            <button onClick={()=>{const updated={...(batchControl||{})};updated[b]={...bk,challengesUnlocked:!bk.challengesUnlocked};onUpdateBatchControl(updated);}} style={{padding:"10px 22px",borderRadius:10,border:"none",background:bk.challengesUnlocked?"#007A33":"#E3000B",color:"#fff",fontSize:12,fontWeight:800,fontFamily:FC,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>{bk.challengesUnlocked?"UNLOCKED":"LOCKED"}</button>
          </div></>}
        </div>
      );
    })}
    {batches.filter(b=>{const bu=us.filter(u=>u.batch===b);const prog=bu[0]?.program;const aq2=acfg.activeQuarter?.[prog]||"Q1";const ak2=aq2==="Q1"?prog:`${prog}_${aq2}`;return(DEFAULT_ACTIVITIES[ak2]||DEFAULT_ACTIVITIES[prog])?.length>0;}).length===0&&<div style={{fontSize:14,color:"#999",textAlign:"center",padding:40,fontFamily:FC}}>No batches with activities found.</div>}
  </div>);};

  /* ═══ PEOPLE ═══ */
  const renderPeople=()=>{
    const lc=lunchConfig||{};
    const lunchUsers=filtered.filter(u=>u.lunchType&&u.lunchFilling);
    const noOrder=filtered.filter(u=>!u.lunchType||!u.lunchFilling);
    const toggleProg=(pid,field,val)=>{const cfg={...lc};cfg[pid]={...(cfg[pid]||{enabled:true,types:LUNCH_MENU.types.map(t=>t.id),fillings:LUNCH_MENU.fillings.map(f=>f.id)}),[field]:val};onUpdateLunchConfig(cfg);};
    const toggleItem=(pid,field,itemId)=>{const cfg={...lc};const pc=cfg[pid]||{enabled:true,types:LUNCH_MENU.types.map(t=>t.id),fillings:LUNCH_MENU.fillings.map(f=>f.id)};const arr=pc[field]||[];cfg[pid]={...pc,[field]:arr.includes(itemId)?arr.filter(x=>x!==itemId):[...arr,itemId]};onUpdateLunchConfig(cfg);};
    const TS={display:"inline-flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:8,border:"1px solid #e0e0db",cursor:"pointer",fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:0.5,marginRight:4,marginBottom:4,transition:"all 0.15s"};

    return(<div>
      {/* Sub-tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {[{id:"participants",label:"Participants"},{id:"orders",label:"Lunch Orders"},{id:"config",label:"Lunch Config"}].map(t=>
          <button key={t.id} onClick={()=>setPeopleTab(t.id)} style={pill(peopleTab===t.id)}>{t.label.toUpperCase()}</button>
        )}
      </div>

      {/* Participants */}
      {peopleTab==="participants"&&<>
        <div style={{marginBottom:16}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search by name, email, or restaurant..." style={{...inp,maxWidth:400}}/>
        </div>
        {filtered.sort((a,b)=>uP(b.id)-uP(a.id)).map(u=>(<div key={u.id} style={{...card,padding:isMobile?14:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:FC,fontWeight:800,fontSize:15}}>{u.name.toUpperCase()}</div>
              <div style={{fontSize:13,color:"#888",fontFamily:FB,marginTop:2}}>{u.position}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontFamily:FC,fontWeight:900,fontSize:18}}>{uP(u.id)}<span style={{fontSize:12,color:"#999",fontWeight:600}}> pts</span></div>
              <div style={{fontSize:12,color:"#888",fontFamily:FC}}>{uD(u.id)}/4 done</div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#666",fontFamily:FB}}>{u.restaurant}</span>
              <span style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#fff",background:"#000",padding:"3px 8px",borderRadius:4}}>{u.batch}</span>
              <span style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#888",background:"#f5f5f0",padding:"3px 8px",borderRadius:4}}>WK {getUserWeek(u.createdAt)}</span>
            </div>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>{setEditUser(editUser===u.id?null:u.id);setNewPass("");}} style={{padding:"6px 12px",background:editUser===u.id?"#FFD300":"#f5f5f0",border:"none",borderRadius:8,fontSize:12,fontFamily:FC,fontWeight:700,letterSpacing:0.5,cursor:"pointer",transition:"all 0.15s"}}>EDIT</button>
              {confirmDel===u.id?<><button onClick={()=>{onDeleteUser(u.id);setConfirmDel(null);}} style={{padding:"6px 10px",background:"#E3000B",border:"none",borderRadius:8,fontSize:12,fontFamily:FC,fontWeight:700,color:"#fff",cursor:"pointer"}}>CONFIRM</button><button onClick={()=>setConfirmDel(null)} style={{padding:"6px 10px",background:"#f5f5f0",border:"none",borderRadius:8,fontSize:12,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>CANCEL</button></>
              :<button onClick={()=>setConfirmDel(u.id)} style={{padding:"6px 12px",background:"#f5f5f0",border:"none",borderRadius:8,fontSize:12,fontFamily:FC,fontWeight:700,color:"#E3000B",cursor:"pointer"}}>DELETE</button>}
            </div>
          </div>
          {editUser===u.id&&<div style={{paddingTop:12,borderTop:"1px solid #f0f0eb",display:"flex",gap:8,flexWrap:"wrap"}}>
            <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="New password" style={{...inp,flex:1,minWidth:140,maxWidth:260}}/>
            <button onClick={()=>{if(newPass.length>=3){onChangePass(u.id,newPass);setEditUser(null);setNewPass("");}}} style={{...btnB,padding:"10px 18px",fontSize:12}}>SAVE PASSWORD</button>
          </div>}
        </div>))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#999",fontFamily:FC}}>No participants match filters</div>}
      </>}

      {/* Lunch Orders */}
      {peopleTab==="orders"&&<>
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
          {[{n:filtered.length,l:"TOTAL",c:"#000"},{n:lunchUsers.length,l:"ORDERED",c:"#007A33"},{n:noOrder.length,l:"NO ORDER",c:noOrder.length>0?"#E3000B":"#888"},{n:lunchUsers.filter(u=>u.lunchType==="burrito").length,l:"BURRITOS"},{n:lunchUsers.filter(u=>u.lunchType==="bowl").length,l:"BOWLS"}].map((s,i)=><StatCard key={i} {...s}/>)}
        </div>
        {(()=>{const fc={};lunchUsers.forEach(u=>{const k=u.lunchType+"-"+u.lunchFilling;fc[k]=(fc[k]||0)+1;});return Object.keys(fc).length>0&&<div style={{...card,marginBottom:20}}>
          <div style={subLabel}>ORDER BREAKDOWN</div>
          {Object.entries(fc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const[type,fill]=k.split("-");return(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f0f0eb"}}><div><span style={{fontWeight:700,fontFamily:FC,fontSize:13,textTransform:"uppercase"}}>{type}</span><span style={{color:"#888",fontSize:13}}> - {LUNCH_MENU.fillings.find(fl=>fl.id===fill)?.name||fill}</span></div><div style={{fontWeight:900,fontFamily:FC,fontSize:15}}>{v}</div></div>);})}</div>;})()}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={subLabel}>ALL PARTICIPANTS ({filtered.length})</div>
        </div>
        {filtered.sort((a,b)=>a.name.localeCompare(b.name)).map(u=>(
          <div key={u.id} style={{...card,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontWeight:700,fontFamily:FC,fontSize:14}}>{u.name}</div><div style={{fontSize:12,color:"#888",fontFamily:FB}}>{u.restaurant}</div></div>
            {u.lunchType&&u.lunchFilling?(<div style={{textAlign:"right"}}><div style={{fontWeight:700,fontFamily:FC,fontSize:12,letterSpacing:0.5,textTransform:"uppercase"}}>{u.lunchType}</div><div style={{fontSize:12,color:"#555"}}>{LUNCH_MENU.fillings.find(fl=>fl.id===u.lunchFilling)?.name||u.lunchFilling}</div></div>)
            :(<div style={{fontSize:12,fontWeight:700,fontFamily:FC,color:"#E3000B",letterSpacing:0.5}}>NO ORDER</div>)}
          </div>
        ))}
      </>}

      {/* Lunch Config */}
      {peopleTab==="config"&&<>
        <div style={secTitle}>Lunch Configuration</div>
        {[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=>{const pc=lc[p.id]||{enabled:true,types:LUNCH_MENU.types.map(t=>t.id),fillings:LUNCH_MENU.fillings.map(f=>f.id)};const enabled=pc.enabled!==false;return(
          <div key={p.id} style={{...card,padding:isMobile?14:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:enabled?14:0}}>
              <span style={{fontFamily:FC,fontWeight:800,fontSize:14,letterSpacing:0.5}}>{p.short} - {p.name}</span>
              <button onClick={()=>toggleProg(p.id,"enabled",!enabled)} style={{padding:"8px 16px",borderRadius:10,border:"none",fontFamily:FC,fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:"pointer",background:enabled?"#007A33":"#E3000B",color:"#fff",transition:"all 0.15s"}}>{enabled?"ENABLED":"DISABLED"}</button>
            </div>
            {enabled&&<>
              <div style={{...subLabel,marginTop:4}}>MEAL TYPES</div>
              <div style={{marginBottom:10,display:"flex",flexWrap:"wrap"}}>{LUNCH_MENU.types.map(t=>{const on=(pc.types||[]).includes(t.id);return(<button key={t.id} onClick={()=>toggleItem(p.id,"types",t.id)} style={{...TS,background:on?"#FFF8E0":"#f5f5f0",borderColor:on?"#FFD300":"#e0e0db"}}><div style={{width:8,height:8,borderRadius:2,background:on?"#FFD300":"#ddd"}}/>{t.name}</button>);})}</div>
              <div style={subLabel}>FILLINGS</div>
              <div style={{display:"flex",flexWrap:"wrap"}}>{LUNCH_MENU.fillings.map(fl=>{const on=(pc.fillings||[]).includes(fl.id);return(<button key={fl.id} onClick={()=>toggleItem(p.id,"fillings",fl.id)} style={{...TS,background:on?"#FFF8E0":"#f5f5f0",borderColor:on?"#FFD300":"#e0e0db"}}><div style={{width:8,height:8,borderRadius:2,background:on?"#FFD300":"#ddd"}}/>{fl.name}</button>);})}</div>
            </>}
          </div>
        );})}
      </>}
    </div>);
  };

  /* ═══ SUBMISSIONS ═══ */
  const pendingPhotoApprovals=filteredCo.filter(c=>c.submission?.pendingApproval&&c.submission?.photos&&c.submission.bonusApproved===null);
  const renderSubmissions=()=>(<div>
    {/* Photo Approval Queue */}
    {pendingPhotoApprovals.length>0&&(<div style={{marginBottom:24}}>
      <div style={{...secTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>Photo Approvals ({pendingPhotoApprovals.length})</span>
        <span style={{fontSize:11,fontFamily:FC,fontWeight:600,color:"#FFB800",background:"#FFF8E0",padding:"4px 10px",borderRadius:6}}>PENDING</span>
      </div>
      <div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:12}}>These participants didn't receive enough peer swipes before the challenge closed. Review their photos and approve or reject bonus points.</div>
      {pendingPhotoApprovals.map(c=>{const usr=us.find(u=>u.id===c.userId);const chx=Object.values(challenges).flat().find(x=>x.id===c.challengeId);return(
        <div key={c.id} style={{...card,padding:isMobile?14:18,border:"2px solid #FFB800"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
            <div><span style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{usr?.name?.toUpperCase()||"UNKNOWN"}</span><span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#fff",background:"#000",padding:"4px 7px 3px",borderRadius:4,lineHeight:1,marginLeft:8}}>{c.batch}</span></div>
            <span style={{fontFamily:FC,fontWeight:600,fontSize:12,color:"#666"}}>{chx?.title}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8,marginBottom:12}}>
            {(c.submission.photos||[]).filter(Boolean).map((p,pi)=>(
              <div key={pi} style={{borderRadius:10,overflow:"hidden",aspectRatio:"1"}}><img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
            ))}
          </div>
          {c.submission.swipeResults&&<div style={{fontSize:12,color:"#888",fontFamily:FB,marginBottom:8}}>Swiped {c.submission.swipeResults.length} photos - {c.submission.comeBackCount||0} come back, {c.submission.nopeCount||0} nope</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onUpdateComps(co.map(x=>x.id===c.id?{...x,submission:{...x.submission,pendingApproval:false,bonusApproved:true},bonusClaimed:true,bonusApproved:true}:x));}} style={{flex:1,padding:"10px",background:"#007A33",color:"#fff",border:"none",borderRadius:10,fontFamily:FC,fontWeight:700,fontSize:13,cursor:"pointer"}}>APPROVE BONUS +{chx?.bonusPoints||50}</button>
            <button onClick={()=>{onUpdateComps(co.map(x=>x.id===c.id?{...x,submission:{...x.submission,pendingApproval:false,bonusApproved:false},bonusClaimed:false,bonusApproved:false}:x));}} style={{flex:1,padding:"10px",background:"#E3000B",color:"#fff",border:"none",borderRadius:10,fontFamily:FC,fontWeight:700,fontSize:13,cursor:"pointer"}}>REJECT</button>
          </div>
        </div>
      );})}
    </div>)}
    <div style={secTitle}>Submissions ({filteredCo.length})</div>
    {filteredCo.sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt)).map(c=>{const usr=us.find(u=>u.id===c.userId);const chx=Object.values(challenges).flat().find(x=>x.id===c.challengeId);const isExp=expandedSub===c.id;const sub=c.submission||{};return(
      <div key={c.id} style={{...card,padding:isMobile?14:18,cursor:"pointer",border:isExp?"2px solid #FFD300":"1px solid #e8e8e3",transition:"border 0.15s"}} onClick={()=>setExpandedSub(isExp?null:c.id)}>
        {/* Header row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:FC,fontWeight:800,fontSize:14}}>{usr?.name?.toUpperCase()||"UNKNOWN"}</span>
            <span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#fff",background:"#000",padding:"4px 7px 3px",borderRadius:4,lineHeight:1}}>{c.batch}</span>
            {!isMobile&&<span style={{color:"#888",fontSize:12,fontFamily:FB}}>{usr?.restaurant}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:FC,fontWeight:800,color:"#007A33",fontSize:14}}>+{c.points}{c.bonusApproved&&<span> +{c.bonusPoints}</span>}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{transform:isExp?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div style={{fontFamily:FC,fontWeight:600,fontSize:12,marginBottom:isExp?12:4,color:"#666"}}>{chx?.title} - WEEK {chx?.week}
          {c.bonusClaimed&&<span style={{marginLeft:8}}>{c.bonusApproved?<span style={{color:"#007A33",fontWeight:800}}>BONUS APPROVED</span>:
            <span style={{display:"inline-flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{color:"#FFB800",fontWeight:800}}>BONUS PENDING</span>
              <button onClick={(e)=>{e.stopPropagation();onUpdateComps(co.map(x=>x.id===c.id?{...x,bonusApproved:true}:x));}} style={{padding:"4px 10px",background:"#007A33",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>APPROVE</button>
              <button onClick={(e)=>{e.stopPropagation();onUpdateComps(co.map(x=>x.id===c.id?{...x,bonusClaimed:false}:x));}} style={{padding:"4px 10px",background:"#E3000B",color:"#fff",border:"none",borderRadius:6,fontSize:11,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>REJECT</button>
            </span>}</span>}
        </div>

        {/* Collapsed preview */}
        {!isExp&&<>
          {sub.text&&<div style={{fontSize:13,color:"#888",fontFamily:FB,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{sub.text}</div>}
          {sub.photos&&<div style={{display:"flex",gap:4,marginTop:4}}>{sub.photos.filter(Boolean).slice(0,5).map((p,pi)=>(<img key={pi} src={p} alt="" style={{width:36,height:36,objectFit:"cover",borderRadius:6,border:"1px solid #e8e8e3"}}/>))}{sub.pendingApproval&&<span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#FFB800",alignSelf:"center",marginLeft:4}}>PENDING</span>}</div>}
          {sub.videoCount>0&&<div style={{fontSize:11,color:"#007A33",fontFamily:FC,fontWeight:600,marginTop:4}}>{sub.videoCount} video{sub.videoCount>1?"s":""} recorded</div>}
          <div style={{fontSize:11,color:"#ccc",fontFamily:FB,marginTop:4}}>{new Date(c.submittedAt).toLocaleDateString("en-AU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
        </>}

        {/* Expanded full view */}
        {isExp&&<div onClick={e=>e.stopPropagation()} style={{marginTop:8}}>
          {/* Text content */}
          {sub.text&&<div style={{fontSize:14,color:"#333",borderLeft:"3px solid #FFD300",paddingLeft:14,marginBottom:14,lineHeight:1.7,fontFamily:FB,whiteSpace:"pre-wrap"}}>{sub.text}</div>}

          {/* Photos - full size grid */}
          {sub.photos&&sub.photos.filter(Boolean).length>0&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>PHOTOS ({sub.photos.filter(Boolean).length})</div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)",gap:10}}>
              {sub.photos.filter(Boolean).map((p,pi)=>(
                <div key={pi} style={{borderRadius:12,overflow:"hidden",aspectRatio:"1",cursor:"pointer",border:"1px solid #e8e8e3"}} onClick={()=>setLightboxImg(p)}>
                  <img src={p} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>
              ))}
            </div>
            {sub.pendingApproval&&<div style={{marginTop:8,padding:"8px 12px",background:"#FFF8E0",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:11,color:"#FFB800"}}>PENDING REVIEW</div>}
            {sub.bonusApproved===true&&<div style={{marginTop:8,padding:"8px 12px",background:"#f0f8f0",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:11,color:"#007A33"}}>BONUS APPROVED</div>}
          </div>}

          {/* Videos */}
          {sub.videoCount>0&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>VIDEOS ({sub.videoCount})</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(sub.items||[]).map((it,ii)=>(<div key={ii} style={{background:"#f5f5f0",borderRadius:10,padding:"12px 14px",border:"1px solid #e8e8e3",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:8,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD300" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{it.itemName||`Recording ${ii+1}`}</div>
                  <div style={{fontSize:12,color:"#888",fontFamily:FB}}>{it.duration?`${it.duration}s`:""} {it.size?`- ${(it.size/1024).toFixed(0)}KB`:""}</div>
                </div>
                <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#007A33"}}>RECORDED</div>
              </div>))}
              <div style={{fontSize:11,color:"#888",fontFamily:FB,fontStyle:"italic"}}>Videos stored on participant's device - viewable in person</div>
            </div>
          </div>}

          {/* File attachments */}
          {sub.files&&sub.files.length>0&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>ATTACHMENTS ({sub.files.length})</div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)",gap:10}}>
              {sub.files.map((f,fi)=>(f.type?.startsWith("image/")?
                <div key={fi} style={{borderRadius:12,overflow:"hidden",aspectRatio:"1",cursor:"pointer",border:"1px solid #e8e8e3"}} onClick={()=>setLightboxImg(f.data)}>
                  <img src={f.data} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                </div>:
                <div key={fi} style={{padding:"14px",background:"#f5f5f0",borderRadius:12,border:"1px solid #e8e8e3",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}} onClick={()=>{const a=document.createElement("a");a.href=f.data;a.download=f.name||"file";document.body.appendChild(a);a.click();document.body.removeChild(a);}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div style={{fontFamily:FC,fontWeight:600,fontSize:11,color:"#666",textAlign:"center",wordBreak:"break-all"}}>{f.name||"Download"}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Submission data details */}
          {(sub.score!==undefined||sub.correctCount!==undefined||sub.accuracy!==undefined||sub.decisions||sub.choices||sub.profiles||sub.rounds)&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>RESULTS</div>
            <div style={{background:"#f5f5f0",borderRadius:10,padding:14,display:"flex",flexWrap:"wrap",gap:14}}>
              {sub.score!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:"#000"}}>{sub.score}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>SCORE</div></div>}
              {sub.correctCount!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:"#007A33"}}>{sub.correctCount}{sub.decisions?`/${sub.decisions.length}`:sub.profiles?`/${sub.profiles.length}`:""}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>CORRECT</div></div>}
              {sub.accuracy!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:sub.accuracy>=80?"#007A33":"#E3000B"}}>{sub.accuracy}%</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>ACCURACY</div></div>}
              {sub.avgSpeed!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20}}>{sub.avgSpeed.toFixed(1)}s</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>AVG SPEED</div></div>}
              {sub.streak!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20}}>{sub.streak}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>STREAK</div></div>}
              {sub.finalAHR!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:sub.finalAHR<=37.10?"#007A33":"#E3000B"}}>${sub.finalAHR.toFixed(2)}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>FINAL AHR</div></div>}
              {sub.totalAnnualSaving!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:"#007A33"}}>${sub.totalAnnualSaving.toLocaleString()}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>ANNUAL SAVING</div></div>}
              {sub.profile&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300",background:"#000",padding:"4px 10px",borderRadius:6}}>{sub.profile}</div><div style={{fontSize:10,color:"#999",fontFamily:FC,marginTop:4}}>PROFILE</div></div>}
              {sub.rating&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:14,color:"#FFD300",background:"#000",padding:"4px 10px",borderRadius:6}}>{sub.rating}</div><div style={{fontSize:10,color:"#999",fontFamily:FC,marginTop:4}}>RATING</div></div>}
              {sub.weakestMoment&&<div><div style={{fontFamily:FC,fontWeight:700,fontSize:13}}>{sub.weakestMoment}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>WEAKEST MOMENT</div></div>}
              {sub.captureRate!==undefined&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:sub.captureRate>=80?"#007A33":"#E3000B"}}>{sub.captureRate}%</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>CAPTURE RATE</div></div>}
              {sub.totalScore!==undefined&&sub.maxScore&&<div><div style={{fontFamily:FC,fontWeight:800,fontSize:20}}>{sub.totalScore}/{sub.maxScore}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>TOTAL SCORE</div></div>}
            </div>
          </div>}

          {/* Decision breakdown */}
          {sub.decisions&&sub.decisions.length>0&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>DECISIONS ({sub.decisions.length})</div>
            {sub.decisions.map((d,di)=>(
              <div key={di} style={{padding:"8px 12px",marginBottom:4,borderRadius:8,background:d.correct?"#f0f8f0":"#fef0f0",borderLeft:`3px solid ${d.correct?"#007A33":"#E3000B"}`,fontSize:12,fontFamily:FB}}>
                <span style={{fontWeight:700,fontFamily:FC}}>{d.day||d.shiftId?`Shift ${d.shiftId||di+1}`:d.scenarioId?`Scenario ${d.scenarioId}`:d.crewId||`#${di+1}`}</span>
                <span style={{marginLeft:8,color:d.correct?"#007A33":"#E3000B"}}>{d.correct?"Correct":"Wrong"}</span>
                {d.choice&&<span style={{marginLeft:8,color:"#888"}}>{d.choice}</span>}
                {d.extraCost>0&&<span style={{marginLeft:8,color:"#E3000B",fontWeight:700}}>+${d.extraCost.toFixed(0)} extra</span>}
              </div>
            ))}
          </div>}

          {/* Swipe results for Spot the Moment */}
          {sub.swipeResults&&<div style={{marginBottom:14}}>
            <div style={{fontFamily:FC,fontWeight:700,fontSize:11,color:"#999",letterSpacing:0.5,marginBottom:8}}>SWIPE RESULTS</div>
            <div style={{display:"flex",gap:14}}>
              <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:"#007A33"}}>{sub.comeBackCount||0}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>COME BACK</div></div>
              <div style={{textAlign:"center"}}><div style={{fontFamily:FC,fontWeight:800,fontSize:20,color:"#E3000B"}}>{sub.nopeCount||0}</div><div style={{fontSize:10,color:"#999",fontFamily:FC}}>NOPE</div></div>
            </div>
            {sub.wordPicks&&sub.wordPicks.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{sub.wordPicks.map((w,wi)=>(<span key={wi} style={{padding:"4px 10px",borderRadius:14,background:"#FFF8E0",fontSize:11,fontFamily:FC,fontWeight:600}}>{w}</span>))}</div>}
          </div>}

          {/* Timestamp */}
          <div style={{fontSize:12,color:"#bbb",fontFamily:FB,paddingTop:8,borderTop:"1px solid #f0f0eb"}}>{new Date(c.submittedAt).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
        </div>}
      </div>
    );})}
    {filteredCo.length===0&&<div style={{textAlign:"center",padding:40,color:"#999",fontFamily:FC}}>No submissions match filters</div>}
  </div>);

  /* ═══ CHALLENGES ═══ */
  const renderChallenges=()=>(<div>
    <div style={secTitle}>Challenge Editor</div>
    {[["lse",challenges.lse],["essentials",challenges.essentials],["nextgen",challenges.nextgen],["elite",challenges.elite]].filter(([k,v])=>v).map(([progId,chs])=>{
      const prog=PROGRAMS[progId];if(!prog)return null;if(fp!=="all"&&fp!==progId)return null;
      return(<div key={progId} style={{marginBottom:28}}>
        <div style={{fontFamily:FC,fontWeight:800,fontSize:15,letterSpacing:0.5,marginBottom:12}}>{prog.name}</div>
        {chs.map((c,idx)=>{
          const isEdit=editCh===`${progId}-${idx}`;
          return(<div key={c.id} style={{...card,border:isEdit?"2px solid #FFD300":"1px solid #e8e8e3"}}>
            <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:6,marginBottom:isEdit?14:0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:8,flex:1,minWidth:0,flexWrap:"wrap"}}><span style={{fontFamily:FC,fontWeight:800,fontSize:14,background:"#000",color:"#FFD300",padding:"2px 8px",borderRadius:4}}>WK{c.week}</span><span style={{fontFamily:FC,fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</span>{!isMobile&&<span style={{fontSize:12,color:"#999"}}>{c.subtitle}</span>}</div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontFamily:FC,fontWeight:800,fontSize:12,color:"#007A33"}}>{c.points}pts</span>
                <span style={{fontFamily:FC,fontWeight:700,fontSize:12,color:"#FFB800"}}>+{c.bonusPoints}</span>
                <button onClick={()=>onPreviewChallenge&&onPreviewChallenge(c)} style={{padding:"6px 14px",background:"#000",color:"#FFD300",border:"none",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:"pointer"}}>PREVIEW</button>
                <button onClick={()=>setEditCh(isEdit?null:`${progId}-${idx}`)} style={{padding:"6px 14px",background:isEdit?"#FFD300":"#f5f5f0",border:"none",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:"pointer",transition:"all 0.15s"}}>{isEdit?"CLOSE":"EDIT"}</button>
              </div>
            </div>
            {isEdit&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["TITLE","title",c.title,"input"],["SUBTITLE","subtitle",c.subtitle,"input"],["DESCRIPTION","description",c.description,"textarea"],["DELIVERABLE","deliverable",c.deliverable,"input"],["TIP","tip",c.tip,"input"],["BONUS CONDITION","bonusCondition",c.bonusCondition,"input"]].map(([lbl,fld,val,type])=>(
                <div key={fld}><label style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5}}>{lbl}</label>
                  {type==="textarea"?<textarea value={val} onChange={e=>saveCh(progId,idx,fld,e.target.value)} rows={3} style={{...inp,resize:"vertical",marginTop:4}}/>
                  :<input value={val} onChange={e=>saveCh(progId,idx,fld,e.target.value)} style={{...inp,marginTop:4}}/>}
                </div>
              ))}
              <div><label style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5}}>ICON</label>
                <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4,flexWrap:"wrap"}}>
                  {(()=>{const ri=resolveChIcon(c);return ri?<div style={{width:36,height:36,background:"#000",borderRadius:8,padding:4,display:"flex",alignItems:"center",justifyContent:"center"}}>{typeof ri==="string"?<img src={ri} alt="" style={{width:28,height:28,objectFit:"contain"}}/>:ri}</div>:null;})()}
                  <button onClick={()=>{setIconPickerCurrent(c.icon||"");setIconPickerCb(()=>v=>saveCh(progId,idx,"icon",v));}} style={{...btnG,flex:1,minWidth:0,maxWidth:200,padding:"10px 14px",fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    {c.icon&&c.icon!=="none"?(ICON_LIBRARY_DEFS[c.icon]?.label||c.icon.replace(/_/g," ").toUpperCase()):"CHOOSE ICON"}
                  </button>
                  <label style={{...btnG,padding:"10px 14px",fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{const updated=JSON.parse(JSON.stringify(challenges));updated[progId][idx].icon="custom_"+Date.now();updated[progId][idx].customIcon=ev.target.result;onUpdateCh(updated);};reader.readAsDataURL(file);}}/></label>
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"flex-end",marginTop:4,flexWrap:"wrap"}}>
                <div style={{textAlign:"center"}}><label style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5}}>POINTS</label><input type="number" value={c.points} onChange={e=>saveCh(progId,idx,"points",parseInt(e.target.value)||0)} style={{...inp,width:70,textAlign:"center",marginTop:4}}/></div>
                <div style={{textAlign:"center"}}><label style={{fontSize:11,fontWeight:700,fontFamily:FC,color:"#999",letterSpacing:0.5}}>BONUS</label><input type="number" value={c.bonusPoints} onChange={e=>saveCh(progId,idx,"bonusPoints",parseInt(e.target.value)||0)} style={{...inp,width:70,textAlign:"center",marginTop:4}}/></div>
                <button onClick={()=>setEditCh(null)} style={{...btnY,flex:1,minWidth:80}}>DONE</button>
              </div>

              {/* Hazard Hunt Editor */}
              {c.type==="hazard_hunt"&&(
                <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
                  <div style={{...subLabel,fontSize:12,fontWeight:900,color:"#000"}}>HAZARD HUNT CONFIG</div>

                  {/* 360 Image */}
                  <div style={{marginBottom:12}}>
                    <div style={subLabel}>360 IMAGE</div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:12,color:"#666",fontFamily:FB}}>{acfg.hazard_hunt?.image||"/360-prep.jpg"}</span>
                      <label style={{...btnY,padding:"6px 12px",fontSize:11,display:"inline-flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                        UPLOAD<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const file=e.target.files[0];if(!file)return;const url=URL.createObjectURL(file);saveAcfg("hazard_hunt",{image:url});flash("Image set",true);}}/></label>
                    </div>
                  </div>

                  {/* Hotspot Opacity */}
                  <div style={{marginBottom:12}}>
                    <div style={subLabel}>HOTSPOT VISIBILITY</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <input type="range" min="0" max="1" step="0.1" value={acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1} onChange={e=>saveAcfg("hazard_hunt",{hotspotOpacity:parseFloat(e.target.value)})} style={{flex:1,accentColor:"#FFD300"}}/>
                      <span style={{fontFamily:FC,fontWeight:800,fontSize:12,minWidth:36}}>{Math.round((acfg.hazard_hunt?.hotspotOpacity!==undefined?acfg.hazard_hunt.hotspotOpacity:1)*100)}%</span>
                    </div>
                  </div>

                  {/* Game Settings */}
                  <div style={{marginBottom:16,background:"#f8f8f5",borderRadius:12,padding:14}}>
                    <div style={{...subLabel,marginBottom:10}}>GAME SETTINGS</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>TIMER (SEC)</label><input type="number" value={acfg.hazard_hunt?.timerDuration||90} onChange={e=>saveAcfg("hazard_hunt",{timerDuration:parseInt(e.target.value)||90})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>PTS PER HAZARD</label><input type="number" value={acfg.hazard_hunt?.ptsPerHazard||20} onChange={e=>saveAcfg("hazard_hunt",{ptsPerHazard:parseInt(e.target.value)||20})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>SPEED THRESHOLD (SEC)</label><input type="number" value={acfg.hazard_hunt?.speedThreshold||60} onChange={e=>saveAcfg("hazard_hunt",{speedThreshold:parseInt(e.target.value)||60})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>SPEED BONUS PTS</label><input type="number" value={acfg.hazard_hunt?.speedBonusPts||20} onChange={e=>saveAcfg("hazard_hunt",{speedBonusPts:parseInt(e.target.value)||20})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>DECOY AVOIDED PTS</label><input type="number" value={acfg.hazard_hunt?.decoyAvoidPts||10} onChange={e=>saveAcfg("hazard_hunt",{decoyAvoidPts:parseInt(e.target.value)||10})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                      <div><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>TEXT RESPONSE PTS</label><input type="number" value={acfg.hazard_hunt?.textResponsePts||20} onChange={e=>saveAcfg("hazard_hunt",{textResponsePts:parseInt(e.target.value)||20})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center"}}/></div>
                    </div>
                    <div style={{marginTop:10}}><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>DECOY PENALTY PTS</label><input type="number" value={acfg.hazard_hunt?.decoyPenalty||10} onChange={e=>saveAcfg("hazard_hunt",{decoyPenalty:parseInt(e.target.value)||10})} style={{...inp,marginTop:4,fontSize:13,textAlign:"center",maxWidth:120}}/></div>
                    <div style={{marginTop:10}}><label style={{fontSize:11,fontFamily:FC,fontWeight:700,color:"#888",letterSpacing:0.5}}>OPEN TEXT QUESTION</label><input value={acfg.hazard_hunt?.openQuestion||"What's the first thing you'd say to your crew about what you just saw?"} onChange={e=>saveAcfg("hazard_hunt",{openQuestion:e.target.value})} style={{...inp,marginTop:4,fontSize:13}}/></div>
                  </div>

                  {/* Hotspot Placement */}
                  <div style={{marginBottom:12}}>
                    <div style={subLabel}>HOTSPOT PLACEMENT</div>
                    {hotspotEditor?(
                      <div>
                        <div style={{position:"relative",height:250,borderRadius:12,overflow:"hidden",marginBottom:8}} ref={editorViewRef}>
                          <PanoViewer imgSrc={acfg.hazard_hunt?.image||HAZARD_IMG} onYawPitch={(y,p)=>setEditorYP({yaw:y,pitch:p})}/>
                          {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{
                            const vw=editorViewRef.current?.clientWidth||400;const vh=editorViewRef.current?.clientHeight||250;
                            const proj=projectToScreen(z.yaw,z.pitch,editorYP.yaw,editorYP.pitch,vw,vh);
                            if(!proj)return null;const sz=16*proj.scale;const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};
                            return <div key={z.id} style={{position:"absolute",left:proj.x-sz/2,top:proj.y-sz/2,width:sz,height:sz,borderRadius:"50%",background:fb2.hazard?"rgba(0,122,51,0.7)":"rgba(227,0,11,0.7)",border:"2px solid #fff",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:900}}>{zi+1}</div>;
                          })}
                          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:6,pointerEvents:"none",width:20,height:20,border:"2px solid #FFD300",borderRadius:"50%"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>addHotspot(editorYP.yaw,editorYP.pitch)} style={{...btnY,flex:1,fontSize:11,padding:"8px"}}>DROP HOTSPOT</button>
                          <button onClick={()=>setHotspotEditor(false)} style={{...btnG,fontSize:11,padding:"8px"}}>CLOSE</button>
                        </div>
                      </div>
                    ):(
                      <button onClick={()=>setHotspotEditor(true)} style={{...btnB,width:"100%",fontSize:11,padding:"8px"}}>OPEN 360 HOTSPOT EDITOR</button>
                    )}
                  </div>

                  {/* Hotspot List */}
                  <div style={subLabel}>HOTSPOTS ({(acfg.hazard_hunt?.zones||HAZARD_ZONES).length})</div>
                  {(acfg.hazard_hunt?.zones||HAZARD_ZONES).map((z,zi)=>{const fb2=(acfg.hazard_hunt?.feedback||HAZARD_FEEDBACK)[z.id]||{};return(
                    <div key={z.id} style={{background:"#f8f8f5",borderRadius:8,padding:10,marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{zi+1}</span>
                          <span style={{fontFamily:FC,fontWeight:700,fontSize:12}}>{fb2.title||z.id}</span>
                        </div>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>updateHotspotFb(z.id,"hazard",!fb2.hazard)} style={{padding:"3px 8px",borderRadius:4,border:"none",background:fb2.hazard?"#007A33":"#E3000B",color:"#fff",fontSize:10,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>{fb2.hazard?"HAZ":"DEC"}</button>
                          <button onClick={()=>removeHotspot(z.id)} style={{padding:"3px 8px",borderRadius:4,border:"none",background:"#f0f0eb",color:"#E3000B",fontSize:10,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>X</button>
                        </div>
                      </div>
                      <input value={fb2.title||""} onChange={e=>updateHotspotFb(z.id,"title",e.target.value)} placeholder="Title" style={{...inp,fontSize:12,padding:"6px 10px",marginBottom:4}}/>
                      <textarea value={fb2.desc||""} onChange={e=>updateHotspotFb(z.id,"desc",e.target.value)} placeholder="Feedback text" rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/>
                    </div>
                  );})}
                </div>
              )}

              {/* Shift in Chaos Editor */}
              {c.type==="thirty_second_sell"&&(
                <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
                  <div style={{...subLabel,fontSize:12,fontWeight:900,color:"#000"}}>30-SECOND SELL CONFIG</div>
                  <div style={{marginBottom:16,background:"#f8f8f5",borderRadius:12,padding:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                      <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Recording duration</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.thirty_second_sell?.timer||30} onChange={e=>saveAcfg("thirty_second_sell",{timer:parseInt(e.target.value)||30})} style={{...inp,width:60,textAlign:"center",padding:"8px"}}/><span style={{fontSize:11,color:"#999"}}>sec</span></div></div>
                      <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Camera</div><select value={acfg.thirty_second_sell?.camera||"user"} onChange={e=>saveAcfg("thirty_second_sell",{camera:e.target.value})} style={{...inp,fontSize:12,padding:"8px"}}><option value="user">Front (selfie)</option><option value="environment">Back</option></select></div>
                    </div>
                    <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Video resolution</div><select value={acfg.thirty_second_sell?.resolution||360} onChange={e=>saveAcfg("thirty_second_sell",{resolution:parseInt(e.target.value)})} style={{...inp,fontSize:12,padding:"8px"}}><option value={240}>240p (smallest)</option><option value={360}>360p (default)</option><option value={480}>480p</option><option value={720}>720p (large)</option></select></div>
                    <div style={{fontSize:11,color:"#888",fontFamily:FB,marginTop:8,lineHeight:1.4}}>Videos stored locally on device. Lower resolution = smaller files.</div>
                  </div>
                  <div style={{...subLabel,marginBottom:8}}>MENU ITEMS ({(acfg.thirty_second_sell?.items||SELL_ITEMS).length})</div>
                  <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:8}}>Each item gets one 30-second recording.</div>
                  {(acfg.thirty_second_sell?.items||SELL_ITEMS).map((item,ii)=>(
                    <div key={ii} style={{background:"#f8f8f5",borderRadius:8,padding:10,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{ii+1}</span>
                      <input value={item.name} onChange={e=>{const items=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS])];items[ii]={...items[ii],name:e.target.value};saveAcfg("thirty_second_sell",{items});}} style={{...inp,flex:1,fontSize:13,padding:"6px 10px"}}/>
                      <button onClick={()=>{const items=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS])];items.splice(ii,1);saveAcfg("thirty_second_sell",{items});}} style={{width:24,height:24,borderRadius:12,background:"#E3000B",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
                    </div>
                  ))}
                  <button onClick={()=>{const items=[...(acfg.thirty_second_sell?.items||[...SELL_ITEMS]),{id:`item_${Date.now()}`,name:"New Item"}];saveAcfg("thirty_second_sell",{items});}} style={{width:"100%",padding:"8px",background:"#fff",border:"1px dashed #ccc",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer",marginTop:4}}>+ ADD ITEM</button>
                </div>
              )}
              {c.type==="recovery_race"&&(
                <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
                  <div style={{...subLabel,fontSize:12,fontWeight:900,color:"#000"}}>RECOVERY RACE CONFIG</div>
                  <div style={{marginBottom:16,background:"#f8f8f5",borderRadius:12,padding:14}}>
                    <div style={{...subLabel,marginBottom:8}}>SCORING</div>
                    <div style={{display:"flex",gap:12,marginBottom:10}}>
                      <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Decision timer</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.recovery_race?.decisionTimer||8} onChange={e=>saveAcfg("recovery_race",{decisionTimer:parseInt(e.target.value)||8})} style={{...inp,width:60,textAlign:"center",padding:"8px"}}/><span style={{fontSize:11,color:"#999"}}>sec</span></div></div>
                      <div><div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:4}}>Bonus threshold</div><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={acfg.recovery_race?.bonusThreshold||75} onChange={e=>saveAcfg("recovery_race",{bonusThreshold:parseInt(e.target.value)||75})} style={{...inp,width:60,textAlign:"center",padding:"8px"}}/><span style={{fontSize:11,color:"#999"}}>%</span></div></div>
                    </div>
                    <div style={{fontSize:11,color:"#888",fontFamily:FB,lineHeight:1.4}}>Points = base x accuracy%. Bonus earned at {acfg.recovery_race?.bonusThreshold||75}%+ accuracy.</div>
                  </div>
                  <div style={{...subLabel,marginBottom:8}}>SCENARIOS ({(acfg.recovery_race?.scenarios||RECOVERY_SCENARIOS).length})</div>
                  {(acfg.recovery_race?.scenarios||RECOVERY_SCENARIOS).map((scen,si)=>(
                    <div key={scen.id||si} style={{background:"#f8f8f5",borderRadius:10,padding:12,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{si+1}</span>
                        <input value={scen.title} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],title:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,flex:1,fontWeight:700,fontSize:13,padding:"6px 10px"}}/>
                        <button onClick={()=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s.splice(si,1);saveAcfg("recovery_race",{scenarios:s});}} style={{width:24,height:24,borderRadius:12,background:"#E3000B",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
                      </div>
                      <div style={{marginBottom:8}}><div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:2}}>SETUP</div><textarea value={scen.setup} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],setup:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/></div>
                      <div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:4}}>DECISIONS ({scen.decisions.length})</div>
                      {scen.decisions.map((dec,di)=>(
                        <div key={di} style={{background:"#fff",borderRadius:6,padding:8,marginBottom:4,borderLeft:"3px solid #FFD300"}}>
                          <div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#999",marginBottom:4}}>STEP {di+1}</div>
                          {dec.situation&&<textarea value={dec.situation} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],situation:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} rows={1} style={{...inp,resize:"vertical",fontSize:11,padding:"4px 8px",marginBottom:4}}/>}
                          {dec.options.map((opt,oi)=>(
                            <div key={oi} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                              <span style={{width:8,height:8,borderRadius:4,background:opt.outcome==="good"?"#007A33":opt.outcome==="neutral"?"#FFB800":"#E3000B",flexShrink:0}}/>
                              <input value={opt.text} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],options:[...s[si].decisions[di].options]};s[si].decisions[di].options[oi]={...opt,text:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                              <select value={opt.outcome} onChange={e=>{const s=[...(acfg.recovery_race?.scenarios||[...RECOVERY_SCENARIOS])];s[si]={...s[si],decisions:[...s[si].decisions]};s[si].decisions[di]={...s[si].decisions[di],options:[...s[si].decisions[di].options]};s[si].decisions[di].options[oi]={...opt,outcome:e.target.value};saveAcfg("recovery_race",{scenarios:s});}} style={{...inp,width:70,fontSize:10,padding:"4px"}}>
                                <option value="good">Good</option><option value="neutral">Okay</option><option value="bad">Bad</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {c.type==="shift_leader_lens"&&(
                <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
                  <div style={{...subLabel,fontSize:12,fontWeight:900,color:"#000"}}>SHIFT LEADER LENS CONFIG</div>
                  <div style={{...subLabel,marginBottom:8}}>SITUATIONS ({(acfg.shift_leader_lens?.clips||SLL_CLIPS).length})</div>
                  <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:8}}>Each situation presents a scenario with multiple choice options.</div>
                  {(acfg.shift_leader_lens?.clips||SLL_CLIPS).map((clip,ci)=>(
                    <div key={clip.id||ci} style={{background:"#f8f8f5",borderRadius:10,padding:12,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,lineHeight:1}}>{ci+1}</span>
                        <input value={clip.title} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],title:e.target.value};saveAcfg("shift_leader_lens",{clips});}} style={{...inp,flex:1,fontWeight:700,fontSize:13,padding:"6px 10px"}}/>
                        <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips.splice(ci,1);saveAcfg("shift_leader_lens",{clips});}} style={{width:24,height:24,borderRadius:12,background:"#E3000B",color:"#fff",border:"none",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>x</button>
                      </div>
                      <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:2}}>SCENARIO</div><textarea value={clip.desc} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],desc:e.target.value};saveAcfg("shift_leader_lens",{clips});}} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/></div>
                      <div style={{marginBottom:6}}><div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:2}}>QUESTION</div><input value={clip.q} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],q:e.target.value};saveAcfg("shift_leader_lens",{clips});}} style={{...inp,fontSize:12,padding:"6px 10px"}}/></div>
                      <div style={{fontSize:10,color:"#888",fontFamily:FC,marginBottom:4}}>OPTIONS</div>
                      {clip.options.map((opt,oi)=>(
                        <div key={oi} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                          <span style={{fontFamily:FC,fontWeight:700,fontSize:10,color:"#999",width:16}}>{String.fromCharCode(65+oi)}</span>
                          <input value={opt} onChange={e=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:[...clips[ci].options]};clips[ci].options[oi]=e.target.value;saveAcfg("shift_leader_lens",{clips});}} style={{...inp,flex:1,fontSize:11,padding:"4px 8px"}}/>
                          <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:clips[ci].options.filter((_,i)=>i!==oi)};saveAcfg("shift_leader_lens",{clips});}} style={{width:18,height:18,borderRadius:9,background:"#ddd",color:"#999",border:"none",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
                        </div>
                      ))}
                      <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS])];clips[ci]={...clips[ci],options:[...clips[ci].options,"New option"]};saveAcfg("shift_leader_lens",{clips});}} style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#007A33",background:"none",border:"none",cursor:"pointer",padding:"4px 0"}}>+ ADD OPTION</button>
                    </div>
                  ))}
                  <button onClick={()=>{const clips=[...(acfg.shift_leader_lens?.clips||[...SLL_CLIPS]),{id:`c${Date.now()}`,title:"New Situation",desc:"Describe the scenario...",q:"What do you do?",options:["Option A","Option B","Option C","Option D"]}];saveAcfg("shift_leader_lens",{clips});}} style={{width:"100%",padding:"8px",background:"#fff",border:"1px dashed #ccc",borderRadius:8,fontFamily:FC,fontWeight:700,fontSize:12,cursor:"pointer",marginTop:4}}>+ ADD SITUATION</button>
                </div>
              )}
              {c.type==="shift_in_chaos"&&(
                <div style={{marginTop:16,borderTop:"1px solid #e8e8e3",paddingTop:16}}>
                  <div style={{...subLabel,fontSize:12,fontWeight:900,color:"#000"}}>SHIFT IN CHAOS CONFIG</div>

                  <div style={{marginBottom:16,background:"#f8f8f5",borderRadius:12,padding:14}}>
                    <div style={{...subLabel,marginBottom:8}}>SCENE BRIEFING</div>
                    <textarea value={acfg.shift_in_chaos?.briefing||"It's 12:05pm. Saturday. GYG is slammed. Everything below just happened in the last 10 minutes. Rank them 1-12 in order of what you deal with FIRST."} onChange={e=>saveAcfg("shift_in_chaos",{briefing:e.target.value})} rows={3} style={{...inp,resize:"vertical",fontSize:13}}/>
                    <div style={{...subLabel,marginTop:12,marginBottom:8}}>PREVENTION QUESTION</div>
                    <textarea value={acfg.shift_in_chaos?.preventionQ||"What's one thing that would have prevented this shift from getting to this point? Be specific about when it should have happened and who should have done it."} onChange={e=>saveAcfg("shift_in_chaos",{preventionQ:e.target.value})} rows={3} style={{...inp,resize:"vertical",fontSize:13}}/>
                  </div>

                  <div style={{...subLabel}}>PROBLEMS ({(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).length})</div>
                  <div style={{fontSize:11,color:"#888",fontFamily:FC,marginBottom:8}}>Order = expert ranking. Participants see shuffled.</div>
                  {(acfg.shift_in_chaos?.problems||CHAOS_PROBLEMS).map((p,pi)=>(
                    <div key={p.id||pi} style={{background:"#f8f8f5",borderRadius:8,padding:10,marginBottom:4}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                        <span style={{fontFamily:FC,fontWeight:900,fontSize:11,background:"#000",color:"#FFD300",width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:6}}>{pi+1}</span>
                        <div style={{flex:1}}>
                          <textarea value={p.text} onChange={e=>updateChaosProb(pi,"text",e.target.value)} rows={2} style={{...inp,resize:"vertical",fontSize:12,padding:"6px 10px"}}/>
                          <div style={{display:"flex",gap:4,marginTop:4}}>
                            {["safety","operational","cosmetic"].map(cat=>(
                              <button key={cat} onClick={()=>updateChaosProb(pi,"category",cat)} style={{padding:"3px 8px",borderRadius:4,border:"none",background:p.category===cat?(cat==="safety"?"#E3000B":cat==="operational"?"#FFD300":"#999"):"#f0f0eb",color:p.category===cat?"#fff":"#888",fontSize:10,fontFamily:FC,fontWeight:700,cursor:"pointer"}}>{cat.toUpperCase()}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>}
          </div>);
        })}
      </div>);
    })}
  </div>);

  /* ═══ LAYOUT ═══ */
  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f8f8f5",fontFamily:FB,color:"#1a1a1a"}}>
      {/* Sidebar - desktop */}
      {!isMobile&&(
        <div style={{width:240,background:"#0a0a0a",position:"fixed",top:0,left:0,bottom:0,display:"flex",flexDirection:"column",zIndex:50,overflowY:"auto"}}>
          <div style={{padding:"24px 20px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
              <img src={GYG_LOGO} alt="GYG" style={{width:36,height:36,objectFit:"contain"}}/>
              <div><div style={{fontFamily:F107,fontWeight:900,fontSize:18,color:"#fff",letterSpacing:0.5}}>ADMIN</div><div style={{fontSize:11,fontFamily:FC,fontWeight:600,color:"#555",letterSpacing:1}}>CHALLENGE HUB</div></div>
            </div>
          </div>
          <div style={{flex:1,padding:"4px 10px"}}>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>sT(n.id)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"13px 14px",background:tab===n.id?"rgba(255,211,0,0.08)":"none",border:"none",borderRadius:12,color:tab===n.id?"#FFD300":"#777",fontFamily:FC,fontWeight:700,fontSize:13,letterSpacing:0.3,cursor:"pointer",textAlign:"left",transition:"all 0.2s",marginBottom:2}}>{n.icon}<span>{n.label}</span></button>
            ))}
          </div>
          <div style={{padding:"16px 20px",borderTop:"1px solid #1a1a1a"}}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#555",letterSpacing:1,marginBottom:6}}>FILTER</div>
              <select value={fp} onChange={e=>{sFp(e.target.value);sFb("all");}} style={{width:"100%",padding:"10px 12px",background:"#151515",border:"1px solid #2a2a2a",borderRadius:10,color:"#aaa",fontSize:12,fontFamily:FC,fontWeight:600,marginBottom:6,outline:"none"}}>
                <option value="all">All Programs</option>{[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={fb} onChange={e=>sFb(e.target.value)} style={{width:"100%",padding:"10px 12px",background:"#151515",border:"1px solid #2a2a2a",borderRadius:10,color:"#aaa",fontSize:12,fontFamily:FC,fontWeight:600,outline:"none"}}>
                <option value="all">All Batches</option>{batches.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button onClick={onB} style={{width:"100%",padding:"11px",background:"#151515",border:"none",borderRadius:10,color:"#666",fontFamily:FC,fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:"pointer",transition:"all 0.2s"}}>Sign Out</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,marginLeft:isMobile?0:240}}>
        {/* Mobile header */}
        {isMobile&&(
          <div style={{position:"sticky",top:0,zIndex:100,background:"#0a0a0a",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <img src={GYG_LOGO} alt="GYG" style={{width:28,height:28,objectFit:"contain"}}/>
              <span style={{fontFamily:F107,fontWeight:900,fontSize:16,color:"#fff",letterSpacing:0.5}}>ADMIN</span>
            </div>
            <button onClick={()=>setSideOpen(!sideOpen)} style={{background:"none",border:"none",color:"#fff",padding:6,cursor:"pointer"}}>
              {sideOpen?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              :<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>}
            </button>
          </div>
        )}

        {/* Mobile menu overlay */}
        {isMobile&&sideOpen&&(
          <div style={{position:"fixed",top:56,left:0,right:0,bottom:0,background:"#0a0a0a",zIndex:99,padding:"20px 20px",display:"flex",flexDirection:"column",overflowY:"auto"}}>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>{sT(n.id);setSideOpen(false);}} style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"18px 12px",background:tab===n.id?"rgba(255,211,0,0.06)":"none",border:"none",borderRadius:12,color:tab===n.id?"#FFD300":"#888",fontFamily:FC,fontWeight:700,fontSize:15,letterSpacing:0.3,cursor:"pointer",textAlign:"left",marginBottom:2}}>{n.icon}<span>{n.label}</span></button>
            ))}
            <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #1a1a1a"}}>
              <div style={{fontSize:10,fontFamily:FC,fontWeight:700,color:"#555",letterSpacing:1,marginBottom:8}}>FILTER</div>
              <select value={fp} onChange={e=>{sFp(e.target.value);sFb("all");}} style={{width:"100%",padding:"12px 14px",background:"#151515",border:"1px solid #2a2a2a",borderRadius:12,color:"#aaa",fontSize:13,fontFamily:FC,fontWeight:600,marginBottom:8,outline:"none"}}>
                <option value="all">All Programs</option>{[PROGRAMS.lse,PROGRAMS.essentials,PROGRAMS.nextgen,PROGRAMS.elite].map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={fb} onChange={e=>sFb(e.target.value)} style={{width:"100%",padding:"12px 14px",background:"#151515",border:"1px solid #2a2a2a",borderRadius:12,color:"#aaa",fontSize:13,fontFamily:FC,fontWeight:600,outline:"none"}}>
                <option value="all">All Batches</option>{batches.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button onClick={onB} style={{marginTop:"auto",padding:"14px",background:"#151515",border:"none",borderRadius:12,color:"#666",fontFamily:FC,fontWeight:700,fontSize:13,letterSpacing:0.5,cursor:"pointer"}}>Sign Out</button>
          </div>
        )}

        {/* Mobile tab pills */}
        {isMobile&&!sideOpen&&(
          <div style={{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto",background:"#fff",borderBottom:"1px solid #f0f0eb",WebkitOverflowScrolling:"touch"}}>
            {navItems.map(n=><button key={n.id} onClick={()=>sT(n.id)} style={pill(tab===n.id)}>{n.label}</button>)}
          </div>
        )}

        {/* Desktop header bar */}
        {!isMobile&&(
          <div style={{padding:"18px 32px",background:"#fff",borderBottom:"1px solid #f0f0eb",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div><div style={{fontFamily:FC,fontWeight:800,fontSize:20,letterSpacing:0.3}}>{navItems.find(n=>n.id===tab)?.label||"Overview"}</div><div style={{fontSize:13,color:"#999",fontFamily:FB,marginTop:2}}>{totalU} participants - {totalC} submissions</div></div>
            <div style={{display:"flex",gap:8}}>{fp!=="all"&&<span style={{padding:"7px 14px 6px",borderRadius:20,lineHeight:1,background:"#FFD300",fontFamily:FC,fontWeight:700,fontSize:12,color:"#000"}}>{PROGRAMS[fp]?.short}</span>}{fb!=="all"&&<span style={{padding:"7px 14px 6px",borderRadius:20,lineHeight:1,background:"#1a1a1a",fontFamily:FC,fontWeight:700,fontSize:12,color:"#FFD300"}}>{fb}</span>}</div>
          </div>
        )}

        {/* Content area */}
        <div style={{padding:isMobile?"16px":"28px 32px",flex:1,maxWidth:1100,width:"100%",boxSizing:"border-box",margin:isMobile?"0":"0 auto"}}>
          {tab==="overview"&&renderOverview()}
          {tab==="content"&&renderContent()}
          {tab==="people"&&renderPeople()}
          {tab==="submissions"&&renderSubmissions()}
        </div>
      </div>

      {/* Image Lightbox */}
      {iconPickerCb&&<IconPicker current={iconPickerCurrent} onSelect={v=>{iconPickerCb(v);setIconPickerCb(null);}} onClose={()=>setIconPickerCb(null)}/>}
      {lightboxImg&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"pointer"}} onClick={()=>setLightboxImg(null)}>
        <button onClick={()=>setLightboxImg(null)} style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:20,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FC,fontWeight:700}}>X</button>
        <img src={lightboxImg} alt="" style={{maxWidth:"100%",maxHeight:"90vh",objectFit:"contain",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
      </div>}
    </div>
  );
}

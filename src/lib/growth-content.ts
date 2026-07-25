// Static content for the Daily Growth Hub tracks.
// Written in plain, beginner-friendly English (3–5 minute reads).

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Track = {
  id:
    | "biomed"
    | "aptitude"
    | "communication"
    | "critical"
    | "problem"
    | "coding"
    | "career";
  emoji: string;
  title: string;
  tagline: string;
  lesson: string; // markdown
  example: string; // markdown (scenario or code)
  quiz: QuizQuestion[];
};

export const TRACKS: Track[] = [
  {
    id: "biomed",
    emoji: "🧬",
    title: "Biomedical Engineering Basics",
    tagline: "Body + tech, explained simply.",
    lesson: `## Sensors are like your skin

Your skin feels heat, pressure, and pain — then sends signals to the brain.
Biomedical **sensors** do the same job for machines. An ECG electrode "feels"
tiny electrical signals from your heart, and sends them to a device that
draws them as a wavy line.

**Three things every biomedical sensor does:**

1. **Detects** a body signal (heartbeat, temperature, oxygen).
2. **Converts** it into an electrical signal.
3. **Sends** it to a monitor or a computer that can read it.

That's it. Everything from a smartwatch to a hospital monitor is just some
version of these three steps.`,
    example: `**Real life:** A pulse oximeter clipped on your finger shines a tiny red
light through your skin. Oxygen-rich blood absorbs light differently than
oxygen-poor blood. The sensor reads that difference and shows you a number
like "98%". No magic — just light + a very fast calculator.`,
    quiz: [
      {
        question: "What is the first job of a biomedical sensor?",
        options: [
          "Store data in the cloud",
          "Detect a body signal",
          "Print a report",
          "Charge a battery",
        ],
        answerIndex: 1,
        explanation:
          "A sensor first has to detect something (heartbeat, temperature, light) before anything else can happen.",
      },
      {
        question: "A pulse oximeter mainly measures…",
        options: [
          "Blood sugar",
          "Body temperature",
          "Oxygen level in blood",
          "Blood pressure",
        ],
        answerIndex: 2,
        explanation:
          "It shines light through your finger to estimate how much oxygen your blood is carrying.",
      },
      {
        question: "Which is NOT one of the three basic sensor steps?",
        options: ["Detect", "Convert", "Send", "Diagnose"],
        answerIndex: 3,
        explanation:
          "Sensors detect, convert, and send. Diagnosing is done by a doctor or a smarter system that reads the signals.",
      },
    ],
  },
  {
    id: "aptitude",
    emoji: "🧮",
    title: "Aptitude Challenge",
    tagline: "Short math tricks, step by step.",
    lesson: `## Percentages without panic

A percentage is just "out of 100". If a shirt is **20% off**, that means
for every ₹100, you save ₹20.

**The one trick you actually need:**

> To find X% of a number, multiply by X and divide by 100.

- 20% of 250 = 250 × 20 / 100 = **50**
- 15% of 80 = 80 × 15 / 100 = **12**

**Shortcut:** 10% of anything is just that number with the decimal moved
one place left. So 10% of 480 = 48. Then 20% is double that = 96.`,
    example: `**Real life:** A course costs ₹1,200 and there's a 25% student discount.
- 10% of 1200 = 120
- 25% = 120 × 2 + 60 = **300 off**
- You pay ₹1200 − ₹300 = **₹900**.`,
    quiz: [
      {
        question: "What is 15% of 200?",
        options: ["25", "30", "35", "40"],
        answerIndex: 1,
        explanation: "10% of 200 = 20, and 5% = 10, so 15% = 30.",
      },
      {
        question: "A phone drops from ₹10,000 to ₹8,000. What is the discount %?",
        options: ["10%", "15%", "20%", "25%"],
        answerIndex: 2,
        explanation: "You saved ₹2,000 out of ₹10,000 → 2000/10000 = 20%.",
      },
      {
        question: "10% of 750 is…",
        options: ["7.5", "75", "750", "0.75"],
        answerIndex: 1,
        explanation: "Move the decimal one place left: 750 → 75.",
      },
    ],
  },
  {
    id: "communication",
    emoji: "💬",
    title: "Communication Skills",
    tagline: "Speak & write so people actually listen.",
    lesson: `## The 3-line rule for clear messages

Long messages get ignored. Use this simple pattern for emails and chats:

1. **Point** — what you want, in one line.
2. **Reason** — why, in one line.
3. **Ask** — what you want them to do next.

**Weak:** "Hi sir, hope you're doing well, I was thinking about the project
and wondering if maybe we could possibly discuss it sometime if you're free…"

**Strong:**
- I'd like to submit my project a week later.
- I need extra time to finish the testing phase.
- Can we meet Tuesday at 4 PM to discuss?

Same message. Half the words. Twice as clear.`,
    example: `**Real life email to a professor:**

> Subject: Request to reschedule viva
>
> Hello Prof. Sharma,
> I'd like to reschedule my viva to Friday. I have a medical appointment
> on the current date. Would 10 AM Friday work for you?
>
> Thanks,
> Aditi`,
    quiz: [
      {
        question: "What should the FIRST line of a clear message do?",
        options: [
          "Apologize a lot",
          "Say the main point",
          "Explain your whole day",
          "Share a fun fact",
        ],
        answerIndex: 1,
        explanation:
          "Lead with the point. People decide in 2 seconds whether to keep reading.",
      },
      {
        question: "Which line is strongest?",
        options: [
          "Maybe we could kind of meet sometime?",
          "Can we meet Tuesday at 4 PM?",
          "I was just thinking about maybe a meeting",
          "Let me know your thoughts on meeting perhaps",
        ],
        answerIndex: 1,
        explanation: "It's specific: a day and a time. Easy to say yes or no.",
      },
      {
        question: "Good listening mostly means…",
        options: [
          "Waiting for your turn to talk",
          "Nodding constantly",
          "Understanding before replying",
          "Taking detailed notes always",
        ],
        answerIndex: 2,
        explanation: "Listening = understanding first, then responding.",
      },
    ],
  },
  {
    id: "critical",
    emoji: "🧠",
    title: "Critical Thinking",
    tagline: "Better decisions with less drama.",
    lesson: `## Ask "So what?" three times

When you read a claim, don't stop at the first thought. Ask **"So what?"**
three times to dig past the surface.

**Claim:** "This coaching guarantees a placement."
- So what? → Guarantees usually mean fine print.
- So what? → What if I don't clear the tests they set?
- So what? → Then the "guarantee" is worthless.

You've now gone from "sounds great!" to "what's the catch?" — that's
critical thinking. It's not about being negative; it's about not being
fooled by the first shiny sentence.`,
    example: `**Real life:** A YouTube video says "Learn Python in 1 hour."
- So what? → An hour teaches basics only.
- So what? → I still need weeks of practice.
- So what? → The title is a hook, not a plan.

You still watch it — but with realistic expectations.`,
    quiz: [
      {
        question: "The point of asking 'So what?' is to…",
        options: [
          "Annoy people",
          "Dig past the first impression",
          "Sound smart",
          "Win arguments",
        ],
        answerIndex: 1,
        explanation: "It forces you to look at consequences, not just claims.",
      },
      {
        question: "Critical thinking is mainly about…",
        options: [
          "Criticizing others",
          "Doubting everything forever",
          "Checking claims before believing",
          "Ignoring emotions",
        ],
        answerIndex: 2,
        explanation:
          "It's a habit of checking evidence before accepting a claim.",
      },
      {
        question: "Which is a critical-thinking question?",
        options: [
          "Who else agrees?",
          "How do we know this is true?",
          "Is it popular?",
          "Does it look nice?",
        ],
        answerIndex: 1,
        explanation:
          "'How do we know?' pushes you toward evidence and reasoning.",
      },
    ],
  },
  {
    id: "problem",
    emoji: "🧩",
    title: "Problem Solving",
    tagline: "Shrink the giant into small steps.",
    lesson: `## The "next 10 minutes" trick

Big problems freeze us because we try to solve them all at once. Instead,
ask: **"What can I do in the next 10 minutes?"**

**Big problem:** "I have a 30-page report due in 5 days."

Next 10 minutes:
- Open a blank document.
- Write the title and 5 section headings.
- Write 2 lines under the easiest heading.

That's it. You've now started, and starting is 80% of the battle. Repeat
this every hour and the report gets done without one heroic all-nighter.`,
    example: `**Real life:** "I need to build a college project."
- Next 10 min: pick 3 project ideas.
- Next 10 min: search each idea on GitHub.
- Next 10 min: pick one and list 3 features.

Three tiny steps and you're already ahead of most classmates.`,
    quiz: [
      {
        question: "Why do big problems feel stuck?",
        options: [
          "They're impossible",
          "We try to solve them all at once",
          "We don't care",
          "There's no Wi-Fi",
        ],
        answerIndex: 1,
        explanation:
          "The whole problem overwhelms us; a tiny next step doesn't.",
      },
      {
        question: "The '10 minutes' trick works because…",
        options: [
          "10 minutes is magical",
          "Small steps feel doable and build momentum",
          "It's a school rule",
          "It makes work last longer",
        ],
        answerIndex: 1,
        explanation:
          "Momentum beats motivation. Starting small removes the mental block.",
      },
      {
        question: "Best first step for a scary task?",
        options: [
          "Plan for a week",
          "Wait until you feel ready",
          "Do the smallest possible action now",
          "Ask 10 friends first",
        ],
        answerIndex: 2,
        explanation: "Any small action started now is worth more than a perfect plan later.",
      },
    ],
  },
  {
    id: "coding",
    emoji: "💻",
    title: "Coding Concept",
    tagline: "DSA explained like everyday life.",
    lesson: `## Arrays are like a row of lockers

An **array** is just a row of boxes (lockers) in a line. Each locker has
a **number** (index) starting from 0.

\`\`\`ts
const lockers = ["shoes", "bag", "book", "cap"];
// index:        0        1      2       3
lockers[2]; // "book"
\`\`\`

**Why 0 and not 1?** Think of the index as "how far from the first
locker". The first locker is 0 steps away from itself. Weird at first,
normal after a week.

**Fast:** grabbing any item by its number → \`arr[3]\`.
**Slow:** finding an item when you don't know where it is → you walk past
every locker.`,
    example: `\`\`\`ts
const marks = [72, 85, 90, 66];
let total = 0;
for (const m of marks) total += m;
const average = total / marks.length; // 78.25
\`\`\`

You walked through every "locker" once to add up the marks. That's an
**O(n)** loop — time grows with the number of items.`,
    quiz: [
      {
        question: "What is the index of the FIRST item in an array?",
        options: ["-1", "0", "1", "It depends"],
        answerIndex: 1,
        explanation: "Most languages start indexing at 0.",
      },
      {
        question: "Grabbing arr[5] directly is…",
        options: ["Slow", "Fast", "Impossible", "Random"],
        answerIndex: 1,
        explanation: "Arrays give you constant-time access when you know the index.",
      },
      {
        question: "Which task is O(n) on an array?",
        options: [
          "Read arr[0]",
          "Read arr.length",
          "Loop through every item",
          "Get the last item by index",
        ],
        answerIndex: 2,
        explanation: "Visiting every item once scales with n.",
      },
    ],
  },
  {
    id: "career",
    emoji: "🎯",
    title: "Career & Placement Tip",
    tagline: "Small moves that recruiters notice.",
    lesson: `## The 30-second self-intro

At every interview, someone will say: "Tell me about yourself." Have a
30-second answer ready. Use this template:

1. **Who** you are (name, year, branch).
2. **What** you're good at (1–2 skills with proof).
3. **Where** you want to go (the role you're applying for).

**Example:**
> I'm Aditi, a final-year Biomedical Engineering student. I love building
> health-tech projects — I recently made a heart-rate monitor using an
> Arduino and an ESP32. I'm looking for a hardware-software intern role
> where I can grow into full product development.

That's it. 30 seconds. Practice it out loud 5 times today and it's yours
forever.`,
    example: `**Real life:** On LinkedIn, replace "Student at XYZ College" with:
> "Biomedical Engineering student | building health-tech projects with
> Arduino & ESP32 | seeking hardware-software internships"

Same person, ten times more findable by recruiters.`,
    quiz: [
      {
        question: "A good self-intro is roughly…",
        options: ["10 seconds", "30 seconds", "3 minutes", "10 minutes"],
        answerIndex: 1,
        explanation:
          "About 30 seconds — long enough to say something real, short enough to hold attention.",
      },
      {
        question: "Which part gives your intro proof?",
        options: [
          "Your name",
          "Your year",
          "A concrete project or result",
          "Your zodiac sign",
        ],
        answerIndex: 2,
        explanation:
          "Skills mean little without evidence. A real project is your proof.",
      },
      {
        question: "Best LinkedIn headline?",
        options: [
          "Student",
          "Passionate learner",
          "Biomedical student | ESP32 health-tech projects | seeking internships",
          "Open to opportunities",
        ],
        answerIndex: 2,
        explanation:
          "Specific + searchable + shows a clear ask. Recruiters filter by keywords.",
      },
    ],
  },
];

export function trackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function levelFromXp(xp: number): { level: number; title: string; next: number } {
  const levels = [
    { min: 0, title: "Level 1: Curious Starter" },
    { min: 150, title: "Level 2: Growth Enthusiast" },
    { min: 400, title: "Level 3: Consistent Learner" },
    { min: 800, title: "Level 4: Sharp Thinker" },
    { min: 1500, title: "Level 5: Placement Ready" },
    { min: 2500, title: "Level 6: Growth Master" },
  ];
  let idx = 0;
  for (let i = 0; i < levels.length; i++) if (xp >= levels[i].min) idx = i;
  const next = levels[idx + 1]?.min ?? levels[idx].min + 1000;
  return { level: idx + 1, title: levels[idx].title, next };
}

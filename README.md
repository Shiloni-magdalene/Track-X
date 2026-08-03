# Academic AI

Act as an expert Full-Stack Developer and UI/UX Designer. I want to build a comprehensive "Student Academic & Placement Tracker AI Assistant." We will build this iteratively in 9 phases. Do not build everything at once. Today, we are doing Phase 1 & 2: Project Setup, UI Shell, and Database Architecture.

Tech Stack & UI:

React (Vite), Tailwind CSS, Shadcn UI (for clean, modern cards, progress bars, and forms), and Lucide React (for icons).

Must include a Dark/Light mode toggle.

Must be fully responsive (Mobile, Tablet, Desktop).

Backend: Firebase (Firestore & Authentication).

Phase 1: Firestore Database Schema Design Create a robust, scalable Firestore schema in a dedicated db_schema.js or types.ts file. The structure must be sub-collection friendly or relation-based for a single user. Here is the required schema map:

users: { uid, name, email, overallAcademicProgress, overallPlacementReadiness, ai_insights_cache }

subjects: { id, userId, name, credits, project: { componentsRequired, reportProgress, deadline, status }, assignment: { progress, deadline, status }, studyPlan: [{ topic, questionsStudied, totalQuestions }] }

exams: { id, userId, subjectId, type (CAT / Unit Test / Practical / EndSem), date, marks, targetMarks, syllabusCovered, revisionPercent, weakTopics, practicalData: { expCompletion, recordStatus, vivaPrep }, endSemData: { mockTests, confidenceLevel } }

skills: { id, userId, name, category (Technical), learningPercent, hoursStudied, projectsBuilt, practiceQuestions, confidence, lastUpdated }

aptitude: { id, userId, category (Quant/Logical/Verbal), topic, progressPercent, questionsSolved, accuracy, timePerQuestion, weaknessLevel, lastPracticed, revisionDue, difficulty, notes }

aptitude_mocks: { id, userId, date, totalScore, quantScore, logicalScore, verbalScore, accuracy, timeTaken, mistakes, improvementSuggestions }

leetcode: { id, userId, problemName, topic, difficulty, solvedDate, revisionNeeded, notes }

projects: { id, userId, name, status, deadline, githubLink, docProgress }

linkedin_tracker: { id, userId, type (Post/Certificate/Project), engagement, nextPostIdea }

certificates: { id, userId, name, platform, date, skillsLearned, resumeAdded, linkedInPosted }

Phase 2: Authentication & Layout Shell

Set up standard Email/Password and Google Auth using Firebase.

Create the main Layout component with a Sidebar navigation (Dashboard, Academics, Exams, Aptitude, Placements, Coding, Projects, AI Assistant).

Add a top App Bar with a Search filter, Notifications icon, User Profile, and Dark/Light mode toggle.

Action: Acknowledge this master plan, write the TypeScript interfaces/schema for the database, and build the Auth screen and the main empty Dashboard Layout shell.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5b4296e9-c2b8-47b6-bb93-3954e9c44264).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

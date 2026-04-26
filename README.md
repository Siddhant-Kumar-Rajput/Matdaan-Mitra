# MatDaan Mitra — मतदान मित्र
### Your Personal Election Guide for Indian Voters

MatDaan Mitra is a comprehensive, multilingual educational platform designed to empower Indian voters. By combining Google Gemini's advanced reasoning with real-time election data, it transforms complex election procedures into a simple, personalized journey.

---

## 🚀 Full Project Workflow

The application follows a structured, context-aware workflow to ensure every user receives information relevant to their specific situation.

### 1. Language Initialization
- **The Entry Point**: Users land on a vibrant language selection screen.
- **Localization**: Choosing a language (e.g., Hindi, Tamil, Bengali) immediately reconfigures the entire application's UI strings and sets the communication context for the Gemini AI.

### 2. Smart Adaptive Onboarding
- **Personalization**: A 4-step interactive flow asks about voter status (First-time vs. Returning), State, and Constituency.
- **AI Integration**: At the end of onboarding, the app makes a single background call to Gemini to pre-generate a personalized "Ready to Vote" checklist based on these answers.
- **Zero-Data Privacy**: All answers are stored in `sessionStorage` and never touch a backend server.

### 3. Central Command: The Dashboard
- **Live Updates**: The dashboard uses **Gemini Search Grounding** to fetch live election schedules and news directly from the web, showing active or upcoming elections in the user's specific state.
- **Module Hub**: Provides quick access to the three core educational modules.

### 4. Module 1: Am I Election-Ready?
- **Personalized Checklist**: View the AI-generated list of tasks (e.g., "Check name in electoral roll", "Collect EPIC card").
- **Booth Locator**: An embedded **Google Maps** view centered on the user's constituency helps visualize their voting area.
- **Actionable Reminders**: Integration with the **Google Calendar API** allows users to set a voting day reminder with a single click.

### 5. Module 2: How Elections Work
- **Interactive Timeline**: A vertical walkthrough of the 7 phases of an Indian election (Announcement to Oath).
- **Deep Dives**: Click any phase to get a Gemini-powered explanation of the legal and procedural requirements.
- **Gamification**: Includes a "What if?" scenario explorer and a quiz to validate knowledge.

### 6. Module 3: Myth vs Fact
- **Claim Verification**: Users can type any claim heard on social media.
- **AI Verdict**: Gemini classifies the claim as ✅ FACT, ❌ MYTH, or ⚠️ PARTIAL.
- **Responsible AI**: Cross-references claims with the **Google Fact Check Tools API** for added verification.

### 7. Persistent Assistance
- **MatDaan Mitra Assistant**: A floating chat icon available on every page.
- **Context-Awareness**: The assistant knows exactly which module the user is in and their profile details, providing instant, politically neutral answers without navigating away from the current task.

---

## 🛠 Project Standards & Documentation

For detailed technical specifications, design tokens, and file structures, please refer to:
- [PROJECT_SPECS.md](./PROJECT_SPECS.md) - Technical architecture and file mapping.
- [GEMINI.md](./GEMINI.md) - The AI Agent blueprint and system prompt logic.
- [AGENTS.md](./AGENTS.md) - Code quality, accessibility, and security rules.

---

*MatDaan karo. Apna haq pehchano.* 🗳  
*Vote. Know your right.*

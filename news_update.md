You are working on my EXISTING project codebase. Analyze the current architecture first, then implement only what I request while preserving all current flows, styling, navigation, responsiveness, onboarding logic, and existing functionality.

========================================
PRIMARY OBJECTIVE
========================================

My current project uses:
1. newsapi.org
2. Gemini model

Both are currently being called together for fetching news shown after onboarding on the dashboard.

I want to REPLACE that entire flow.

Instead of using newsapi.org, use Gemini ONLY.

Gemini should intelligently fetch, summarize, and provide current election-related updates specifically for INDIA using fresh Google-accessible public information.

========================================
REQUIRED BEHAVIOR
========================================

A) SPLASH SCREEN / APP STARTUP BACKGROUND PROCESSING

As soon as the splash screen appears:

1. Start background election data fetching immediately.
2. Do NOT block splash screen.
3. Do NOT delay onboarding.
4. Do NOT freeze UI.
5. Do NOT show loaders unless already present.
6. Run async in background silently.

Then:

Splash screen → onboarding process → dashboard

By the time user reaches dashboard:

✔ election updates should already be fetched if possible  
✔ if still fetching, show elegant fallback skeleton/loading state only inside dashboard card  
✔ no impact on navigation speed

========================================
B) NEWS CONTENT REQUIREMENT
========================================

Use Gemini to gather and generate relevant current election intelligence for India such as:

1. Upcoming elections in India
2. State elections
3. Municipal elections
4. By-elections
5. Election Commission announcements
6. Poll dates
7. Candidate filing deadlines
8. Counting dates
9. Model code of conduct updates
10. Voter registration deadlines
11. Key public election awareness notices
12. Important developments

Prioritize:

- India national relevance
- State-wise elections
- Verified / trustworthy sources
- Most recent data
- Clean concise summaries

========================================
C) DASHBOARD UI OUTPUT
========================================

On dashboard after onboarding:

Show a professional election insights widget/card containing:

1. Title:
   "India Election Updates"

2. Each card item should contain:
- headline
- short summary
- state (if applicable)
- election type
- important date
- urgency level
- source label
- freshness timestamp

3. Add smart categories:
- Upcoming
- Urgent
- Registration
- Results
- Awareness

4. Maintain current project UI theme.

========================================
D) PERFORMANCE REQUIREMENTS
========================================

Must optimize:

1. Non-blocking startup
2. Async parallel execution
3. Cache results locally
4. Avoid repeated Gemini calls
5. Refresh periodically
6. Retry gracefully on failure
7. Fallback cached data offline

========================================
E) SECURITY AUDIT MODE (REPORT ONLY)
========================================

Now inspect my FULL project (frontend + backend if available).

DO NOT auto-fix security issues.

Provide a complete security audit report containing:

1. Authentication weaknesses
2. Authorization issues
3. Token/session risks
4. Hardcoded secrets
5. API key exposure
6. .env mistakes
7. CORS risks
8. Rate limiting missing or weak
9. Injection risks
10. MongoDB risks
11. Input validation gaps
12. XSS possibilities
13. CSRF possibilities
14. Sensitive logs exposure
15. Password storage review
16. Dependency vulnerabilities
17. Unsafe local storage usage
18. Open routes
19. File upload risks
20. Error message leakage
21. Build exposure risks

For each issue provide:

- Severity (Low / Medium / High / Critical)
- Exact file / location
- Why it is risky
- Recommended fix
- Priority order

Also provide:

A. Overall security score out of 10  
B. Production readiness score  
C. Immediate critical fixes list  
D. Best practices currently already present  
E. Whether app is safe for public deployment now

========================================
F) DEVELOPMENT RULES
========================================

1. Do not break any current code.
2. Maintain existing architecture.
3. Maintain current routing.
4. Keep UI responsive.
5. Keep code modular.
6. Use clean production-grade code.
7. Explain every changed file.
8. Mention where old newsapi code was removed.
9. Mention how Gemini background fetch is triggered.
10. Mention caching strategy used.

========================================
G) FINAL OUTPUT FORMAT
========================================

Return in this order:

1. Architecture understanding of current project
2. Files to modify
3. Implementation plan
4. Final updated code
5. Security audit report
6. Performance improvements
7. Testing checklist
8. Deployment recommendations

Begin by scanning my existing codebase first.
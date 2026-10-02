# HelpDesk Student Assistance Queue

React 19 + Vite app demonstrating `useState`, `useEffect`, `useRef` and `useContext`.

## Run
```bash
npm install
npm run dev      # development server
npm test         # 11 automated tests covering the Task 6 table
npm run build    # production build
```
Requires Node.js 22.12+.

## Structure
```
src/
  main.jsx                     StrictMode > ThemeProvider > App
  App.jsx                      owns requests, filter, storageWarning; both effects
  queue.js                     isRequest, loadRequests, sorting, filtering, counts
  styles.css                   light/dark tokens, responsive layout
  context/ThemeContext.jsx     ThemeContext, ThemeProvider, useTheme
  components/Header.jsx         theme toggle
  components/RequestForm.jsx   controlled inputs, refs, validation
  components/QueueSummary.jsx  waiting / resolved / total
  components/RequestList.jsx   status filter + list (key = request.id)
  components/RequestCard.jsx   Resolve / Delete
```
Task 1's two temporary sample requests were used only to check the layout and
are not shipped, so the queue starts empty (required for the Task 6 test order).

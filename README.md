# Exam Mark Buddy

Build a website called "IGCSE Exam Marker" for a student named Saiinaav Gupta (Class 10 A).

DESIGN: Black background, plain and simple, no clutter. Clean serif/mono typography evoking an exam paper, with a deep red pen-mark accent color (like #b3251f) used for scores/ticks only. Minimal — no gradients, no busy animation, no generic template look. A footer visible on every screen reads "Saiinaav Gupta · 10 A".

STRUCTURE: A home/landing view with two large clickable options: "Literature (0475)" and "Language (0500)". Clicking either switches to that section within the same single-page app (tab-like navigation, no reload), with a clear way to go back to the home view.

CRITICAL RULE — the AI's job is strictly to MARK/GRADE the student's own handwritten work, never to write or generate exam answers. It must never produce a model answer, sample essay, or suggested response text under any circumstance — only evaluation, a numeric mark, and improvement feedback on what the student actually wrote.

LITERATURE (0475) SECTION:
- A dropdown to select the set text/poem: The Road, Bus Station, These Are The Times We Live In, The Enemies, Boxes, The Capital, Afternoon Nap, Plaits, Children of Wealth, Touch and Go, Things Fall Apart (Chinua Achebe), Blues for an Alabama Sky, A Taste of Honey (Shelagh Delaney).
- Two image upload fields, each supporting both camera capture (mobile) and file upload from gallery: one for the exam QUESTION photo, one for the student's handwritten ANSWER photo.
- A "Mark my answer" button.
- Always marked out of 25.

LANGUAGE (0500) SECTION:
- A selector for component: "Directed Writing" (marked out of 35) or "Composition — Narrative/Descriptive" (marked out of 40).
- Same two image upload fields (question photo + answer photo, camera-capable).
- A "Mark my answer" button.

BACKEND / GRADING LOGIC:
On submit, send both images plus the selected text/component context to an AI vision-and-text model that:
1. Reads the question and the student's handwritten answer from the photos.
2. Grades strictly against genuine Cambridge IGCSE assessment objectives for that paper:
   - Literature 0475 (out of 25 total): knowledge and understanding of the text/context; response to the writer's use of language, form and structure with personal engagement; quality of written communication and structured argument with textual support.
   - Language 0500 Directed Writing (out of 35): content/ideas relevant to task, audience, purpose and format; organisation and accuracy of expression.
   - Language 0500 Composition, narrative/descriptive (out of 40): content and structure; style and accuracy of expression.
3. Returns a clear numeric mark out of the correct total, plus detailed 150–250 word feedback written directly to the student: what they did well, what's weak or missing, and specific, concrete next steps to improve — never generic praise, never a rewritten or model answer.
4. If either image is blank, unreadable, or doesn't match (e.g. answer doesn't correspond to the question), it should say so clearly rather than guessing or inventing a mark.

RESULTS DISPLAY: After marking completes, show the mark prominently styled like a red pen score (e.g. "18 / 25"), followed by the full feedback in a clean readable block below. Include a clear button/action to mark another answer.

Keep the whole build fast, uncluttered, and serious — this is for real exam revision, not a toy or gimmick. Use Lovable Cloud/backend features as needed to implement the AI grading step securely (the API key for the grading model should live server-side, never exposed in frontend code).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e13b0fb-ca88-49ef-a8f2-c5c524101d1a).

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

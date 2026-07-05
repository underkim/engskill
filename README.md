# Easy English Coach

Easy English Coach is a Chrome extension for beginner English learners. It is designed for real web browsing: select an unknown English word or sentence on a page, study it, and save it to your wordbook with the source page.

## Main Features

- Capture unknown words or sentences directly from web pages.
- Show a small in-page action bubble after selecting English text.
- Start learning from the bubble, extension popup, or right-click menu.
- Save captured web expressions to the wordbook with their source page.
- Enrich saved words with online dictionary definitions and examples when available.
- Break sentences into beginner-friendly steps: meaning, chunks, key words, speaking, variations, and mini checks.
- Practice with online random quizzes and offline fallback questions.
- Track a daily 5-action goal, study streak, review count, and quiz accuracy.
- Get Coach recommendations based on saved words, review count, accuracy, and today's progress.

## Daily Routine

Use it for 5 minutes a day:

1. Open any web page with English text.
2. Drag an unknown word or sentence.
3. Click **학습** in the small bubble, or open the extension and click **선택 문장 가져오기**.
4. Study the meaning, chunks, and speaking practice.
5. Click **단어장에 넣기**.
6. Solve three quiz questions.

## Chrome Loading

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.

## Right-Click Menu

After selecting English text on a page:

- **Easy English Coach에서 학습하기** opens the expression in the learning flow.
- **Easy English Coach 단어장에 넣기** saves it through the wordbook flow.

## Project Structure

- `manifest.json`: Chrome extension settings.
- `popup.html`: Extension popup UI.
- `popup.js`: Wordbook, quiz, coach, and lesson logic.
- `content.js`: Reads page selections and shows the in-page learning bubble.
- `background.js`: Right-click menu, reminders, and cross-page message handling.
- `styles.css`: Popup styling.
- `icon128.png`: Extension icon.

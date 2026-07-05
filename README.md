# Easy English Coach

Easy English Coach is a beginner-friendly Chrome extension for learning English while browsing.

## Features

- Explain selected English text in simple Korean.
- Break sentences into beginner-friendly learning steps: meaning, chunks, key words, speaking, variations, and mini checks.
- Listen to English sentences with slow text-to-speech practice.
- Use sample lessons and copyable practice sentences.
- Save useful words and sentences to a personal wordbook.
- Practice with quick multiple-choice quizzes, even before saving words.
- Generate fully random online quizzes from live English word and dictionary APIs.
- Mix quiz types: choose the meaning, choose the word, and choose the spelling.
- Track a daily 5-action goal and study streak.
- Follow a simple 7-day beginner sprint plan.
- Get a gentle daily reminder when you have not studied yet.
- Use a right-click menu on any web page.
- Works without a server or paid API.

## Daily Routine

Use the extension for 5 minutes a day:

1. Select one English sentence on a web page.
2. Click the refresh button or use the right-click menu.
3. Read the simple meaning.
4. Save one useful expression.
5. Solve three random online quiz questions.

The progress bar and streak counter are designed to make steady practice easy.

## Online Random Quiz

The Quiz tab fetches random English words online, looks up their definitions, and creates a fresh question every time.

If the internet connection or API is unavailable, the extension automatically falls back to offline review questions.

## How to Load in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.

## How to Use

1. Select an English word or sentence on a web page.
2. Right-click and choose **Easy English Coach로 학습하기**.
3. Open the extension popup to see the simple explanation.
4. Save useful expressions and practice them in the Quiz tab.

## Project Structure

- `manifest.json`: Chrome extension settings.
- `popup.html`: Extension popup UI.
- `popup.js`: Wordbook, quiz, and explanation logic.
- `content.js`: Reads selected text from web pages.
- `background.js`: Right-click menu and message handling.
- `styles.css`: Popup styling.
- `icon128.png`: Extension icon.

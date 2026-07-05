# Easy English Coach

Easy English Coach is a beginner-friendly Chrome extension for learning English while browsing.

## Features

- Explain selected English text in simple Korean.
- Capture unknown words or sentences directly from web pages.
- Save captured web expressions to the wordbook with their source page.
- Fall back to direct page injection when a live web page cannot receive the normal extension message.
- Enrich saved web words with online dictionary definitions and examples when available.
- Break sentences into beginner-friendly learning steps: meaning, chunks, key words, speaking, variations, and mini checks.
- Listen to English sentences with slow text-to-speech practice.
- Use sample lessons and copyable practice sentences.
- Save useful words and sentences to a personal wordbook.
- Practice with quick multiple-choice quizzes, even before saving words.
- Generate fully random online quizzes from live English word and dictionary APIs.
- Mix quiz types: choose the meaning, choose the word, and choose the spelling.
- Track a daily 5-action goal and study streak.
- Use the Coach tab to get a next-action recommendation based on saved words, review count, accuracy, and today's progress.
- Jump directly from the Coach tab to sentence learning, random quiz, or wordbook review.
- Follow a simple 7-day beginner sprint plan.
- Get a gentle daily reminder when you have not studied yet.
- Use a right-click menu on any web page.
- Works without a server or paid API.

## Daily Routine

Use the extension for 5 minutes a day:

1. Select one English sentence on a web page.
2. Click **선택 문장 가져오기** or use the right-click menu.
3. Study the simple meaning, chunks, and speaking practice.
4. Save the expression to the wordbook with its web source.
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

1. Open any web page with English text.
2. Drag an unknown word or sentence.
3. Open the extension and click **선택 문장 가져오기**.
4. Study the expression and click **단어장에 넣기**.
5. Or right-click the selection and choose **Easy English Coach 단어장에 넣기**.

## Project Structure

- `manifest.json`: Chrome extension settings.
- `popup.html`: Extension popup UI.
- `popup.js`: Wordbook, quiz, and explanation logic.
- `content.js`: Reads selected text from web pages.
- `background.js`: Right-click menu and message handling.
- `styles.css`: Popup styling.
- `icon128.png`: Extension icon.

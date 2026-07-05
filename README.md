# Easy English Coach

Easy English Coach is a beginner-friendly Chrome extension for learning English while browsing.

## Features

- Explain selected English text in simple Korean.
- Save useful words and sentences to a personal wordbook.
- Practice saved words with quick multiple-choice quizzes.
- Use a right-click menu on any web page.
- Works without a server or paid API.

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

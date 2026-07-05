const input = document.querySelector("#englishInput");
const explanation = document.querySelector("#explanation");
const saveButton = document.querySelector("#saveButton");
const explainButton = document.querySelector("#explainButton");
const refreshSelection = document.querySelector("#refreshSelection");
const wordList = document.querySelector("#wordList");
const clearWords = document.querySelector("#clearWords");
const quizBox = document.querySelector("#quizBox");
const nextQuiz = document.querySelector("#nextQuiz");
const dailyProgress = document.querySelector("#dailyProgress");
const streakCount = document.querySelector("#streakCount");
const progressBar = document.querySelector("#progressBar");
const completeRoutine = document.querySelector("#completeRoutine");
const planGrid = document.querySelector("#planGrid");
const quizModeLabel = document.querySelector("#quizModeLabel");
const onlineQuizStatus = document.querySelector("#onlineQuizStatus");
const tabs = document.querySelectorAll(".tab");
const panels = {
  coach: document.querySelector("#coachPanel"),
  learn: document.querySelector("#learnPanel"),
  wordbook: document.querySelector("#wordbookPanel"),
  quiz: document.querySelector("#quizPanel")
};

const DAILY_GOAL = 5;
const RANDOM_WORD_URL = "https://random-word-api.herokuapp.com/word?number=12";
const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const beginnerDictionary = {
  hello: "안녕하세요",
  thanks: "고마워요",
  thank: "감사하다",
  sorry: "미안한",
  please: "부탁합니다",
  good: "좋은",
  great: "훌륭한",
  bad: "나쁜",
  easy: "쉬운",
  hard: "어려운",
  learn: "배우다",
  study: "공부하다",
  practice: "연습하다",
  speak: "말하다",
  listen: "듣다",
  read: "읽다",
  write: "쓰다",
  today: "오늘",
  tomorrow: "내일",
  yesterday: "어제",
  want: "원하다",
  need: "필요하다",
  like: "좋아하다",
  make: "만들다",
  take: "가져가다, 시간이 걸리다",
  give: "주다",
  help: "돕다",
  start: "시작하다",
  finish: "끝내다",
  work: "일하다, 일",
  school: "학교",
  friend: "친구",
  food: "음식",
  water: "물",
  time: "시간",
  english: "영어",
  can: "할 수 있다",
  will: "할 것이다",
  have: "가지다",
  go: "가다",
  come: "오다",
  see: "보다",
  know: "알다",
  think: "생각하다",
  feel: "느끼다",
  use: "사용하다"
};

const starterDeck = [
  makeStarter("I want water.", "나는 물을 원해요.", "I want coffee."),
  makeStarter("Can you help me?", "저를 도와줄 수 있나요?", "Can you call me?"),
  makeStarter("I like this food.", "나는 이 음식을 좋아해요.", "I like this song."),
  makeStarter("I need more time.", "나는 시간이 더 필요해요.", "I need your help."),
  makeStarter("Let's start today.", "오늘 시작해 봅시다.", "Let's study today.")
];

const sprintPlan = [
  "인사와 감사 표현",
  "원하는 것 말하기",
  "도움 요청하기",
  "좋아하는 것 말하기",
  "시간 표현 익히기",
  "짧은 문장 따라 말하기",
  "저장한 표현 복습하기"
];

document.addEventListener("DOMContentLoaded", async () => {
  await loadStoredSelection();
  renderSprintPlan();
  await renderWordbook();
  await renderProgress();
  await renderQuiz();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

explainButton.addEventListener("click", async () => {
  renderExplanation(input.value);
  await markStudy(1);
});

saveButton.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) {
    renderEmpty("저장할 영어를 먼저 입력하세요.");
    return;
  }

  const entry = buildEntry(text);
  const words = await getWords();
  const exists = words.some((item) => item.text.toLowerCase() === entry.text.toLowerCase());
  const nextWords = exists ? words : [entry, ...words];

  await chrome.storage.local.set({ words: nextWords });
  await markStudy(1);
  await renderWordbook();
  switchTab("wordbook");
});

refreshSelection.addEventListener("click", async () => {
  const text = await getActiveTabSelection();
  if (text) {
    input.value = text;
    renderExplanation(text);
    await markStudy(1);
    switchTab("learn");
  } else {
    renderEmpty("현재 페이지에서 선택된 영어 문장을 찾지 못했습니다.");
    switchTab("learn");
  }
});

clearWords.addEventListener("click", async () => {
  await chrome.storage.local.set({ words: [] });
  await renderWordbook();
  await renderQuiz();
});

nextQuiz.addEventListener("click", renderQuiz);

completeRoutine.addEventListener("click", async () => {
  await markStudy(DAILY_GOAL);
  await renderProgress();
});

function switchTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  Object.entries(panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });

  if (tabName === "quiz") {
    renderQuiz();
  }
}

async function loadStoredSelection() {
  const { selectedText } = await chrome.storage.local.get(["selectedText"]);
  if (selectedText) {
    input.value = selectedText;
    renderExplanation(selectedText);
  }
}

async function getActiveTabSelection() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return "";
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION" });
    return response?.text?.trim() || "";
  } catch (_error) {
    return "";
  }
}

function renderExplanation(text) {
  const entry = buildEntry(text);
  if (!entry.text) {
    renderEmpty("영어를 입력하면 초보자용 뜻, 핵심 단어, 따라 말하기 문장을 보여드립니다.");
    return;
  }

  const keyWords = extractKnownWords(entry.text);
  const keyWordItems = keyWords.length
    ? keyWords.map((word) => `<li><strong>${escapeHtml(word)}</strong>: ${escapeHtml(beginnerDictionary[word])}</li>`).join("")
    : "<li>아는 단어가 적어도 괜찮아요. 문장을 짧게 나눠서 천천히 읽어보세요.</li>";

  explanation.innerHTML = `
    <h3>쉬운 뜻</h3>
    <p>${escapeHtml(entry.meaning)}</p>
    <h3>핵심 단어</h3>
    <ul>${keyWordItems}</ul>
    <h3>따라 말하기</h3>
    <p class="speak-line">${escapeHtml(entry.example)}</p>
    <p class="tip">소리 내어 3번 읽으면 오늘 목표가 더 빨리 쌓입니다.</p>
  `;
}

function renderEmpty(message) {
  explanation.innerHTML = `<p class="empty">${escapeHtml(message)}</p>`;
}

function buildEntry(rawText) {
  const text = rawText.trim().replace(/\s+/g, " ");
  const words = extractWords(text);
  const knownWords = extractKnownWords(text);
  const meaning = knownWords.length
    ? knownWords.map((word) => `${word} = ${beginnerDictionary[word]}`).join(", ")
    : "아직 기본 사전에 없는 표현입니다. 그대로 저장하고 퀴즈로 반복해 보세요.";

  const example = words.length > 1
    ? `I can say: ${text}`
    : `I want to use "${text}" today.`;

  return {
    id: crypto.randomUUID(),
    text,
    meaning,
    example,
    reviewCount: 0,
    correctCount: 0,
    createdAt: Date.now()
  };
}

function extractWords(text) {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

function extractKnownWords(text) {
  const uniqueWords = [...new Set(extractWords(text))];
  return uniqueWords.filter((word) => beginnerDictionary[word]).slice(0, 5);
}

async function getWords() {
  const { words = [] } = await chrome.storage.local.get(["words"]);
  return words;
}

async function renderWordbook() {
  const words = await getWords();

  if (!words.length) {
    wordList.innerHTML = '<li class="empty">아직 저장된 표현이 없습니다. 학습 탭에서 문장을 저장해 보세요.</li>';
    return;
  }

  wordList.innerHTML = words.map((entry) => `
    <li class="word-item">
      <div class="word-top">
        <p class="word-text">${escapeHtml(entry.text)}</p>
        <button class="remove-word" type="button" data-id="${entry.id}">삭제</button>
      </div>
      <p class="word-meaning">${escapeHtml(entry.meaning)}</p>
      <p class="review-meta">복습 ${entry.reviewCount || 0}회 · 정답 ${entry.correctCount || 0}회</p>
    </li>
  `).join("");

  document.querySelectorAll(".remove-word").forEach((button) => {
    button.addEventListener("click", async () => {
      const nextWords = words.filter((entry) => entry.id !== button.dataset.id);
      await chrome.storage.local.set({ words: nextWords });
      await renderWordbook();
      await renderQuiz();
    });
  });
}

async function renderQuiz() {
  setQuizLoading();

  try {
    const quiz = await buildOnlineQuiz();
    renderQuizQuestion(quiz, true);
  } catch (_error) {
    const fallbackQuiz = await buildOfflineQuiz();
    renderQuizQuestion(fallbackQuiz, false);
  }
}

function setQuizLoading() {
  quizModeLabel.textContent = "온라인 랜덤";
  onlineQuizStatus.textContent = "LOADING";
  onlineQuizStatus.classList.remove("offline");
  quizBox.innerHTML = '<p class="empty">온라인에서 랜덤 단어와 뜻을 가져오는 중입니다.</p>';
  nextQuiz.disabled = true;
}

async function buildOnlineQuiz() {
  const randomWords = await fetchJson(RANDOM_WORD_URL, 7000);
  const cleanWords = [...new Set(randomWords)]
    .map((word) => String(word).toLowerCase().trim())
    .filter((word) => /^[a-z]{3,12}$/.test(word))
    .slice(0, 8);

  const dictionaryItems = await Promise.all(cleanWords.map(fetchDictionaryItem));
  const items = dictionaryItems.filter(Boolean).slice(0, 4);

  if (items.length < 4) {
    throw new Error("Not enough online quiz items");
  }

  return makeRandomQuiz(items, "online");
}

async function fetchDictionaryItem(word) {
  try {
    const entries = await fetchJson(`${DICTIONARY_URL}${encodeURIComponent(word)}`, 7000);
    const firstMeaning = entries?.[0]?.meanings?.find((meaning) => meaning.definitions?.[0]?.definition);
    const definition = firstMeaning?.definitions?.[0]?.definition;
    const example = firstMeaning?.definitions?.find((item) => item.example)?.example || `I learned the word "${word}" today.`;

    if (!definition || definition.length > 140) {
      return null;
    }

    return {
      id: `online-${word}-${Date.now()}`,
      text: word,
      meaning: definition,
      example,
      partOfSpeech: firstMeaning.partOfSpeech || "word"
    };
  } catch (_error) {
    return null;
  }
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function buildOfflineQuiz() {
  const savedWords = await getWords();
  const quizWords = savedWords.length >= 4 ? savedWords : starterDeck;
  return makeRandomQuiz(shuffle(quizWords).slice(0, 4), "offline");
}

function makeRandomQuiz(items, source) {
  const answer = sample(items);
  const mode = sample(["meaning", "reverse", "spelling"]);

  if (mode === "reverse") {
    return {
      source,
      mode,
      answer,
      title: "뜻을 보고 단어 고르기",
      question: answer.meaning,
      choices: shuffle(items.map((item) => item.text)),
      correctText: answer.text
    };
  }

  if (mode === "spelling") {
    return {
      source,
      mode,
      answer,
      title: "스펠링 고르기",
      question: makeBlankWord(answer.text),
      choices: shuffle([answer.text, ...makeSpellingDistractors(answer.text)]),
      correctText: answer.text
    };
  }

  return {
    source,
    mode,
    answer,
    title: "단어 뜻 맞히기",
    question: answer.text,
    choices: shuffle(items.map((item) => item.meaning)),
    correctText: answer.meaning
  };
}

function renderQuizQuestion(quiz, isOnline) {
  quizModeLabel.textContent = isOnline ? "온라인 랜덤" : "오프라인 복습";
  onlineQuizStatus.textContent = isOnline ? "ONLINE" : "OFFLINE";
  onlineQuizStatus.classList.toggle("offline", !isOnline);
  nextQuiz.disabled = false;

  quizBox.innerHTML = `
    <p class="quiz-meta">${escapeHtml(quiz.title)}</p>
    <h3>${escapeHtml(quiz.question)}</h3>
    <p class="quiz-question">${getQuizHelpText(quiz)}</p>
    ${quiz.choices.map((choice) => `<button class="choice" type="button">${escapeHtml(choice)}</button>`).join("")}
    <p class="feedback" aria-live="polite"></p>
  `;

  quizBox.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", async () => {
      const isCorrect = button.textContent === quiz.correctText;
      button.classList.add(isCorrect ? "correct" : "wrong");
      quizBox.querySelector(".feedback").textContent = isCorrect
        ? `정답입니다! 예문: ${quiz.answer.example}`
        : `정답은 "${quiz.correctText}" 입니다.`;

      await saveQuizResult(quiz.answer.id, isCorrect);
      await markStudy(1);
    });
  });
}

function getQuizHelpText(quiz) {
  if (quiz.mode === "reverse") {
    return "뜻에 가장 잘 맞는 영어 단어를 고르세요.";
  }

  if (quiz.mode === "spelling") {
    return "빈칸에 들어갈 정확한 스펠링을 고르세요.";
  }

  return "영어 단어에 가장 잘 맞는 뜻을 고르세요.";
}

function makeBlankWord(word) {
  if (word.length <= 3) {
    return `${word[0]} _ ${word[word.length - 1]}`;
  }

  const middle = "_".repeat(Math.min(4, word.length - 2));
  return `${word[0]}${middle}${word[word.length - 1]}`;
}

function makeSpellingDistractors(word) {
  const letters = word.split("");
  const swapped = [...letters];
  if (swapped.length > 3) {
    [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
  }

  const dropped = letters.filter((_, index) => index !== Math.max(1, Math.floor(letters.length / 2))).join("");
  const doubled = `${word}${word[word.length - 1]}`;
  return [...new Set([swapped.join(""), dropped, doubled])].filter((item) => item !== word).slice(0, 3);
}

async function saveQuizResult(answerId, isCorrect) {
  if (!answerId || answerId.startsWith("online-") || answerId.startsWith("starter-")) {
    return;
  }

  const words = await getWords();
  const nextWords = words.map((entry) => {
    if (entry.id !== answerId) {
      return entry;
    }

    return {
      ...entry,
      reviewCount: (entry.reviewCount || 0) + 1,
      correctCount: (entry.correctCount || 0) + (isCorrect ? 1 : 0),
      lastReviewedAt: Date.now()
    };
  });

  await chrome.storage.local.set({ words: nextWords });
  await renderWordbook();
}

async function markStudy(amount) {
  const stats = await getStats();
  const today = getDateKey();
  const yesterday = getDateKey(-1);
  const isNewDay = stats.lastStudyDate !== today;
  const streak = isNewDay
    ? (stats.lastStudyDate === yesterday ? (stats.streak || 0) + 1 : 1)
    : stats.streak || 1;

  const nextStats = {
    ...stats,
    streak,
    lastStudyDate: today,
    todayCount: Math.min(DAILY_GOAL, (isNewDay ? 0 : stats.todayCount || 0) + amount),
    totalActions: (stats.totalActions || 0) + amount
  };

  await chrome.storage.local.set({ stats: nextStats });
  await renderProgress();
}

async function getStats() {
  const { stats = {} } = await chrome.storage.local.get(["stats"]);
  const today = getDateKey();

  if (stats.lastStudyDate && stats.lastStudyDate !== today) {
    return { ...stats, todayCount: 0 };
  }

  return {
    streak: 0,
    todayCount: 0,
    totalActions: 0,
    ...stats
  };
}

async function renderProgress() {
  const stats = await getStats();
  const count = Math.min(DAILY_GOAL, stats.todayCount || 0);
  dailyProgress.textContent = `${count} / ${DAILY_GOAL}`;
  streakCount.textContent = `${stats.streak || 0}일`;
  progressBar.style.width = `${(count / DAILY_GOAL) * 100}%`;
}

function renderSprintPlan() {
  planGrid.innerHTML = sprintPlan.map((title, index) => `
    <article class="plan-item">
      <strong>Day ${index + 1}</strong>
      <span>${escapeHtml(title)}</span>
    </article>
  `).join("");
}

function makeStarter(text, meaning, example) {
  return {
    id: `starter-${text}`,
    text,
    meaning,
    example,
    reviewCount: 0,
    correctCount: 0,
    createdAt: 0
  };
}

function getDateKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

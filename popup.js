const input = document.querySelector("#englishInput");
const explanation = document.querySelector("#explanation");
const saveButton = document.querySelector("#saveButton");
const explainButton = document.querySelector("#explainButton");
const refreshSelection = document.querySelector("#refreshSelection");
const wordList = document.querySelector("#wordList");
const clearWords = document.querySelector("#clearWords");
const quizBox = document.querySelector("#quizBox");
const nextQuiz = document.querySelector("#nextQuiz");
const tabs = document.querySelectorAll(".tab");
const panels = {
  learn: document.querySelector("#learnPanel"),
  wordbook: document.querySelector("#wordbookPanel"),
  quiz: document.querySelector("#quizPanel")
};

const beginnerDictionary = {
  hello: "안녕하세요",
  thanks: "고마워요",
  thank: "감사하다",
  sorry: "미안한",
  please: "제발, 부탁합니다",
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
  english: "영어"
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadStoredSelection();
  await renderWordbook();
  renderQuiz();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

explainButton.addEventListener("click", () => {
  renderExplanation(input.value);
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
  await renderWordbook();
  switchTab("wordbook");
});

refreshSelection.addEventListener("click", async () => {
  const text = await getActiveTabSelection();
  if (text) {
    input.value = text;
    renderExplanation(text);
  } else {
    renderEmpty("현재 페이지에서 선택된 영어 문장을 찾지 못했습니다.");
  }
});

clearWords.addEventListener("click", async () => {
  await chrome.storage.local.set({ words: [] });
  await renderWordbook();
  renderQuiz();
});

nextQuiz.addEventListener("click", renderQuiz);

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
    renderEmpty("영어를 입력하면 초보자용 뜻, 핵심 단어, 예문을 보여드립니다.");
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
    <h3>연습 문장</h3>
    <p>${escapeHtml(entry.example)}</p>
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
    : "이 표현은 아직 기본 사전에 없지만, 짧은 단어부터 표시하고 반복해서 익힐 수 있습니다.";

  const example = words.length > 1
    ? `I can understand "${text}" step by step.`
    : `I want to use "${text}" today.`;

  return {
    id: crypto.randomUUID(),
    text,
    meaning,
    example,
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
    wordList.innerHTML = '<li class="empty">아직 저장된 표현이 없습니다.</li>';
    return;
  }

  wordList.innerHTML = words.map((entry) => `
    <li class="word-item">
      <div class="word-top">
        <p class="word-text">${escapeHtml(entry.text)}</p>
        <button class="remove-word" type="button" data-id="${entry.id}">삭제</button>
      </div>
      <p class="word-meaning">${escapeHtml(entry.meaning)}</p>
    </li>
  `).join("");

  document.querySelectorAll(".remove-word").forEach((button) => {
    button.addEventListener("click", async () => {
      const nextWords = words.filter((entry) => entry.id !== button.dataset.id);
      await chrome.storage.local.set({ words: nextWords });
      await renderWordbook();
      renderQuiz();
    });
  });
}

async function renderQuiz() {
  const words = await getWords();

  if (words.length < 2) {
    quizBox.innerHTML = '<p class="empty">단어장에 2개 이상 저장하면 퀴즈를 시작할 수 있습니다.</p>';
    return;
  }

  const answer = sample(words);
  const choices = shuffle([
    answer.meaning,
    ...shuffle(words.filter((word) => word.id !== answer.id)).slice(0, 2).map((word) => word.meaning)
  ]);

  quizBox.innerHTML = `
    <h3>${escapeHtml(answer.text)}</h3>
    <p>가장 알맞은 쉬운 뜻을 고르세요.</p>
    ${choices.map((choice) => `<button class="choice" type="button" data-answer="${escapeHtml(answer.meaning)}">${escapeHtml(choice)}</button>`).join("")}
    <p class="feedback" aria-live="polite"></p>
  `;

  quizBox.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      const isCorrect = button.textContent === answer.meaning;
      button.classList.add(isCorrect ? "correct" : "wrong");
      quizBox.querySelector(".feedback").textContent = isCorrect ? "정답입니다!" : `정답은 "${answer.meaning}" 입니다.`;
    });
  });
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

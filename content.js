let coachBubble = null;
let lastSelection = null;

function getSelectedEnglishText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : "";
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_SELECTION") {
    sendResponse({ text: getSelectedEnglishText(), source: getPageSource() });
  }
});

document.addEventListener("mouseup", () => {
  window.setTimeout(captureAndShowBubble, 10);
});

document.addEventListener("mousedown", (event) => {
  if (coachBubble?.contains(event.target)) {
    return;
  }

  hideCoachBubble();
});

document.addEventListener("scroll", hideCoachBubble, true);

function captureAndShowBubble() {
  const text = getSelectedEnglishText();
  if (!isUsefulEnglishSelection(text)) {
    hideCoachBubble();
    return;
  }

  lastSelection = {
    text,
    source: getPageSource()
  };

  chrome.runtime.sendMessage({
    type: "CAPTURE_SELECTION",
    text,
    source: lastSelection.source,
    saveIntent: false
  });

  showCoachBubble(text);
}

function showCoachBubble(text) {
  const rect = getSelectionRect();
  if (!rect) {
    return;
  }

  hideCoachBubble();

  coachBubble = document.createElement("easy-english-coach-bubble");
  Object.assign(coachBubble.style, {
    position: "fixed",
    left: `${Math.min(Math.max(12, rect.left), window.innerWidth - 224)}px`,
    top: `${Math.max(12, rect.top - 74)}px`,
    zIndex: "2147483647",
    width: "212px"
  });

  const shadow = coachBubble.attachShadow({ mode: "closed" });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .card {
        border: 1px solid #d9dee8;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
        background: #ffffff;
        color: #1f2937;
        font-family: Arial, sans-serif;
        padding: 10px;
        box-sizing: border-box;
      }
      .title {
        margin-bottom: 8px;
        color: #374151;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      button {
        min-height: 32px;
        border: 1px solid #2563eb;
        border-radius: 8px;
        background: #ffffff;
        color: #2563eb;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight: 800;
      }
      button.primary {
        background: #2563eb;
        color: #ffffff;
      }
      button:hover {
        filter: brightness(0.97);
      }
    </style>
    <div class="card">
      <div class="title">${escapeHtml(trimLabel(text))}</div>
      <div class="actions">
        <button class="primary" type="button" data-action="learn">학습</button>
        <button type="button" data-action="save">단어장</button>
      </div>
    </div>
  `;

  shadow.querySelectorAll("button").forEach((button) => {
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => handleBubbleAction(button.dataset.action));
  });

  document.documentElement.appendChild(coachBubble);
}

function handleBubbleAction(action) {
  if (!lastSelection?.text) {
    return;
  }

  chrome.runtime.sendMessage({
    type: "CAPTURE_SELECTION",
    text: lastSelection.text,
    source: lastSelection.source,
    saveIntent: action === "save",
    openPopup: true
  });

  hideCoachBubble();
}

function hideCoachBubble() {
  coachBubble?.remove();
  coachBubble = null;
}

function getSelectionRect() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (!rect.width && !rect.height) {
    return null;
  }

  return rect;
}

function getPageSource() {
  return {
    title: document.title || "Web page",
    url: location.href
  };
}

function isUsefulEnglishSelection(text) {
  return /^[\s\w'",.!?;:()\-]+$/.test(text) && /[a-zA-Z]/.test(text) && text.length >= 2;
}

function trimLabel(text) {
  return text.length > 56 ? `${text.slice(0, 54)}...` : text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

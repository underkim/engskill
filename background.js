const CONTEXT_MENU_LEARN_ID = "easy-english-coach-learn";
const CONTEXT_MENU_SAVE_ID = "easy-english-coach-save";
const DAILY_ALARM_ID = "easy-english-daily-reminder";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_LEARN_ID,
    title: "Easy English Coach에서 학습하기",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_SAVE_ID,
    title: "Easy English Coach 단어장에 넣기",
    contexts: ["selection"]
  });

  chrome.alarms.create(DAILY_ALARM_ID, {
    periodInMinutes: 24 * 60,
    delayInMinutes: 60
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (![CONTEXT_MENU_LEARN_ID, CONTEXT_MENU_SAVE_ID].includes(info.menuItemId) || !info.selectionText) {
    return;
  }

  await captureSelection({
    text: info.selectionText,
    source: {
      title: info.pageUrl || "Web page",
      url: info.pageUrl || ""
    },
    pendingSave: info.menuItemId === CONTEXT_MENU_SAVE_ID
  });

  chrome.action.openPopup();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "CAPTURE_SELECTION" || !message.text) {
    return;
  }

  captureSelection({
    text: message.text,
    source: message.source || {},
    pendingSave: Boolean(message.saveIntent)
  }).then(() => sendResponse({ ok: true }));

  return true;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== DAILY_ALARM_ID) {
    return;
  }

  const { stats = {} } = await chrome.storage.local.get(["stats"]);
  const today = getLocalDateKey();

  if (stats.lastStudyDate === today) {
    return;
  }

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: "Easy English Coach",
    message: "오늘 웹에서 모르는 영어 하나만 선택해서 단어장에 넣어볼까요?"
  });
});

async function captureSelection({ text, source, pendingSave }) {
  await chrome.storage.local.set({
    selectedText: text.trim(),
    selectedAt: Date.now(),
    selectedSource: {
      title: source.title || "Web page",
      url: source.url || ""
    },
    pendingSave
  });
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

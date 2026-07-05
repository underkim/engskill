const CONTEXT_MENU_ID = "easy-english-coach-learn";
const DAILY_ALARM_ID = "easy-english-daily-reminder";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Easy English Coach로 학습하기",
    contexts: ["selection"]
  });

  chrome.alarms.create(DAILY_ALARM_ID, {
    periodInMinutes: 24 * 60,
    delayInMinutes: 60
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText) {
    return;
  }

  await chrome.storage.local.set({
    selectedText: info.selectionText.trim(),
    selectedAt: Date.now()
  });

  chrome.action.openPopup();
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
    message: "오늘 5분만 영어 루틴을 해볼까요? 짧게 해도 꾸준하면 실력이 쌓입니다."
  });
});

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

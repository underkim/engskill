const CONTEXT_MENU_ID = "easy-english-coach-learn";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Easy English Coach로 학습하기",
    contexts: ["selection"]
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

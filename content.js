function getSelectedEnglishText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : "";
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_SELECTION") {
    sendResponse({ text: getSelectedEnglishText() });
  }
});

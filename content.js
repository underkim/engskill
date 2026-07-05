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
  const text = getSelectedEnglishText();
  if (!isUsefulEnglishSelection(text)) {
    return;
  }

  chrome.runtime.sendMessage({
    type: "CAPTURE_SELECTION",
    text,
    source: getPageSource(),
    saveIntent: false
  });
});

function getPageSource() {
  return {
    title: document.title || "Web page",
    url: location.href
  };
}

function isUsefulEnglishSelection(text) {
  return /^[\s\w'",.!?;:()\-]+$/.test(text) && /[a-zA-Z]/.test(text) && text.length >= 2;
}

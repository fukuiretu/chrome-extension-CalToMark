(function() {
    const events = document.querySelectorAll('.someEventSelector'); // イベントを特定するためのセレクタを使用
    let markdown = '';

    events.forEach(event => {
        const time = event.querySelector('.timeSelector').innerText;
        const title = event.querySelector('.titleSelector').innerText;
        markdown += `- **${time}**: ${title}\n`;
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'getMarkdown') {
            sendResponse({ markdown });
        }
    });
})();

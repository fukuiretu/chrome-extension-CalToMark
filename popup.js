document.addEventListener('DOMContentLoaded', () => {
    // 起動時にローカルストレージからデータを読み込む
    const savedData = localStorage.getItem('markdownData');
    if (savedData) {
        document.getElementById('markdownOutput').value = savedData;
    }
});

document.getElementById('getSchedule').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractSchedule
    }, (results) => {
        const markdown = results[0].result;
        document.getElementById('markdownOutput').value = markdown;

        // 取得したデータをローカルストレージに保存
        localStorage.setItem('markdownData', markdown);
    });
});

function extractSchedule() {
    // 日付を解析する関数
    function parseEventDate(details) {
        const datePattern = /(\d{4})年 (\d{1,2})月 (\d{1,2})日/;
        const match = details.match(datePattern);
        if (match) {
            const [, year, month, day] = match.map(Number);
            const eventDate = new Date(year, month - 1, day);
            return eventDate;
        }
        return null;
    }

    const events = document.querySelectorAll('div[role="button"][data-eventchip]');
    
    let markdown = '';

    const eventsByDate = {};

    events.forEach(event => {
        const details = event.querySelector('.XuJrye')?.innerText || '';
        const [datetime, title] = details.split('、').slice(0, 2);

        if (datetime && title) {
            const cleanTitle = title.replace(/[「」]/g, '');
            const eventDate = parseEventDate(details);
            if (eventDate) {
                const dateKey = `${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;

                if (!eventsByDate[dateKey]) {
                    eventsByDate[dateKey] = [];
                }
                eventsByDate[dateKey].push(`- ${cleanTitle}`);
            }
        }
    });

    for (const date in eventsByDate) {
        markdown += `# ${date}\n`;
        markdown += eventsByDate[date].join('\n') + '\n\n';
    }

    return markdown;
}

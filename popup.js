document.getElementById('getSchedule').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractSchedule
  }, (results) => {
      if (results && results.length > 0) {
          const markdown = results[0].result;
          document.getElementById('markdownOutput').value = markdown;
      } else {
          document.getElementById('markdownOutput').value = "Failed to retrieve schedule.";
      }
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

  // 今日、昨日、明日かをチェックする関数
  function isTodayYesterdayOrTomorrow(eventDate, today, yesterday, tomorrow) {
      if (!eventDate) return false;
      return (
          eventDate.toDateString() === today.toDateString() ||
          eventDate.toDateString() === yesterday.toDateString() ||
          eventDate.toDateString() === tomorrow.toDateString()
      );
  }

  const events = document.querySelectorAll('div[role="button"][data-eventchip]');
  
  let markdown = '';
  const today = new Date();
  const yesterday = new Date();
  const tomorrow = new Date();
  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);

  const eventsByDate = {};

  events.forEach(event => {
      const details = event.querySelector('.XuJrye')?.innerText || '';
      const [datetime, title] = details.split('、').slice(0, 2);

      if (datetime && title) {
          const cleanTitle = title.replace(/[「」]/g, '');
          const eventDate = parseEventDate(details);
          if (isTodayYesterdayOrTomorrow(eventDate, today, yesterday, tomorrow)) {
              const dateKey = `${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;

              if (!eventsByDate[dateKey]) {
                  eventsByDate[dateKey] = [];
              }
              eventsByDate[dateKey].push(`- ${cleanTitle}`);
          }
      }
  });

  for (const date in eventsByDate) {
      markdown += `■${date}\n`;
      markdown += eventsByDate[date].join('\n') + '\n';
  }

  return markdown;
}
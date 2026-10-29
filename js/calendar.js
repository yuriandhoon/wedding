/*
 * calendar.js — 결혼식 일정 추가
 * 이름·시작 시각·장소는 config.js에서 가져옵니다.
 */

(() => {
  "use strict";

  const { $ } = Wedding;
  const start = new Date(CONFIG.dateISO);

  if (Number.isNaN(start.getTime())) {
    $('addCalendar').disabled = true;
    return;
  }

  // 일정 길이: 120분. 필요하면 이 숫자를 바꾸세요.
  const durationMinutes = 120;
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const title = `${CONFIG.groom.name} · ${CONFIG.bride.name} 결혼식`;
  const place = CONFIG.venue.name;
  const description = [
    CONFIG.venue.caution,
    `청첩장: ${window.location.href}`
  ].filter(Boolean).join('\n');

  // 날짜를 캘린더에서 사용하는 UTC 형식으로 변환합니다.
  const stamp = date => date.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

  // 01. Google 캘린더 일정 작성 링크
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    stz: 'Asia/Seoul',
    etz: 'Asia/Seoul',
    location: place,
    details: description
  });

  $('googleCalendar').href =
    `https://calendar.google.com/calendar/r/eventedit?${query}`;

  // 02. 일정 파일에서 특수문자와 줄바꿈을 올바르게 기록합니다.
  const escapeICS = value => String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

  // 한글을 포함한 긴 줄을 일정 파일 규칙에 맞게 나눕니다.
  function foldLine(line) {
    const encoder = new TextEncoder();
    let result = '';
    let size = 0;

    for (const character of line) {
      const bytes = encoder.encode(character).length;

      if (size + bytes > 75) {
        result += '\r\n ';
        size = 1;
      }

      result += character;
      size += bytes;
    }

    return result;
  }

  // 03. 지원하는 캘린더 앱에서 가져올 수 있는 .ics 파일
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//KO',
    'BEGIN:VEVENT',
    `UID:wedding-${start.getTime()}@${window.location.hostname || 'local'}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeICS(title)}`,
    `LOCATION:${escapeICS(place)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const content = lines.map(foldLine).join('\r\n') + '\r\n';
  const file = new Blob([content], {
    type: 'text/calendar;charset=utf-8'
  });

  $('calendarFile').href = URL.createObjectURL(file);

  // 04. 일정 추가 버튼으로 선택지를 펼치거나 접습니다.
  $('addCalendar').onclick = () => {
    const options = $('calendarOptions');
    options.hidden = !options.hidden;

    $('addCalendar').setAttribute('aria-expanded', !options.hidden);
  };
})();

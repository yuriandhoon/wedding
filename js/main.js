/*
 * main.js — 기본 정보 표시와 여러 기능이 함께 쓰는 도구
 * 먼저 읽을 파일: config.js / 이후 파일: gallery.js, accounts.js, effects.js
 * 내용만 바꿀 때는 이 파일 대신 config.js를 수정하세요.
 * 아래 함수로 코드를 감싸 다른 파일의 변수와 이름이 겹치지 않게 합니다.
 */

const Wedding = (() => {
  "use strict";

  // ──────────────────────────────────────────────────────
  // 01. 공통 도구와 기본 정보
  // ──────────────────────────────────────────────────────
  // $는 HTML의 id로 요소를 찾는 짧은 도구 함수입니다.
  // 예: $('cover')는 index.html의 id="cover"인 사진 영역을 찾습니다.
  const $ = (id) => document.getElementById(id);
  // "groom.name"처럼 점으로 연결된 이름을 CONFIG에서 찾습니다.
  // data-bind="groom.name"이면 CONFIG.groom.name의 값이 표시됩니다.
  const getConfig = (path) => path.split('.').reduce((value, key) => value?.[key], CONFIG);

  // 같은 이름이 여러 구역에 있어도 config.js 한 곳만 바꾸면 모두 바뀝니다.
  // textContent로 넣으므로 초대글이나 이름을 HTML 코드로 해석하지 않습니다.
  for (const element of document.querySelectorAll('[data-bind]')) {
    element.textContent = getConfig(element.dataset.bind) || '';
  }

  $('invitationText').textContent = CONFIG.invitation;
  document.title = `${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼합니다`;

  // 갤러리에서 재사용하는 사진 생성 도구입니다.
  // lazy는 화면 가까이에 온 사진부터 불러와 초기 부담을 줄입니다.
  function createPhoto(src, alt) {
    const image = new Image();
    image.alt = alt;
    image.loading = 'lazy';
    image.src = src;
    return image;
  }

  // 대표 사진은 첫 화면에 필요하므로 바로 읽습니다.
  // 파일 경로가 잘못되면 원래의 사진 안내 문구를 그대로 남깁니다.
  if (CONFIG.coverPhoto) {
    const image = new Image();
    image.alt = '신랑 신부의 웨딩 사진';
    image.loading = 'eager';
    image.addEventListener('load', () => $('cover').replaceChildren(image));
    image.src = CONFIG.coverPhoto;
  }

  let toastTimer;

  // 아래쪽 안내 메시지를 3초 동안 보여 줍니다. 연속 호출 시 이전 타이머를 취소합니다.
  function notify(message) {
    $('toast').textContent = message;
    $('toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3000);
  }

  // 문자열을 복사하는 공통 함수입니다.
  // 권한이나 브라우저 제한 때문에 실패하면 직접 복사할 수 있는 창을 엽니다.
  // 계좌번호 복사는 팝업 안의 전용 처리(accounts.js)를 사용합니다.
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify('복사되었습니다.');
    } catch {
      window.prompt('아래 내용을 선택하여 복사해 주세요.', text);
    }
  }

  // ──────────────────────────────────────────────────────
  // 02. 한국 시간 기준 날짜와 카운트다운
  // ──────────────────────────────────────────────────────
  // config.js의 문자열을 실제 날짜 값으로 바꿉니다.
  const wedding = CONFIG.dateISO ? new Date(CONFIG.dateISO) : null;

  if (wedding && !Number.isNaN(wedding.getTime())) {
    // 방문자가 해외에 있어도 화면에는 한국 시간 기준 예식 일시를 표시합니다.
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(wedding).map((part) => [part.type, part.value])
    );

    $('year').textContent = parts.year;
    $('monthDay').textContent = `${parts.month}.${parts.day}`;
    $('clock').textContent = parts.hour
      + (parts.minute === '00' ? '' : ':' + parts.minute)
      + ' ' + parts.dayPeriod;

    $('ceremonyDate').textContent = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: 'long', day: 'numeric',
      weekday: 'long',
      hour: 'numeric', minute: '2-digit'
    }).format(wedding);

    // 남은 시간을 초로 계산한 뒤 일/시/분/초로 나눕니다.
    // 하루는 86,400초, 한 시간은 3,600초입니다. 과거 날짜는 0에서 멈춥니다.
    function tick() {
      const seconds = Math.max(0, Math.floor((wedding - Date.now()) / 1000));
      $('days').textContent = Math.floor(seconds / 86400);
      $('hours').textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, '0');
      $('minutes').textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
      $('seconds').textContent = String(seconds % 60).padStart(2, '0');
      if (wedding <= Date.now()) {
        $('dateSub').textContent = '함께해 주셔서 감사합니다';
      }
    }

    // 첫 화면에서 즉시 한 번 계산하고, 이후에는 1초마다 갱신합니다.
    tick();
    setInterval(tick, 1000);
  } else {
    $('dateSub').textContent = '예식 날짜를 입력하면 카운트다운이 시작됩니다.';
  }

  // ──────────────────────────────────────────────────────
  // 04. 지도 연결
  // ──────────────────────────────────────────────────────
  if (CONFIG.venue.search || CONFIG.venue.naverMapUrl) {
    // 한글과 공백을 URL에 넣을 수 있는 형태로 바꿉니다.
    const query = encodeURIComponent(CONFIG.venue.search || CONFIG.venue.name);
    $('mapLinks').hidden = false;
    
    // 네이버 공유 링크가 있으면 우선 사용합니다. 없으면 장소 이름으로 검색합니다.
    // 지도는 청첩장 안에 삽입하지 않고 각각의 지도 서비스에서 엽니다.
    // 휴대전화에서는 티맵 앱으로, 컴퓨터에서는 기존 웹페이지로 연결합니다.
    const useTmapApp = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const links = [
      ['네이버 지도', CONFIG.venue.naverMapUrl || 'https://map.naver.com/p/search/' + query],
      ['카카오맵', CONFIG.venue.kakaoMapUrl || 'https://map.kakao.com/?q=' + query],
      ['티맵', useTmapApp ? 'tmap://poi-detail?pkey=73515801' : CONFIG.venue.tmapUrl];

    for (const [label, url] of links) {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = url;
      // 앱 연결은 현재 탭에서 요청하고, 웹페이지는 새 탭으로 엽니다.
      link.target = url.startsWith('tmap://') ? '_self' : '_blank';
      link.rel = 'noopener noreferrer';
      $('mapLinks').append(link);
    }
  }
  
  // ──────────────────────────────────────────────────────
  // 05. 청첩장 공유
  // ──────────────────────────────────────────────────────
  $('share').onclick = async () => {
    // 컴퓨터에서 연 파일 주소는 다른 사람에게 공유할 수 없으므로 안내만 합니다.
    if (location.protocol === 'file:') {
      notify('GitHub에 게시한 후 주소를 공유할 수 있습니다.');
      return;
    }
    try {
      // 휴대폰의 기본 공유창을 지원하면 사용하고, 아니면 청첩장 주소를 복사합니다.
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: '소중한 분들을 우리의 결혼식에 초대합니다.',
          url: location.href
        });
      } else {
        await copy(location.href);
      }
    } catch (error) {
      if (error.name !== 'AbortError') copy(location.href);
    }
  };

  // 다른 파일에 필요한 도구만 Wedding라는 이름으로 전달합니다.
  // 내부의 날짜 계산이나 팝업 상태는 이 함수 안에서만 사용합니다.
  return { $, createPhoto, notify, copy };
})();

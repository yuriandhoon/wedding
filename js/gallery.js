/*
 * gallery.js — 사진 목록, 사진 넘기기
 * 사진 추가와 순서 변경: config.js의 photos
 * 사진 배치 디자인: css/style.css / 확대창 디자인: css/popup.css
 */

(() => {
  "use strict";

  // main.js에서 만든 공통 도구를 가져옵니다.
  const { $, createPhoto } = Wedding;

  let currentPhoto = 0;
  
  // 큰 사진과 선택된 썸네일을 함께 갱신합니다.
  function showPhoto() {
    const src = CONFIG.photos[currentPhoto];
  
    $('galleryMain').src = src;
    $('galleryMain').alt = `웨딩 사진 ${currentPhoto + 1}`;
  
    const strip = $('gallery');
    const buttons = strip.querySelectorAll('.thumb');
  
    buttons.forEach((button, index) => {
      button.setAttribute('aria-current', index === currentPhoto);
    });
  
    // 선택된 썸네일이 가로 목록 안에서 보이도록 이동합니다.
    const selected = buttons[currentPhoto];
    if (selected) {
      const distance =
        selected.getBoundingClientRect().left -
        strip.getBoundingClientRect().left -
        (strip.clientWidth - selected.clientWidth) / 2;
  
      strip.scrollBy({ left: distance, behavior: 'smooth' });
    }
  }
  
  // config.js의 사진을 전부 썸네일로 만듭니다.
  function renderGallery() {
    const strip = $('gallery');
    strip.replaceChildren();
  
    if (!CONFIG.photos.length) {
      $('galleryMain').hidden = true;
      $('galleryHint').textContent = '사진을 준비 중입니다.';
      return;
    }
  
    $('galleryHint').textContent = '작은 사진을 선택하거나 큰 사진을 눌러 보세요.';
  
    CONFIG.photos.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'thumb';
      button.setAttribute('aria-label', `웨딩 사진 ${index + 1} 보기`);
  
      const image = createPhoto(src, '');
      image.onerror = () => {
        button.textContent = '사진 확인 필요';
        button.disabled = true;
      };
  
      button.append(image);
      button.onclick = () => {
        currentPhoto = index;
        showPhoto();
      };
      strip.append(button);
    });
  
    showPhoto();
  }
  
  // %는 나머지 연산입니다. 마지막 사진 다음에는 첫 사진, 첫 사진 이전에는 마지막 사진으로 이동합니다.
  function movePhoto(direction) {
    if (!CONFIG.photos.length) return;
  
    currentPhoto = (currentPhoto + direction + CONFIG.photos.length) % CONFIG.photos.length;
    showPhoto();
  }

  // 큰 사진을 좌우로 밀어서 넘깁니다.
  const stage = $('galleryMain');
  
  let startX = null;
  let startY = null;
  
  // 손가락 또는 마우스를 누른 위치를 기억합니다.
  stage.addEventListener('pointerdown', (event) => {
    // 첫 번째 손가락 또는 마우스 왼쪽 버튼만 처리합니다.
    if (!event.isPrimary || event.button !== 0) return;
  
    startX = event.clientX;
    startY = event.clientY;
  
    // 사진 밖에서 손을 놓더라도 이동 종료를 감지합니다.
    stage.setPointerCapture(event.pointerId);
  });
  
  // 손가락 또는 마우스를 놓으면 이동 방향을 판단합니다.
  stage.addEventListener('pointerup', (event) => {
    if (startX === null) return;
  
    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;
  
    startX = null;
    startY = null;
  
    // 짧은 터치나 세로 이동은 사진 넘기기로 처리하지 않습니다.
    if (Math.abs(distanceX) < 40) return;
    if (Math.abs(distanceX) <= Math.abs(distanceY)) return;
  
    // 왼쪽으로 밀면 다음 사진, 오른쪽으로 밀면 이전 사진
    movePhoto(distanceX < 0 ? 1 : -1);
  });
  
  // 페이지 스크롤 등으로 조작이 취소되면 기록을 비웁니다.
  stage.addEventListener('pointercancel', () => {
    startX = null;
    startY = null;
  });
  
  // 페이지를 처음 열었을 때도 한 번 그립니다.
  renderGallery();
})();

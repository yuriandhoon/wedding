/*
 * gallery.js — 사진 목록, 더 보기, 확대창의 이전/다음
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
    currentPhoto = (currentPhoto + direction + CONFIG.photos.length) % CONFIG.photos.length;
    showPhoto();
  }
  
  // 큰 사진의 왼쪽을 누르면 이전, 오른쪽을 누르면 다음 사진
  $('galleryMain').onclick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const direction = event.clientX < rect.left + rect.width / 2 ? -1 : 1;
    movePhoto(direction);
  };
    
  // 휴대폰: 왼쪽으로 밀면 다음 사진, 오른쪽으로 밀면 이전 사진
  stage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  
  stage.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
  
    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
  
    if (Math.abs(distance) < 45) return;
    event.preventDefault(); // 밀기를 클릭으로도 처리하지 않도록 함
    movePhoto(distance < 0 ? 1 : -1);
  }, { passive: false });
  
  // 컴퓨터: 사진 위에서 휠을 굴려 이동
  stage.addEventListener("wheel", (event) => {
    const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
  
    if (Math.abs(distance) < 20) return;
    event.preventDefault();
  
    // 휠 한 번에 여러 장이 연속으로 넘어가지 않도록 제한
    if (Date.now() - lastWheelTime < 450) return;
    lastWheelTime = Date.now();
  
    movePhoto(distance > 0 ? 1 : -1);
  }, { passive: false });

  // 페이지를 처음 열었을 때도 한 번 그립니다.
  renderGallery();
})();

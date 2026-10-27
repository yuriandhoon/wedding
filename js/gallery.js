/*
 * gallery.js — 사진 목록, 더 보기, 확대창의 이전/다음
 * 사진 추가와 순서 변경: config.js의 photos
 * 사진 배치 디자인: css/style.css / 확대창 디자인: css/popup.css
 */

(() => {
  "use strict";

  // main.js에서 만든 공통 도구를 가져옵니다.
  const { $, createPhoto, openDialog } = Wedding;

  // expanded: 사진을 모두 펼쳤는지 / currentPhoto: 현재 확대 중인 사진의 순서
  // 순서는 0부터 시작하므로 첫 사진은 0입니다.
  let expanded = false;
  let currentPhoto = 0;

  // 사진 목록을 화면에 다시 그립니다. 실제 사진 경로는 CONFIG.photos에 있습니다.
  function renderGallery() {
    const grid = $('gallery');
    grid.replaceChildren();

    // 사진 목록을 비워 두면 클릭할 수 없는 빈 자리 9개를 보여 줍니다.
    if (!CONFIG.photos.length) {
      for (let index = 1; index <= 9; index++) {
        const cell = document.createElement('div');
        cell.className = 'thumb';
        cell.textContent = String(index).padStart(2, '0');
        cell.setAttribute('aria-label', `사진 ${index} 자리`);
        grid.append(cell);
      }
      return;
    }

    $('galleryHint').textContent = '사진을 누르면 크게 볼 수 있습니다.';
    // 처음에는 최대 9장만 보여 주고, 더 보기를 누르면 전체를 보여 줍니다.
    const photos = CONFIG.photos.slice(0, expanded ? undefined : 9);

    photos.forEach((src, index) => {
      const button = document.createElement('button');
      button.className = 'thumb';
      button.setAttribute('aria-label', `사진 ${index + 1} 크게 보기`);
      const image = createPhoto(src, `웨딩 사진 ${index + 1}`);
      // 사진 경로가 틀린 경우 깨진 이미지 대신 안내를 보여 주고 해당 버튼을 막습니다.
      image.onerror = () => {
        button.textContent = '사진 확인 필요';
        button.disabled = true;
      };
      button.append(image);
      // 누른 사진의 순서를 기억한 뒤, main.js의 공통 도구로 확대창을 엽니다.
      button.onclick = () => {
        currentPhoto = index;
        showPhoto();
        openDialog($('lightbox'));
      };
      grid.append(button);
    });

    $('morePhotos').hidden = CONFIG.photos.length <= 9;
    $('morePhotos').textContent = expanded ? '사진 접기' : '사진 더 보기';
  }

  function showPhoto() {
    $('largePhoto').src = CONFIG.photos[currentPhoto];
    $('largePhoto').alt = `웨딩 사진 ${currentPhoto + 1}`;
    $('photoCount').textContent = `${currentPhoto + 1} / ${CONFIG.photos.length}`;
  }

  // %는 나머지 연산입니다. 마지막 사진 다음에는 첫 사진, 첫 사진 이전에는 마지막 사진으로 이동합니다.
  function movePhoto(direction) {
    currentPhoto = (currentPhoto + direction + CONFIG.photos.length) % CONFIG.photos.length;
    showPhoto();
  }

  // 아래부터는 index.html의 각 버튼과 실제 동작을 연결합니다.
  $('morePhotos').onclick = () => {
    expanded = !expanded;
    // 펼침 상태에 맞춰 목록을 다시 그립니다.
    renderGallery();
  };
  $('closeLightbox').onclick = () => $('lightbox').close();
  $('previousPhoto').onclick = () => movePhoto(-1);
  $('nextPhoto').onclick = () => movePhoto(1);
  $('lightbox').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') movePhoto(-1);
    if (event.key === 'ArrowRight') movePhoto(1);
  });
  // 페이지를 처음 열었을 때도 한 번 그립니다.
  renderGallery();
})();

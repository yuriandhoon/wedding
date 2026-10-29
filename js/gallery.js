/*
 * gallery.js
 *
 * 큰 사진: 손가락으로 가로 스크롤
 * 작은 사진: 선택하면 해당 큰 사진으로 이동
 * 사진 목록: config.js의 photos에서 수정
 */

(() => {
  "use strict";

  const { $, createPhoto } = Wedding;

  const frame = $("galleryFrame");
  const strip = $("gallery");
  const photos = CONFIG.photos;

  // 휴대전화의 '동작 줄이기' 설정을 확인합니다.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const slides = [];
  const buttons = [];

  let currentPhoto = 0;

  frame.replaceChildren();
  strip.replaceChildren();

  // 등록한 사진이 없으면 빈 공간을 숨깁니다.
  if (!photos.length) {
    frame.hidden = true;
    strip.hidden = true;
    return;
  }

  // 1. 큰 사진과 썸네일을 만듭니다.
  photos.forEach((src, index) => {
    const image = createPhoto(
      src,
      `웨딩 사진 ${index + 1}`
    );

    image.className = "gallery-main";
    image.draggable = false;

    // 첫 사진과 바로 다음 사진은 미리 불러옵니다.
    image.loading = index < 2 ? "eager" : "lazy";

    frame.append(image);
    slides.push(image);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "thumb";

    button.setAttribute(
      "aria-label",
      `웨딩 사진 ${index + 1} 보기`
    );

    button.append(createPhoto(src, ""));

    // 썸네일을 누르면 해당 큰 사진의 위치로 이동합니다.
    button.addEventListener("click", () => {
      goTo(index);
    });

    strip.append(button);
    buttons.push(button);
  });

  // 2. 지정한 사진 위치로 가로 스크롤합니다.
  function goTo(
    index,
    behavior = reducedMotion.matches ? "instant" : "smooth"
  ) {
    frame.scrollTo({
      left: slides[index].offsetLeft - slides[0].offsetLeft,
      behavior
    });
  }

  // 3. 현재 사진에 해당하는 썸네일을 표시합니다.
  function updateThumbs() {
    buttons.forEach((button, index) => {
      button.setAttribute(
        "aria-current",
        String(index === currentPhoto)
      );
    });

    const selected = buttons[currentPhoto];

    // 선택한 썸네일이 가로 목록 안에서 보이도록 이동합니다.
    const distance =
      selected.getBoundingClientRect().left -
      strip.getBoundingClientRect().left -
      (strip.clientWidth - selected.clientWidth) / 2;

    strip.scrollBy({
      left: distance,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  }

  // 4. 스와이프 중 현재 위치에 가장 가까운 사진을 찾습니다.
  let scrollPending = false;

  frame.addEventListener("scroll", () => {
    // 같은 화면 갱신 안에서 계산을 반복하지 않도록 합니다.
    if (scrollPending) return;
    scrollPending = true;

    requestAnimationFrame(() => {
      scrollPending = false;

      let nearest = 0;
      let shortest = Infinity;

      slides.forEach((slide, index) => {
        const distance = Math.abs(
          slide.offsetLeft -
          slides[0].offsetLeft -
          frame.scrollLeft
        );

        if (distance < shortest) {
          shortest = distance;
          nearest = index;
        }
      });

      // 사진이 바뀌었을 때만 썸네일을 갱신합니다.
      if (nearest !== currentPhoto) {
        currentPhoto = nearest;
        updateThumbs();
      }
    });
  }, { passive: true });

  // 화면 회전 등으로 너비가 바뀌어도 현재 사진을 유지합니다.
  new ResizeObserver(() => {
    goTo(currentPhoto, "instant");
  }).observe(frame);

  // 처음에는 첫 번째 썸네일을 선택합니다.
  updateThumbs();
})();

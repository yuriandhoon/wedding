/* gallery.js
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



/* accounts.js — 양가 접이식 계좌 목록과 복사 버튼
 * 실제 계좌 정보는 config.js의 accounts에서 수정합니다.
 * 목록의 디자인은 css/style.css에서 관리합니다.
 */

(() => {
  "use strict";

  // main.js에 이미 있는 복사 기능을 사용합니다.
  const { copy } = Wedding;

  // config.js의 신랑측·신부측 계좌를 각각 해당 목록에 넣습니다.
  for (const side of ["groom", "bride"]) {
    const list = document.getElementById(`${side}Accounts`);

    for (const item of CONFIG.accounts[side] || []) {
      const row = document.createElement("div");
      row.className = "account-row";

      const info = document.createElement("div");
      info.className = "account-info";

      const role = document.createElement("p");
      role.className = "account-role";
      role.textContent = item.role;

      const number = String(item.number || "").trim();
      const numberText = document.createElement("p");
      numberText.className = "account-number";
      numberText.textContent = number || "계좌 준비 중";

      const holder = document.createElement("p");
      holder.className = "account-holder";
      holder.textContent = [item.bank, item.holder].filter(Boolean).join(" · ");

      const button = document.createElement("button");
      button.className = "account-copy";
      button.type = "button";
      button.textContent = "복사";
      button.disabled = !number;
      button.setAttribute("aria-label", `${item.role} 계좌번호 복사`);

      // 예금주나 은행명은 제외하고 계좌번호만 복사합니다.
      button.addEventListener("click", () => {
        copy(number.replace(/[\s-]/g, ""));
      });

      info.append(role, numberText, holder);
      row.append(info, button);
      list.append(row);
    }
  }

  // 계좌 목록을 부드럽게 펼치고 접습니다.
  for (const group of document.querySelectorAll(".account-group")) {
    const summary = group.querySelector("summary");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let expanded = group.open;
    let animation = null;

    // 화살표가 현재 열림 상태를 표시하도록 합니다.
    group.classList.toggle("is-expanded", expanded);

    summary.addEventListener("click", (event) => {
      // 브라우저가 즉시 열고 닫는 기본 동작을 막습니다.
      event.preventDefault();

      // 움직이는 도중 다시 눌러도 현재 높이에서 이어집니다.
      const startHeight = group.getBoundingClientRect().height;

      if (animation) {
        animation.cancel();
        animation = null;
      }

      expanded = !expanded;
      group.classList.toggle("is-expanded", expanded);

      // '동작 줄이기' 설정에서는 즉시 열고 닫습니다.
      if (reducedMotion.matches || !group.animate) {
        group.open = expanded;
        return;
      }

      // 이동할 목표 높이를 실제 내용에 맞춰 측정합니다.
      group.open = expanded;
      const endHeight = group.getBoundingClientRect().height;

      // 닫히는 동안에도 내용이 보여야 하므로 열어 둡니다.
      group.open = true;

      const nextAnimation = group.animate(
        [
          { height: startHeight + "px" },
          { height: endHeight + "px" }
        ],
        {
          duration: 400,
          easing: "cubic-bezier(.25, .8, .25, 1)",
          fill: "both"
        }
      );

      animation = nextAnimation;

      // 움직임이 끝나면 실제 열림 상태를 확정합니다.
      nextAnimation.onfinish = () => {
        if (animation !== nextAnimation) return;

        group.open = expanded;
        nextAnimation.cancel();
        animation = null;
      };
    });
  }
  
})();

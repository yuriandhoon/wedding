/* effects.js — 벚꽃과 한 번만 실행하는 구역 등장 효과
 * 움직임의 모양·속성: css/effects.css
 * 전체 화면에 벚꽃을 뿌리거나, 재방문한 구역을 다시 숨기지 않도록 구성했습니다.
 */

(() => {
  "use strict";

  const { $ } = Wedding;

  // ──────────────────────────────────────────────────────
  // 01. 첫 화면 안에서만 떨어지는 벚꽃
  // ──────────────────────────────────────────────────────
  const hero = document.querySelector('.hero');
  const petalLayer = $('petals');

  // 첫 구역의 실제 높이보다 조금 더 아래까지 떨어뜨립니다.
  // 사진 로딩이나 화면 회전으로 높이가 바뀌면 다시 계산합니다.
  function updatePetalDistance() {
    petalLayer.style.setProperty('--petal-distance', `${hero.clientHeight + 70}px`);
  }

  updatePetalDistance();
  if ('ResizeObserver' in window) {
    new ResizeObserver(updatePetalDistance).observe(hero);
  } else {
    window.addEventListener('resize', updatePetalDistance);
  }

  // 꽃잎의 가로 위치(%)와 시작 시간(초)입니다. 항목 수가 꽃잎 수입니다.
  // 음수 delay는 페이지를 열 때 이미 중간에서 떨어지고 있는 것처럼 보이게 합니다.
  const petalPositions = [10, 80, 55, 30];
  const petalDelays = [-3, -8, -13, -6];
  petalPositions.forEach((left, index) => {
    const leaf = document.createElement('i');
    leaf.className = 'petal';
    // 크기와 속도를 바꾸려면 이 값들을 수정하세요.
    // 15s는 한 번 떨어지는 시간, 7px는 꽃잎 너비입니다.
    // CSS 변수로 전달하고 실제 모양과 이동은 css/effects.css에서 정합니다.
    const styles = {
      '--left': `${left}%`,
      '--size': '7px',
      '--duration': '15s',
      '--delay': `${petalDelays[index]}s`,
      '--drift': '35px',
      '--turn': '300deg',
      '--sway': `${2 + index * 0.6}s`
    };
    for (const [property, value] of Object.entries(styles)) {
      leaf.style.setProperty(property, value);
    }
    petalLayer.append(leaf);
  });

  // ──────────────────────────────────────────────────────
  // 02. 각 내용이 처음 보일 때 한 번만 등장
  // ──────────────────────────────────────────────────────
  // 이미 등장한 요소는 관찰을 중단합니다. 다시 스크롤해도 숨기지 않습니다.
  // 화면 진입 감지 기능을 지원하고 “동작 줄이기”를 사용하지 않을 때만 실행합니다.
  if (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // 보이는 상태로 바꾸고 관찰을 끝냅니다. 이 클래스를 제거하지 않는 것이 핵심입니다.
        // 따라서 위로 되돌아와도 다시 떠오르지 않습니다. 새로고침하면 다시 한 번 실행됩니다.
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

    // 각 구역의 바로 아래 요소만 대상으로 삼습니다. 벚꽃 레이어는 제외합니다.
    for (const element of document.querySelectorAll('main > section > :not(.petals)')) {
      element.classList.add('reveal');
      revealObserver.observe(element);
    }
  }
})();

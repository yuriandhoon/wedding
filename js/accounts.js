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
          duration: 280,
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

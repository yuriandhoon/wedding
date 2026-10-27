/*
 * accounts.js — 양가 계좌 순회, 계좌 팝업, 복사 버튼
 * 실제 계좌 정보는 config.js의 accounts에서만 수정하세요.
 * 팝업의 모양은 css/popup.css, HTML 틀은 index.html 하단에 있습니다.
 */

(() => {
  "use strict";

  // main.js에 이미 있는 복사 기능을 사용합니다.
  const { copy } = Wedding;
  const groups = document.querySelectorAll(".account-group");

  // 한쪽을 펼치면 다른 쪽은 접습니다.
  groups.forEach((group) => {
    group.addEventListener("toggle", () => {
      if (!group.open) return;

      groups.forEach((other) => {
        if (other !== group) other.open = false;
      });
    });
  });

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
        copy(number.replace(/\s/g, ""));
      });

      info.append(role, numberText, holder);
      row.append(info, button);
      list.append(row);
    }
  }
})();

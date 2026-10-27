/*
 * accounts.js — 양가 계좌 순회, 계좌 팝업, 복사 버튼
 * 실제 계좌 정보는 config.js의 accounts에서만 수정하세요.
 * 팝업의 모양은 css/popup.css, HTML 틀은 index.html 하단에 있습니다.
 */

(() => {
  "use strict";

  const { $, openDialog } = Wedding;

  // 01. 현재 선택 상태
  // accountSide: 신랑측(groom) 또는 신부측(bride)
  // accountIndex: 해당 측에서 보고 있는 사람의 순서(0부터 시작)
  // activeAccount: 팝업에 열린 계좌. 닫으면 null로 비웁니다.
  let accountSide = 'groom';
  let accountIndex = 0;
  let activeAccount = null;

  function sideName(side) {
    return side === 'groom' ? '신랑측' : '신부측';
  }

  // 선택한 측의 목록만 반환하므로 반대쪽 계좌로 넘어가지 않습니다.
  function currentAccounts() {
    return CONFIG.accounts[accountSide] || [];
  }

  // 현재 사람의 카드와 선택된 탭, 순서 안내를 함께 갱신합니다.
  function renderAccount() {
    const list = currentAccounts();
    const item = list[accountIndex];

    for (const side of ['groom', 'bride']) {
      const tab = $(side === 'groom' ? 'tabGroom' : 'tabBride');
      // aria-selected는 화면 읽기 도구가 선택된 탭을 알 수 있게 합니다.
      // 키보드 Tab 키는 현재 선택된 탭에만 멈추게 합니다.
      tab.setAttribute('aria-selected', String(side === accountSide));
      tab.tabIndex = side === accountSide ? 0 : -1;
    }

    const panel = $('accounts');
    panel.replaceChildren();
    panel.setAttribute('aria-labelledby', accountSide === 'groom' ? 'tabGroom' : 'tabBride');
    $('previousAccount').disabled = list.length < 2;
    $('nextAccount').disabled = list.length < 2;
    $('accountPosition').textContent = item
      ? `${item.role || sideName(accountSide)} · ${accountIndex + 1} / ${list.length}`
      : sideName(accountSide);

    const card = document.createElement('div');
    card.className = 'account-card';
    // 해당 측의 목록을 비운 경우에도 오류 대신 안내를 표시합니다.
    if (!item) {
      const message = document.createElement('p');
      message.textContent = '등록된 계좌가 없습니다.';
      card.append(message);
      panel.append(card);
      return;
    }

    // 기본 카드에는 관계와 이름만 만듭니다. 은행과 번호는 팝업을 열 때 넣습니다.
    const role = document.createElement('p');
    role.className = 'account-role';
    role.textContent = item.role || sideName(accountSide);
    const holder = document.createElement('p');
    holder.className = 'holder';
    holder.textContent = item.holder;
    const button = document.createElement('button');
    button.className = 'outline';
    button.textContent = '계좌 보기';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'accountDialog');
    button.onclick = () => openAccount(item);

    card.append(role, holder, button);
    panel.append(card);
  }

  // 탭을 바꾸면 그 측의 첫 사람부터 시작합니다.
  function selectAccountSide(side) {
    accountSide = side;
    accountIndex = 0; // 탭을 선택하면 항상 해당 측의 본인부터 표시합니다.
    renderAccount();
  }

  function stepAccount(direction) {
    const count = currentAccounts().length;
    if (!count) return;
    // 나머지(%) 연산으로 배열 끝과 처음을 연결합니다.
    // count를 한 번 더해 왼쪽으로 이동해도 음수가 되지 않게 합니다.
    accountIndex = (accountIndex + direction + count) % count;
    renderAccount();
  }

  // index.html의 버튼 id와 클릭 동작을 연결합니다.
  $('previousAccount').onclick = () => stepAccount(-1);
  $('nextAccount').onclick = () => stepAccount(1);
  $('tabGroom').onclick = () => selectAccountSide('groom');
  $('tabBride').onclick = () => selectAccountSide('bride');

  // 키보드로도 탭을 선택할 수 있습니다.
  document.querySelector('.tabs').onkeydown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let side;
    if (event.key === 'Home') side = 'groom';
    else if (event.key === 'End') side = 'bride';
    else side = accountSide === 'groom' ? 'bride' : 'groom';
    selectAccountSide(side);
    $(side === 'groom' ? 'tabGroom' : 'tabBride').focus();
  };

  // ──────────────────────────────────────────────────────
  // 02. 계좌 상세 팝업과 번호 복사
  // ──────────────────────────────────────────────────────
  // “계좌 보기”를 누른 시점에만 선택된 계좌를 팝업에 채웁니다.
  // 번호가 없는 사람은 복사 버튼을 끕니다.
  function openAccount(item) {
    activeAccount = item;
    const hasNumber = Boolean(String(item.number || '').trim());
    $('popupRole').textContent = item.role || sideName(accountSide);
    $('popupHolder').textContent = item.holder;
    $('popupBank').textContent = item.bank || '계좌 안내';
    $('popupNumber').textContent = hasNumber ? item.number : '계좌 준비 중';
    $('popupNumber').classList.toggle('is-empty', !hasNumber);
    $('accountCopyStatus').textContent = '';
    $('copyAccountLabel').textContent = hasNumber ? '계좌번호 복사하기' : '계좌 준비 중';
    $('copyAccountNumber').disabled = !hasNumber;
    openDialog($('accountDialog'));
  }

  $('closeAccountDialog').onclick = () => $('accountDialog').close();
  // 닫힌 팝업에 이전 사람의 번호가 남지 않도록 텍스트도 지웁니다.
  $('accountDialog').addEventListener('close', () => {
    activeAccount = null;
    for (const id of ['popupRole', 'popupHolder', 'popupBank', 'popupNumber', 'accountCopyStatus']) {
      $(id).textContent = '';
    }
  });

  $('copyAccountNumber').onclick = async () => {
    if (!activeAccount || !String(activeAccount.number || '').trim()) return;
    const item = activeAccount;
    // 예금주와 은행명은 제외하고 번호만 복사합니다. 공백은 지우고 하이픈은 유지합니다.
    const number = String(item.number).replace(/\s/g, '');
    let success = false;

    try {
      // 일반적인 HTTPS 환경에서는 브라우저 클립보드 기능을 먼저 사용합니다.
      await navigator.clipboard.writeText(number);
      success = true;
    } catch {
      // 로컬 파일 또는 클립보드 API 미지원 브라우저에 대한 대체 처리
      const field = document.createElement('textarea');
      field.value = number;
      field.style.cssText = 'position:fixed;left:0;top:0;opacity:0';
      // 모달 바깥은 선택할 수 없으므로 임시 입력칸을 팝업 안에 만듭니다.
      $('accountDialog').append(field);
      field.focus();
      field.select();
      try {
        success = document.execCommand('copy');
      } catch {
        success = false;
      }
      field.remove();
      $('copyAccountNumber').focus();
    }

    // 복사 작업을 기다리는 동안 팝업을 닫거나 다른 계좌를 열었다면 결과 문구를 덮어쓰지 않습니다.
    if (activeAccount !== item || !$('accountDialog').open) return;
    $('accountCopyStatus').textContent = success
      ? '계좌번호가 복사되었습니다.'
      : '위 계좌번호를 길게 누르거나 선택해 복사해 주세요.';
    $('copyAccountLabel').textContent = success ? '복사 완료 ✓' : '계좌번호 복사하기';
  };
  renderAccount();
})();

/*
 * config.js — 자주 수정할 청첩장 정보를 한곳에 모은 파일
 * 이름, 날짜, 사진, 초대글, 장소, 계좌를 바꾸려면 이 파일을 먼저 여세요.
 * 이 파일은 다른 JavaScript 파일보다 먼저 읽어야 합니다.
 */

const CONFIG = {
  "groom": {"name": "최지훈"},
  "bride": {"name": "정유리"},
  "dateISO": "2027-04-18T15:00:00+09:00", // 예식 날짜와 시간
  "coverPhoto": "Files/Main_Picture.jpg", // 대표 사진
  "invitation": `결혼합니다.

최진오·배순득의 아들 최지훈, 정영균·김명숙의 딸 정유리

함께하는 날들이 즐거워
앞으로의 날들도 함께하기로 했습니다.

많이 웃고 서로를 아끼며
오래도록 나란히 걷겠습니다.

저희가 첫걸음을 내딛는 기쁜 날,
소중한 분들을 초대합니다.`,   // 초대글

  "photos": ["Files/Gallery_01.jpg", "Files/Gallery_02.jpg", "Files/Gallery_03.jpg"], // 갤러리 사진

  "venue": {
    "name": "서울대학교 호암교수회관(삼성컨벤션센터)",
    "address":"서울시 관악구 관악로 1",
    "caution": "※ '호암교수회관'은 '교수회관'과 다른 건물입니다.",
    "search": "서울대학교 삼성컨벤션센터",  
    "naverMapUrl": "https://naver.me/5Z1oCVqR",
    "kakaoMapUrl": "https://kko.to/66btxw0tF7",
    "tmapUrl": "https://tmap.life/6870b635",
    "transport": "지하철 2호선 낙성대역 4번 출구 장블랑제리 앞\n→ 버스 관악02-1, 02-2 승차 → 호암교수회관 하차",
    "parking": {
      "lot": "웨딩홀 앞 지상 주차장에 무료 주차 가능합니다.",
      "note": "서울대 정문이 아닌 낙성대 방향으로 진입하셔야 요금이 부과되지 않습니다.",
      "access": "계단 이용이 불편하신 노약자, 영유아 동반자 등은 직원의 도움을 받아 연회장 내의 엘리베이터를 이용하실 수 있습니다."
    },

   "accounts": {
    "groom": [
      {"role": "신랑", "holder": "최지훈", "bank": "신한은행", "number": "110-406-931510"},
      {"role": "신랑 아버지", "holder": "최진오", "bank": "우리은행", "number": "051-432907-12-001"},
      {"role": "신랑 어머니", "holder": "배순득", "bank": "하나은행", "number": "442-910004-93508"}
    ],
    "bride": [
      {"role": "신부", "holder": "정유리", "bank": "신한은행", "number": "110-440-730460"},
      {"role": "신부 아버지", "holder": "정영균", "bank": "국민은행", "number": "034-24-0263-413"},
      {"role": "신부 어머니", "holder": "김명숙", "bank": "국민은행", "number": "034-24-0263-421"}
    ]
  }  // 마음 전하실 곳
};  

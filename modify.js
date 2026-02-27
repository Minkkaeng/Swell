const fs = require("fs");
const file = "frontend/src/screens/PostDetailScreen.tsx";
let content = fs.readFileSync(file, "utf8");

const replacement =
  `  const getMockComments = (postId: string, authorId: string, authorName: string): Comment[] => {
    switch (postId) {
      case "1":
        return [
          { id: "c1", userId: "user_static_1", user: "파도타는자", content: "하루하루가 생지옥이겠다 진짜.. 똥 밟았다고 생각하고 빨리 이직 자리 알아보는 게 답임 ㅠㅠ", time: "15분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: authorId, user: authorName, content: "하 이력서 쓸 기력도 없는데 주말에 억지로라도 카페 가야겠다..", time: "12분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "분노조절중", content: "와 기획서 던지는 건 진짜 짐승 새끼네. 노동부에 직장 내 괴롭힘으로 찌르고 퇴사해라.", time: "8분 전", parentId: null, isMine: false },
          { id: "c2-r1", userId: "user_static_3", user: "밤바다", content: "모욕죄로 고소 안 되나ㅋㅋㅋ 회사에 미친 인간들 너무 많음 진짜로", time: "3분 전", parentId: "c2", isMine: false },
        ];
      case "2":
        return [
          { id: "c1", userId: "user_static_1", user: "알바요정", content: "헐 첫날부터 진상이라니.. 사장 새끼가 내 편 안 들어주고 빌라고 하면 당장 추노하는 게 맞음.", time: "10분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: "user_static_3", user: "소금쟁이", content: "ㅇㅈ 사장 마인드부터가 글러먹었음. 나였으면 앞치마 던졌다.", time: "8분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "현실조언러", content: "진짜 서비스직 하다 보면 인류애 수직 하락함. 어딜 가나 또라이 질량 보존의 법칙이다 진짜 ㅋㅋㅋ", time: "5분 전", parentId: null, isMine: false },
          { id: "c2-r1", userId: authorId, user: authorName, content: "진짜 진상 아저씨보다 빌라고 한 사장이 더 밉다 ㅋㅋㅋ 낼 알바 가기 싫어", time: "2분 전", parentId: "c2", isMine: false },
        ];
      case "3":
        return [
          { id: "c1", userId: "user_static_1", user: "동그라미", content: "한숨 쉬는 거 진짜 사람 피말리게 하는 가스라이팅임. 원래 신입 땐 다 모르는 건데 지가 올챙이 시절 기억 못하는 거.", time: "18분 전", parentId: null, isMine: false },
          { id: "c2", userId: "user_static_2", user: "지나가는바람", content: "나도 저런 거 겪어봤는데 멘탈 개박살 남.. 그냥 영혼 없이 '네 알겠습니다' 봇이 되는 수밖에 없음.", time: "10분 전", parentId: null, isMine: false },
          { id: "c2-r1", userId: authorId, user: authorName, content: "맞아 지금 딱 영혼 가출 상태임ㅋㅋㅋㅋ 뭘 물어보기가 무섭다", time: "8분 전", parentId: "c2", isMine: false },
          { id: "c3", userId: "user_static_3", user: "선배마음", content: "사수 인성 꼬라지 보소.. 걍 지 기분 안 좋다고 너한테 화풀이하는 거임 너무 마음에 담아두지 마.", time: "2분 전", parentId: null, isMine: false },
        ];
      case "4":
        return [
          { id: "c1", userId: "user_static_1", user: "퇴근마렵다", content: "지는 연차 쓰면서 퇴근 직전에 일 던지는 거 진짜 사이코패스 아님? 완전 이기주의 끝판왕이네.", time: "30분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: authorId, user: authorName, content: "진짜 죽이고 싶다 ㅋㅋㅋ 짐 샀다가 다시 푸는데 자괴감 개오졌음", time: "25분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "야근요정", content: "저런 건 처음부터 확실하게 거절해야 됨. 한 번 받아주면 계속 호구 취급하면서 지 일 떠넘김.", time: "12분 전", parentId: null, isMine: false },
        ];
      case "5":
        return [
          { id: "c1", userId: "user_static_1", user: "조용한물결", content: "나도 가끔 환승할 때 이유 없이 눈물 고임.. 이 팍팍한 세상에 마음 안 병든 사람 없는 듯.", time: "1시간 전", parentId: null, isMine: false },
          { id: "c2", userId: "user_static_2", user: "토닥토닥", content: "부모님한테 걱정 끼치기 싫어서 애써 밝은 척 할 때가 제일 비참하지 ㅠㅠ 오늘 진짜 고생 많았다.", time: "45분 전", parentId: null, isMine: false },
          { id: "c2-r1", userId: authorId, user: authorName, content: "진짜 부모님 목소리 들으니까 눈물 참느라 입술 깨물었다.. 다들 이렇게 버티는구나 위로 고마워", time: "30분 전", parentId: "c2", isMine: false },
          { id: "c3", userId: "user_static_3", user: "잔잔한위로", content: "다들 이렇게 꾸역꾸역 버티면서 사는구나 싶네.. 오늘은 집 가서 치킨 시켜먹고 다 잊어버려!", time: "10분 전", parentId: "c2", isMine: false },
        ];
      case "6":
        return [
          { id: "c1", userId: "user_static_1", user: "단호박", content: "50 받고 5는 진짜 선 존나 세게 넘은 거임. 10년지기라고? 그냥 10년 동안 호구 잡힌 거니까 당장 손절 쳐.", time: "12분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: authorId, user: authorName, content: "호구된 기분이 이거구나 싶음.. 남편 보기도 진짜 창피해서 말이 안 나온다", time: "10분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "현실조언러", content: "이건 속 좁은 게 아니라 네가 보살인 거임 ㅋㅋㅋ 내가 너였으면 축의금 봉투 얼굴에 던졌다.", time: "8분 전", parentId: null, isMine: false },
          { id: "c3", userId: "user_static_3", user: "공감요정", content: "어떻게 남편 보기 민망하게 남의 체면을 그렇게 깎아내리냐.. 개빡칠만 하네 진짜 어이없었겠다.", time: "3분 전", parentId: "c2", isMine: false },
        ];
      case "7":
        return [
          { id: "c1", userId: "user_static_1", user: "분노버튼", content: "와 잠수+환승 콜라보 미쳤네 ㅋㅋㅋ 쓰레기 분리수거 제대로 했네 걍 부계정으로도 보지 마 더러움.", time: "15분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: authorId, user: authorName, content: "어디 쳐박혀서 뒤졌으면 좋겠다 진짜 손 떨려서 일도 안 잡혀", time: "12분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "토닥토닥", content: "잠수타는 새끼들이 젤 찌질함. 감정 낭비 말고 똥 밟았다 치고 네 인생 멋지게 사는 게 최고의 복수임.", time: "5분 전", parentId: null, isMine: false },
          { id: "c2-r1", userId: "user_static_3", user: "공감공감", content: "ㄹㅇ 그런 폐급 찌질이는 버리는 게 이득임 더 좋은 사람 만날 거임 ㅠㅠ", time: "1분 전", parentId: "c2", isMine: false },
        ];
      case "8":
        return [
          { id: "c1", userId: "user_static_1", user: "마이웨이", content: "진짜 동호회 가면 저런 파벌 만드는 정치질 오지는 애들 꼭 있음. 더러워서 피하는 게 정신건강에 이로워.", time: "10분 전", parentId: null, isMine: false },
          { id: "c1-r1", userId: authorId, user: authorName, content: "진짜 나이 쳐먹고 뭐하는 짓인지 모르겠음 ㅋㅋㅋ 걍 단톡방 나가기 눌러버릴까 고민 중이다", time: "8분 전", parentId: "c1", isMine: false },
          { id: "c2", userId: "user_static_2", user: "경험자", content: "나이 먹고 끼리끼리 몰려다니면서 뒤에서 딴 방 파는 거 ㅈㄴ 유치함ㅋㅋㅋ 그냥 깔끔하게 탈퇴 버튼 눌러라.", time: "2분 전", parentId: null, isMine: false },
        ];
      default:
        return [
          { id: "c1", userId: "user_default", user: "지나가는바람", content: "오늘 하루도 진짜 고생 많았다. 푹 쉬고 내일 또 털어내자 화이팅!", time: "방금 전", parentId: null, isMine: false }
        ];
    }
  };

  const [comments, setComments] = useState<Comment[]>(getMockComments(post.id, post.userId, post.nickname));\`` + "\n";

const regex =
  /const getMockComments = \(postId: string\): Comment\[\] => \{[\s\S]*?const \[comments, setComments\] = useState<Comment\[\]>\(getMockComments\(post\.id\)\);/;
content = content.replace(regex, replacement);
fs.writeFileSync(file, content, "utf8");
console.log("done");

const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Added axios for external API calls
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// [가상 DB] 사용자 정보
const mockUsers = [
  {
    id: "user1",
    nickname: "지친신입사원",
    status: "USER",
    followers: 45,
    receivedLikes: 82,
    postCount: 3,
    posts: [
      {
        id: "1",
        title: "진짜 퇴사 마렵다.. 부장 새X 진짜",
        content:
          "입사한 지 한 달도 안 됐는데 오늘 회의실에서 내 기획서 면전에서 던져버림. 사람들 다 보는데 '이게 일이라고 해온 거냐'고 소리 지르는데 진짜 주먹 꽉 쥐었다. 화장실 가서 몰래 울고 왔는데 내가 왜 이런 취급 받아야 되는지 모르겠네...",
        time: "10분 전",
        likes: 45,
        comments: 12,
      },
    ],
  },
  {
    id: "user2",
    nickname: "알바몬24시",
    status: "USER",
    followers: 12,
    receivedLikes: 25,
    postCount: 1,
    posts: [
      {
        id: "2",
        title: "카페 알바 첫날인데 개진상 만남",
        content:
          "주문 좀 늦게 받았다고 다짜고짜 나한테 욕하면서 반말하는 아저씨... 내 잘못 아닌데 사장님은 내 편 안 들어주고 무조건 죄송하다고 빌래. 나도 우리 부모님 귀한 자식인데 왜 남한테 빌어야 됨? 다 때려치우고 싶다 진짜.",
        time: "32분 전",
        likes: 25,
        comments: 8,
      },
    ],
  },
  {
    id: "user3",
    nickname: "숨쉬고싶다",
    status: "USER",
    followers: 82,
    receivedLikes: 150,
    postCount: 5,
    posts: [
      {
        id: "3",
        title: "사수의 한숨 소리가 너무 무서워",
        content:
          "질문 하나 할 때마다 한숨 푹푹 쉬면서 '이것도 아직 몰라요?' 하는데 진짜 자존감 바닥친다. 나 나름 열심히 한다고 하는데... 내가 진짜 바보인가 싶고 내일 출근하기가 너무 무겁다. 누가 나 좀 살려줘.",
        time: "1시간 전",
        likes: 82,
        comments: 34,
      },
    ],
  },
  {
    id: "user4",
    nickname: "퇴근원정대",
    status: "USER",
    followers: 56,
    receivedLikes: 120,
    postCount: 4,
    posts: [
      {
        id: "4",
        title: "퇴근 10분 전에 일 던지는 팀장",
        content:
          "팀장은 퇴근 준비하면서 나는 내일 아침까지 끝내놓으라네? 자기는 내일 연차 쓰면서ㅋㅋㅋ 이거 가스라이팅 아님? 거절하면 협업 안 되는 사람 취급하니까 아무 말도 못 하고 다시 앉았다. 진짜 숨 막혀 죽을 것 같아.",
        time: "2시간 전",
        likes: 56,
        comments: 20,
      },
    ],
  },
  {
    id: "user5",
    nickname: "지하철눈물녀",
    status: "USER",
    followers: 124,
    receivedLikes: 350,
    postCount: 15,
    posts: [
      {
        id: "5",
        title: "나만 이렇게 사는 거 아니지...?",
        content:
          "집에 오는 지하철 안에서 그냥 멍하니 창밖만 보는데 갑자기 눈물이 터짐. 내가 무슨 영광을 보겠다고 이렇게 모욕당하며 살아야 하나 싶다. 부모님은 내가 좋은 회사 들어가서 잘 지내는 줄 아는데... 전화로 괜찮냐고 물어보는데 아무렇지 않은 척 목소리 가다듬는 게 제일 힘들다.",
        time: "5시간 전",
        likes: 124,
        comments: 56,
      },
    ],
    socialId: "kakao_test_user", // 테스트용 소셜 ID 추가
  },
];

// [가상 DB] 게시글 정보
const mockPosts = [
  {
    id: "1",
    userId: "user1",
    nickname: "지친신입사원",
    category: "고민",
    title: "진짜 퇴사 마렵다.. 부장 새X 진짜",
    content:
      "입사한 지 한 달도 안 됐는데 오늘 회의실에서 내 기획서 면전에서 던져버림. 사람들 다 보는데 '이게 일이라고 해온 거냐'고 소리 지르는데 진짜 주먹 꽉 쥐었다. 화장실 가서 몰래 울고 왔는데 내가 왜 이런 취급 받아야 되는지 모르겠네...",
    time: "10분 전",
    likes: 45,
    comments: 12,
  },
  {
    id: "2",
    userId: "user2",
    nickname: "알바몬24시",
    category: "일상",
    title: "카페 알바 첫날인데 개진상 만남",
    content:
      "주문 좀 늦게 받았다고 다짜고짜 나한테 욕하면서 반말하는 아저씨... 내 잘못 아닌데 사장님은 내 편 안 들어주고 무조건 죄송하다고 빌래. 나도 우리 부모님 귀한 자식인데 왜 남한테 빌어야 됨? 다 때려치우고 싶다 진짜.",
    time: "32분 전",
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    userId: "user3",
    nickname: "숨쉬고싶다",
    category: "위로",
    title: "사수의 한숨 소리가 너무 무서워",
    content:
      "질문 하나 할 때마다 한숨 푹푹 쉬면서 '이것도 아직 몰라요?' 하는데 진짜 자존감 바닥친다. 나 나름 열심히 한다고 하는데... 내가 진짜 바보인가 싶고 내일 출근하기가 너무 무겁다. 누가 나 좀 살려줘.",
    time: "1시간 전",
    likes: 82,
    comments: 34,
  },
  {
    id: "4",
    userId: "user4",
    nickname: "퇴근원정대",
    category: "고민",
    title: "퇴근 10분 전에 일 던지는 팀장",
    content:
      "팀장은 퇴근 준비하면서 나는 내일 아침까지 끝내놓으라네? 자기는 내일 연차 쓰면서ㅋㅋㅋ 이거 가스라이팅 아님? 거절하면 협업 안 되는 사람 취급하니까 아무 말도 못 하고 다시 앉았다. 진짜 숨 막혀 죽을 것 같아.",
    time: "2시간 전",
    likes: 56,
    comments: 20,
  },
  {
    id: "5",
    userId: "user5",
    nickname: "지하철눈물녀",
    category: "일상",
    title: "나만 이렇게 사는 거 아니지...?",
    content:
      "집에 오는 지하철 안에서 그냥 멍하니 창밖만 보는데 갑자기 눈물이 터짐. 내가 무슨 영광을 보겠다고 이렇게 모욕당하며 살아야 하나 싶다. 부모님은 내가 좋은 회사 들어가서 잘 지내는 줄 아는데... 전화로 괜찮냐고 물어보는데 아무렇지 않은 척 목소리 가다듬는 게 제일 힘들다.",
    time: "5시간 전",
    likes: 124,
    comments: 56,
  },
];

// --- API Endpoints ---

// 1. 게시글 목록 조회
app.get("/api/posts", (req, res) => {
  console.log("API: GET /api/posts hit");
  res.status(200).json({ success: true, posts: mockPosts });
});

// 2. 게시글 작성
app.post("/api/posts", (req, res) => {
  const { title, content, userId, category, nickname } = req.body;
  const newPost = {
    id: `post_${Date.now()}`,
    userId: userId || "anonymous",
    nickname: nickname || "새로운파도",
    title: title || content.substring(0, 20),
    content,
    time: "방금 전",
    likes: 0,
    comments: 0,
    category: category || "일상",
  };
  mockPosts.unshift(newPost);
  res.status(200).json({ success: true, post: newPost });
});

// 2-1. 게시글 삭제
app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const postIndex = mockPosts.findIndex((p) => p.id === id);
  if (postIndex !== -1) {
    mockPosts.splice(postIndex, 1);
    res.status(200).json({ success: true, message: "게시글이 삭제되었습니다." });
  } else {
    res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
  }
});

// 2-2. 게시글 수정
app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { content, title } = req.body;
  const post = mockPosts.find((p) => p.id === id);
  if (post) {
    post.content = content;
    if (title) post.title = title;
    res.status(200).json({ success: true, post });
  } else {
    res.status(404).json({ success: false, message: "게시글을 찾을 수 없습니다." });
  }
});

// 3. 사용자 프로필 상세 조회
app.get("/api/users/profile/:userId", (req, res) => {
  const { userId } = req.params;
  let user = mockUsers.find((u) => u.id === userId);

  if (user) {
    res.status(200).json({ success: true, data: user });
  } else {
    // mockUsers에 없는 경우(게스트 등), 최근 게시글에서 닉네임 정보를 찾아봄
    const lastPost = mockPosts.find((p) => p.userId === userId);
    res.status(200).json({
      success: true,
      data: {
        id: userId,
        nickname: lastPost ? lastPost.nickname : "익명의 너울",
        followers: 0,
        receivedLikes: 0,
        postCount: mockPosts.filter((p) => p.userId === userId).length,
        posts: mockPosts.filter((p) => p.userId === userId),
      },
    });
  }
});

// 4. 팔로우 토글
app.post("/api/users/follow", (req, res) => {
  const { followerId, followingId } = req.body;
  console.log(`Follow toggle: ${followerId} -> ${followingId}`);
  res.status(200).json({ success: true, message: "팔로우 상태가 변경되었습니다." });
});

// 4-1. 프론트엔드-백엔드 데이터 동기화 (데모용)
app.post("/api/users/sync", (req, res) => {
  const { userId, nickname } = req.body;
  if (!userId || !nickname) {
    return res.status(400).json({ success: false, message: "Missing userId or nickname" });
  }

  const user = mockUsers.find((u) => u.id === userId);
  if (user) {
    user.nickname = nickname;
    mockPosts.forEach((post) => {
      if (post.userId === userId) {
        post.nickname = nickname;
      }
    });
  }

  res.status(200).json({ success: true, message: "Synced successfully" });
});

// 5. 댓글 작성 (Mock)
app.post("/api/posts/:id/comments", (req, res) => {
  const { content, userId, parentId } = req.body;
  const newComment = {
    id: `comment_${Date.now()}`,
    content,
    userId: userId || "anonymous",
    parentId: parentId || null,
    isMine: true,
    time: "방금 전",
  };
  res.status(201).json({ success: true, comment: newComment });
});

// 5-1. 댓글 삭제 (Mock)
app.delete("/api/comments/:id", (req, res) => {
  res.status(200).json({ success: true, message: "댓글이 삭제되었습니다." });
});

// 6. 소셜 로그인 (실제 OAuth 연동)
app.post("/api/auth/social", async (req, res) => {
  const { platform, code, redirectUri, isAccessToken, accessToken } = req.body;
  const actualCode = code || accessToken; // 호환성 유지

  console.log(
    `API: POST /api/auth/social hit (Platform: ${platform}, Code/Token: ${actualCode}, isAccessToken: ${isAccessToken})`,
  );

  // [개발용 테스트 바이패스]
  // 'test_code'로 요청하면 real OAuth를 건너뛰고 테스트 계정으로 로그인 처리
  if (actualCode === "test_code") {
    console.log("API: Test login bypass activated");
    const testUser = mockUsers.find((u) => u.socialId === "kakao_test_user");
    return res.status(200).json({ success: true, user: testUser });
  }

  if (!actualCode || !redirectUri) {
    return res.status(400).json({ success: false, message: "잘못된 요청: Auth Code나 Redirect URI가 누락되었습니다." });
  }

  try {
    let socialId = null;
    let socialNickname = null;

    if (platform === "kakao") {
      const kakaoId = process.env.KAKAO_CLIENT_ID;
      const kakaoSecret = process.env.KAKAO_CLIENT_SECRET;

      if (!kakaoId || !kakaoSecret) {
        throw new Error("Missing Kakao Client ID or Secret in environment variables");
      }

      console.log(`Exchanging Kakao code for token. Redirect URI: ${redirectUri}`);
      // 1. 카카오 토큰 발급
      const tokenResponse = await axios.post("https://kauth.kakao.com/oauth/token", null, {
        params: {
          grant_type: "authorization_code",
          client_id: kakaoId,
          client_secret: kakaoSecret,
          redirect_uri: redirectUri,
          code: actualCode,
        },
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      const kakaoAccessToken = tokenResponse.data.access_token;

      // 2. 카카오 사용자 정보 조회
      const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${kakaoAccessToken}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      socialId = `kakao_${userResponse.data.id}`;
      socialNickname = userResponse.data.kakao_account?.profile?.nickname || "카카오유저";
    } else if (platform === "google") {
      let googleAccessToken = actualCode;

      if (!isAccessToken) {
        // 기존 APK(안드로이드 클라이언트 ID로 생성된 코드)와의 호환성을 위해 안드로이드 클라이언트 ID 고정 사용
        const googleId = process.env.GOOGLE_ANDROID_CLIENT_ID; // 안드로이드 Client ID
        const googleSecret = ""; // 안드로이드 클라이언트는 시크릿을 전송하지 않음

        if (!googleId) {
          throw new Error("Missing Google Android Client ID in environment variables");
        }

        console.log(`Exchanging Google code for token using Android Client ID. Redirect URI: ${redirectUri}`);
        // 1. 구글 토큰 발급
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", googleId);
        // 안드로이드 클라이언트는 client_secret 파라미터 자체를 생략
        params.append("redirect_uri", redirectUri);
        params.append("code", actualCode);

        try {
          const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", params, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          googleAccessToken = tokenResponse.data.access_token;
        } catch (tokenError) {
          console.error("Google Token Exchange Failed:", tokenError.response?.data || tokenError.message);
          return res.status(400).json({ success: false, message: "Google 토큰 교환에 실패했습니다." });
        }
      } else {
        console.log("Using Google Access Token directly.");
      }

      // 2. 구글 사용자 정보 조회
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });
      socialId = `google_${userResponse.data.id}`;
      socialNickname = userResponse.data.name || "구글유저";
    }

    if (!socialId) {
      return res.status(400).json({ success: false, message: "지원하지 않는 플랫폼이거나 인증에 실패했습니다." });
    }

    // 3. 기존 등록 유저 확인
    const user = mockUsers.find((u) => u.socialId === socialId);

    // 테스트 원활함을 위해 소셜 ID가 매칭안되면 user1 이라도 돌려줄지 고민할 수 있으나,
    // 실제 연동 프로세스를 원하셨으므로 신규 가입 flow를 따릅니다.
    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      // 미가입 유저는 회원가입 화면으로 넘어가야 함
      res.status(200).json({
        success: false,
        error: "NOT_REGISTERED",
        message: "등록되지 않은 사용자입니다.",
        socialData: {
          socialId: socialId,
          nickname: socialNickname,
          platform: platform,
        },
      });
    }
  } catch (error) {
    console.error("Social Auth Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, message: "소셜 서버와 통신 중 문제가 발생했습니다." });
  }
});

// 5. 회원가입 (데모용)
app.post("/api/auth/register", (req, res) => {
  const { nickname, gender, platform, birthYear, birthMonth, socialId } = req.body;
  const newUser = {
    id: `user_${Date.now()}`,
    socialId: socialId,
    nickname: nickname || "새로운 너울",
    gender,
    status: "USER",
    followers: 0,
    receivedLikes: 0,
    postCount: 0,
    posts: [],
    platform,
    birthYear,
    birthMonth,
  };
  mockUsers.push(newUser);
  res.status(200).json({ success: true, user: newUser });
});

// 8. 알림 조회 (Mock)
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;
  res.status(200).json({
    success: true,
    notifications: [
      { id: "n1", type: "like", content: "누군가 당신의 파도에 공감했습니다.", time: "방금 전", isRead: false },
    ],
  });
});

// 9. 게시글 반응 (좋아요/싫어요)
app.post("/api/posts/:id/reaction", (req, res) => {
  res.status(200).json({ success: true, message: "반응이 기록되었습니다." });
});

// 10. 투표
app.post("/api/posts/:id/vote", (req, res) => {
  res.status(200).json({ success: true, message: "투표가 기록되었습니다." });
});

// 11. 활동 기록 삭제
app.delete("/api/users/:id/history", (req, res) => {
  const { id } = req.params;
  // 게시글 삭제
  for (let i = mockPosts.length - 1; i >= 0; i--) {
    if (mockPosts[i].userId === id) {
      mockPosts.splice(i, 1);
    }
  }
  // 유저 정보 초기화
  const user = mockUsers.find((u) => u.id === id);
  if (user) {
    user.postCount = 0;
    user.receivedLikes = 0;
    user.posts = [];
  }
  res.status(200).json({ success: true, message: "활동 기록이 삭제되었습니다." });
});

// 12. 탈퇴 (계정 삭제)
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex((u) => u.id === id);
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1); // 유저 완전 삭제

    // 탈퇴한 유저의 게시물은 명세(익명으로 남김)에 따라 익명화 처리
    mockPosts.forEach((post) => {
      if (post.userId === id) {
        post.userId = "deleted_user";
        post.nickname = "알 수 없는 너울";
      }
    });

    res.status(200).json({ success: true, message: "탈퇴 처리가 완료되었습니다." });
  } else {
    res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
  }
});

// 13. STT (Mock)
app.post("/api/stt", (req, res) => {
  res.status(200).json({
    success: true,
    text: "오늘 하루는 정말 긴 파도 같았어요. 힘든 일이 많았지만 이렇게 너울에게 털어놓으니 조금은 마음이 가벼워지는 것 같아요.",
  });
});

app.listen(PORT, () => {
  console.log(`너울(Swell) 서버가 포트 ${PORT}에서 작동 중입니다.`);
});

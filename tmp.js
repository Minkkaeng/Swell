const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Added axios for external API calls
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// [媛??DB] ?ъ슜???뺣낫
const mockUsers = [
  {
    id: "user1",
    nickname: "吏移쒖떊?낆궗??,
    status: "USER",
    followers: 45,
    receivedLikes: 82,
    postCount: 3,
    posts: [
      {
        id: "1",
        title: "吏꾩쭨 ?댁궗 留덈졄??. 遺???늌 吏꾩쭨",
        content:
          "?낆궗??吏 ???щ룄 ???먮뒗???ㅻ뒛 ?뚯쓽?ㅼ뿉????湲고쉷??硫댁쟾?먯꽌 ?섏졇踰꾨┝. ?щ엺????蹂대뒗??'?닿쾶 ?쇱씠?쇨퀬 ?댁삩 嫄곕깘'怨??뚮━ 吏瑜대뒗??吏꾩쭨 二쇰㉨ 苑?伊먯뿀?? ?붿옣??媛??紐곕옒 ?멸퀬 ?붾뒗???닿? ???대윴 痍④툒 諛쏆븘???섎뒗吏 紐⑤Ⅴ寃좊꽕...",
        time: "10遺???,
        likes: 45,
        comments: 12,
      },
    ],
  },
  {
    id: "user2",
    nickname: "?뚮컮紐?4??,
    status: "USER",
    followers: 12,
    receivedLikes: 25,
    postCount: 1,
    posts: [
      {
        id: "2",
        title: "移댄럹 ?뚮컮 泥ル궇?몃뜲 媛쒖쭊??留뚮궓",
        content:
          "二쇰Ц 醫 ??쾶 諛쏆븯?ㅺ퀬 ?ㅼ쭨怨좎쭨 ?섑븳???뺥븯硫댁꽌 諛섎쭚?섎뒗 ?꾩???.. ???섎せ ?꾨땶???ъ옣?섏? ???????ㅼ뼱二쇨퀬 臾댁“嫄?二꾩넚?섎떎怨?鍮뚮옒. ?섎룄 ?곕━ 遺紐⑤떂 洹???먯떇?몃뜲 ???⑦븳??鍮뚯뼱???? ???뚮젮移섏슦怨??띕떎 吏꾩쭨.",
        time: "32遺???,
        likes: 25,
        comments: 8,
      },
    ],
  },
  {
    id: "user3",
    nickname: "?⑥돩怨좎떢??,
    status: "USER",
    followers: 82,
    receivedLikes: 150,
    postCount: 5,
    posts: [
      {
        id: "3",
        title: "?ъ닔???쒖닲 ?뚮━媛 ?덈Т 臾댁꽌??,
        content:
          "吏덈Ц ?섎굹 ???뚮쭏???쒖닲 ?뱁뫗 ?щ㈃??'?닿쾬???꾩쭅 紐곕씪??' ?섎뒗??吏꾩쭨 ?먯〈媛?諛붾떏移쒕떎. ???섎쫫 ?댁떖???쒕떎怨??섎뒗??.. ?닿? 吏꾩쭨 諛붾낫?멸? ?띔퀬 ?댁씪 異쒓렐?섍린媛 ?덈Т 臾닿쾪?? ?꾧? ??醫 ?대젮以?",
        time: "1?쒓컙 ??,
        likes: 82,
        comments: 34,
      },
    ],
  },
  {
    id: "user4",
    nickname: "?닿렐?먯젙?",
    status: "USER",
    followers: 56,
    receivedLikes: 120,
    postCount: 4,
    posts: [
      {
        id: "4",
        title: "?닿렐 10遺??꾩뿉 ???섏??????,
        content:
          "??μ? ?닿렐 以鍮꾪븯硫댁꽌 ?섎뒗 ?댁씪 ?꾩묠源뚯? ?앸궡?볦쑝?쇰꽕? ?먭린???댁씪 ?곗감 ?곕㈃?쒌뀑?뗣뀑 ?닿굅 媛?ㅻ씪?댄똿 ?꾨떂? 嫄곗젅?섎㈃ ?묒뾽 ???섎뒗 ?щ엺 痍④툒?섎땲源??꾨Т 留먮룄 紐??섍퀬 ?ㅼ떆 ?됱븯?? 吏꾩쭨 ??留됲? 二쎌쓣 寃?媛숈븘.",
        time: "2?쒓컙 ??,
        likes: 56,
        comments: 20,
      },
    ],
  },
  {
    id: "user5",
    nickname: "吏?섏쿋?덈Ъ?",
    status: "USER",
    followers: 124,
    receivedLikes: 350,
    postCount: 15,
    posts: [
      {
        id: "5",
        title: "?섎쭔 ?대젃寃??щ뒗 嫄??꾨땲吏...?",
        content:
          "吏묒뿉 ?ㅻ뒗 吏?섏쿋 ?덉뿉??洹몃깷 硫랁븯??李쎈컰留?蹂대뒗??媛묒옄湲??덈Ъ???곗쭚. ?닿? 臾댁뒯 ?곴킅??蹂닿쿋?ㅺ퀬 ?대젃寃?紐⑥슃?뱁븯硫??댁븘???섎굹 ?띕떎. 遺紐⑤떂? ?닿? 醫뗭? ?뚯궗 ?ㅼ뼱媛????吏?대뒗 以??꾨뒗??.. ?꾪솕濡?愿쒖갖?먭퀬 臾쇱뼱蹂대뒗???꾨Т?뉗? ?딆? 泥?紐⑹냼由?媛?ㅻ벉??寃??쒖씪 ?섎뱾??",
        time: "5?쒓컙 ??,
        likes: 124,
        comments: 56,
      },
    ],
    socialId: "kakao_test_user", // ?뚯뒪?몄슜 ?뚯뀥 ID 異붽?
  },
];

// [媛??DB] 寃뚯떆湲 ?뺣낫
const mockPosts = [
  {
    id: "1",
    userId: "user1",
    nickname: "吏移쒖떊?낆궗??,
    category: "怨좊?",
    title: "吏꾩쭨 ?댁궗 留덈졄??. 遺???늌 吏꾩쭨",
    content:
      "?낆궗??吏 ???щ룄 ???먮뒗???ㅻ뒛 ?뚯쓽?ㅼ뿉????湲고쉷??硫댁쟾?먯꽌 ?섏졇踰꾨┝. ?щ엺????蹂대뒗??'?닿쾶 ?쇱씠?쇨퀬 ?댁삩 嫄곕깘'怨??뚮━ 吏瑜대뒗??吏꾩쭨 二쇰㉨ 苑?伊먯뿀?? ?붿옣??媛??紐곕옒 ?멸퀬 ?붾뒗???닿? ???대윴 痍④툒 諛쏆븘???섎뒗吏 紐⑤Ⅴ寃좊꽕...",
    time: "10遺???,
    likes: 45,
    comments: 12,
  },
  {
    id: "2",
    userId: "user2",
    nickname: "?뚮컮紐?4??,
    category: "?쇱긽",
    title: "移댄럹 ?뚮컮 泥ル궇?몃뜲 媛쒖쭊??留뚮궓",
    content:
      "二쇰Ц 醫 ??쾶 諛쏆븯?ㅺ퀬 ?ㅼ쭨怨좎쭨 ?섑븳???뺥븯硫댁꽌 諛섎쭚?섎뒗 ?꾩???.. ???섎せ ?꾨땶???ъ옣?섏? ???????ㅼ뼱二쇨퀬 臾댁“嫄?二꾩넚?섎떎怨?鍮뚮옒. ?섎룄 ?곕━ 遺紐⑤떂 洹???먯떇?몃뜲 ???⑦븳??鍮뚯뼱???? ???뚮젮移섏슦怨??띕떎 吏꾩쭨.",
    time: "32遺???,
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    userId: "user3",
    nickname: "?⑥돩怨좎떢??,
    category: "?꾨줈",
    title: "?ъ닔???쒖닲 ?뚮━媛 ?덈Т 臾댁꽌??,
    content:
      "吏덈Ц ?섎굹 ???뚮쭏???쒖닲 ?뱁뫗 ?щ㈃??'?닿쾬???꾩쭅 紐곕씪??' ?섎뒗??吏꾩쭨 ?먯〈媛?諛붾떏移쒕떎. ???섎쫫 ?댁떖???쒕떎怨??섎뒗??.. ?닿? 吏꾩쭨 諛붾낫?멸? ?띔퀬 ?댁씪 異쒓렐?섍린媛 ?덈Т 臾닿쾪?? ?꾧? ??醫 ?대젮以?",
    time: "1?쒓컙 ??,
    likes: 82,
    comments: 34,
  },
  {
    id: "4",
    userId: "user4",
    nickname: "?닿렐?먯젙?",
    category: "怨좊?",
    title: "?닿렐 10遺??꾩뿉 ???섏??????,
    content:
      "??μ? ?닿렐 以鍮꾪븯硫댁꽌 ?섎뒗 ?댁씪 ?꾩묠源뚯? ?앸궡?볦쑝?쇰꽕? ?먭린???댁씪 ?곗감 ?곕㈃?쒌뀑?뗣뀑 ?닿굅 媛?ㅻ씪?댄똿 ?꾨떂? 嫄곗젅?섎㈃ ?묒뾽 ???섎뒗 ?щ엺 痍④툒?섎땲源??꾨Т 留먮룄 紐??섍퀬 ?ㅼ떆 ?됱븯?? 吏꾩쭨 ??留됲? 二쎌쓣 寃?媛숈븘.",
    time: "2?쒓컙 ??,
    likes: 56,
    comments: 20,
  },
  {
    id: "5",
    userId: "user5",
    nickname: "吏?섏쿋?덈Ъ?",
    category: "?쇱긽",
    title: "?섎쭔 ?대젃寃??щ뒗 嫄??꾨땲吏...?",
    content:
      "吏묒뿉 ?ㅻ뒗 吏?섏쿋 ?덉뿉??洹몃깷 硫랁븯??李쎈컰留?蹂대뒗??媛묒옄湲??덈Ъ???곗쭚. ?닿? 臾댁뒯 ?곴킅??蹂닿쿋?ㅺ퀬 ?대젃寃?紐⑥슃?뱁븯硫??댁븘???섎굹 ?띕떎. 遺紐⑤떂? ?닿? 醫뗭? ?뚯궗 ?ㅼ뼱媛????吏?대뒗 以??꾨뒗??.. ?꾪솕濡?愿쒖갖?먭퀬 臾쇱뼱蹂대뒗???꾨Т?뉗? ?딆? 泥?紐⑹냼由?媛?ㅻ벉??寃??쒖씪 ?섎뱾??",
    time: "5?쒓컙 ??,
    likes: 124,
    comments: 56,
  },
];

// --- API Endpoints ---

// 1. 寃뚯떆湲 紐⑸줉 議고쉶
app.get("/api/posts", (req, res) => {
  console.log("API: GET /api/posts hit");
  res.status(200).json({ success: true, posts: mockPosts });
});

// 2. 寃뚯떆湲 ?묒꽦
app.post("/api/posts", (req, res) => {
  const { title, content, userId, category, nickname } = req.body;
  const newPost = {
    id: `post_${Date.now()}`,
    userId: userId || "anonymous",
    nickname: nickname || "?덈줈?댄뙆??,
    title: title || content.substring(0, 20),
    content,
    time: "諛⑷툑 ??,
    likes: 0,
    comments: 0,
    category: category || "?쇱긽",
  };
  mockPosts.unshift(newPost);
  res.status(200).json({ success: true, post: newPost });
});

// 2-1. 寃뚯떆湲 ??젣
app.delete("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const postIndex = mockPosts.findIndex((p) => p.id === id);
  if (postIndex !== -1) {
    mockPosts.splice(postIndex, 1);
    res.status(200).json({ success: true, message: "寃뚯떆湲????젣?섏뿀?듬땲??" });
  } else {
    res.status(404).json({ success: false, message: "寃뚯떆湲??李얠쓣 ???놁뒿?덈떎." });
  }
});

// 2-2. 寃뚯떆湲 ?섏젙
app.put("/api/posts/:id", (req, res) => {
  const { id } = req.params;
  const { content, title } = req.body;
  const post = mockPosts.find((p) => p.id === id);
  if (post) {
    post.content = content;
    if (title) post.title = title;
    res.status(200).json({ success: true, post });
  } else {
    res.status(404).json({ success: false, message: "寃뚯떆湲??李얠쓣 ???놁뒿?덈떎." });
  }
});

// 3. ?ъ슜???꾨줈???곸꽭 議고쉶
app.get("/api/users/profile/:userId", (req, res) => {
  const { userId } = req.params;
  let user = mockUsers.find((u) => u.id === userId);

  if (user) {
    res.status(200).json({ success: true, data: user });
  } else {
    // mockUsers???녿뒗 寃쎌슦(寃뚯뒪????, 理쒓렐 寃뚯떆湲?먯꽌 ?됰꽕???뺣낫瑜?李얠븘遊?
    const lastPost = mockPosts.find((p) => p.userId === userId);
    res.status(200).json({
      success: true,
      data: {
        id: userId,
        nickname: lastPost ? lastPost.nickname : "?듬챸???덉슱",
        followers: 0,
        receivedLikes: 0,
        postCount: mockPosts.filter((p) => p.userId === userId).length,
        posts: mockPosts.filter((p) => p.userId === userId),
      },
    });
  }
});

// 4. ?붾줈???좉?
app.post("/api/users/follow", (req, res) => {
  const { followerId, followingId } = req.body;
  console.log(`Follow toggle: ${followerId} -> ${followingId}`);
  res.status(200).json({ success: true, message: "?붾줈???곹깭媛 蹂寃쎈릺?덉뒿?덈떎." });
});

// 4-1. ?꾨줎?몄뿏??諛깆뿏???곗씠???숆린??(?곕え??
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

// 5. ?볤? ?묒꽦 (Mock)
app.post("/api/posts/:id/comments", (req, res) => {
  const { content, userId, parentId } = req.body;
  const newComment = {
    id: `comment_${Date.now()}`,
    content,
    userId: userId || "anonymous",
    parentId: parentId || null,
    isMine: true,
    time: "諛⑷툑 ??,
  };
  res.status(201).json({ success: true, comment: newComment });
});

// 5-1. ?볤? ??젣 (Mock)
app.delete("/api/comments/:id", (req, res) => {
  res.status(200).json({ success: true, message: "?볤?????젣?섏뿀?듬땲??" });
});

// 6. ?뚯뀥 濡쒓렇??(?ㅼ젣 OAuth ?곕룞)
app.post("/api/auth/social", async (req, res) => {
  const { platform, code, redirectUri, isAccessToken, accessToken } = req.body;
  const actualCode = code || accessToken; // ?명솚???좎?

  console.log(
    `API: POST /api/auth/social hit (Platform: ${platform}, Code/Token: ${actualCode}, isAccessToken: ${isAccessToken})`,
  );

  // [媛쒕컻???뚯뒪??諛붿씠?⑥뒪]
  // 'test_code'濡??붿껌?섎㈃ real OAuth瑜?嫄대꼫?곌퀬 ?뚯뒪??怨꾩젙?쇰줈 濡쒓렇??泥섎━
  if (actualCode === "test_code") {
    console.log("API: Test login bypass activated");
    const testUser = mockUsers.find((u) => u.socialId === "kakao_test_user");
    return res.status(200).json({ success: true, user: testUser });
  }

  if (!actualCode || !redirectUri) {
    return res.status(400).json({ success: false, message: "?섎せ???붿껌: Auth Code??Redirect URI媛 ?꾨씫?섏뿀?듬땲??" });
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
      // 1. 移댁뭅???좏겙 諛쒓툒
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

      // 2. 移댁뭅???ъ슜???뺣낫 議고쉶
      const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${kakaoAccessToken}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      socialId = `kakao_${userResponse.data.id}`;
      socialNickname = userResponse.data.kakao_account?.profile?.nickname || "移댁뭅?ㅼ쑀?";
    } else if (platform === "google") {
      let googleAccessToken = actualCode;

      if (!isAccessToken) {
        // 湲곗〈 APK(?덈뱶濡쒖씠???대씪?댁뼵??ID濡??앹꽦??肄붾뱶)????명솚?깆쓣 ?꾪빐 ?덈뱶濡쒖씠???대씪?댁뼵??ID 怨좎젙 ?ъ슜
        const googleId = process.env.GOOGLE_ANDROID_CLIENT_ID; // ?덈뱶濡쒖씠??Client ID
        const googleSecret = ""; // ?덈뱶濡쒖씠???대씪?댁뼵?몃뒗 ?쒗겕由우쓣 ?꾩넚?섏? ?딆쓬

        if (!googleId) {
          throw new Error("Missing Google Android Client ID in environment variables");
        }

        console.log(`Exchanging Google code for token using Android Client ID. Redirect URI: ${redirectUri}`);
        // 1. 援ш? ?좏겙 諛쒓툒
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", googleId);
        // ?덈뱶濡쒖씠???대씪?댁뼵?몃뒗 client_secret ?뚮씪誘명꽣 ?먯껜瑜??앸왂
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
          return res.status(400).json({ success: false, message: "Google ?좏겙 援먰솚???ㅽ뙣?덉뒿?덈떎." });
        }
      } else {
        console.log("Using Google Access Token directly.");
      }

      // 2. 援ш? ?ъ슜???뺣낫 議고쉶
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });
      socialId = `google_${userResponse.data.id}`;
      socialNickname = userResponse.data.name || "援ш??좎?";
    }

    if (!socialId) {
      return res.status(400).json({ success: false, message: "吏?먰븯吏 ?딅뒗 ?뚮옯?쇱씠嫄곕굹 ?몄쬆???ㅽ뙣?덉뒿?덈떎." });
    }

    // 3. 湲곗〈 ?깅줉 ?좎? ?뺤씤
    const user = mockUsers.find((u) => u.socialId === socialId);

    // ?뚯뒪???먰솢?⑥쓣 ?꾪빐 ?뚯뀥 ID媛 留ㅼ묶?덈릺硫?user1 ?대씪???뚮젮以꾩? 怨좊??????덉쑝??
    // ?ㅼ젣 ?곕룞 ?꾨줈?몄뒪瑜??먰븯?⑥쑝誘濡??좉퇋 媛??flow瑜??곕쫭?덈떎.
    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      // 誘멸????좎????뚯썝媛???붾㈃?쇰줈 ?섏뼱媛????
      res.status(200).json({
        success: false,
        error: "NOT_REGISTERED",
        message: "?깅줉?섏? ?딆? ?ъ슜?먯엯?덈떎.",
        socialData: {
          socialId: socialId,
          nickname: socialNickname,
          platform: platform,
        },
      });
    }
  } catch (error) {
    console.error("Social Auth Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, message: "?뚯뀥 ?쒕쾭? ?듭떊 以?臾몄젣媛 諛쒖깮?덉뒿?덈떎." });
  }
});

// 5. ?뚯썝媛??(?곕え??
app.post("/api/auth/register", (req, res) => {
  const { nickname, gender, platform, birthYear, birthMonth, socialId } = req.body;
  const newUser = {
    id: `user_${Date.now()}`,
    socialId: socialId,
    nickname: nickname || "?덈줈???덉슱",
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

// 8. ?뚮┝ 議고쉶 (Mock)
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;
  res.status(200).json({
    success: true,
    notifications: [
      { id: "n1", type: "like", content: "?꾧뎔媛 ?뱀떊???뚮룄??怨듦컧?덉뒿?덈떎.", time: "諛⑷툑 ??, isRead: false },
    ],
  });
});

// 9. 寃뚯떆湲 諛섏쓳 (醫뗭븘???レ뼱??
app.post("/api/posts/:id/reaction", (req, res) => {
  res.status(200).json({ success: true, message: "諛섏쓳??湲곕줉?섏뿀?듬땲??" });
});

// 10. ?ы몴
app.post("/api/posts/:id/vote", (req, res) => {
  res.status(200).json({ success: true, message: "?ы몴媛 湲곕줉?섏뿀?듬땲??" });
});

// 11. ?쒕룞 湲곕줉 ??젣
app.delete("/api/users/:id/history", (req, res) => {
  const { id } = req.params;
  // 寃뚯떆湲 ??젣
  for (let i = mockPosts.length - 1; i >= 0; i--) {
    if (mockPosts[i].userId === id) {
      mockPosts.splice(i, 1);
    }
  }
  // ?좎? ?뺣낫 珥덇린??
  const user = mockUsers.find((u) => u.id === id);
  if (user) {
    user.postCount = 0;
    user.receivedLikes = 0;
    user.posts = [];
  }
  res.status(200).json({ success: true, message: "?쒕룞 湲곕줉????젣?섏뿀?듬땲??" });
});

// 12. ?덊눜 (怨꾩젙 ??젣)
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = mockUsers.findIndex((u) => u.id === id);
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1); // ?좎? ?꾩쟾 ??젣

    // ?덊눜???좎???寃뚯떆臾쇱? 紐낆꽭(?듬챸?쇰줈 ?④?)???곕씪 ?듬챸??泥섎━
    mockPosts.forEach((post) => {
      if (post.userId === id) {
        post.userId = "deleted_user";
        post.nickname = "?????녿뒗 ?덉슱";
      }
    });

    res.status(200).json({ success: true, message: "?덊눜 泥섎━媛 ?꾨즺?섏뿀?듬땲??" });
  } else {
    res.status(404).json({ success: false, message: "?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎." });
  }
});

// 13. STT (Mock)
app.post("/api/stt", (req, res) => {
  res.status(200).json({
    success: true,
    text: "?ㅻ뒛 ?섎（???뺣쭚 湲??뚮룄 媛숈븯?댁슂. ?섎뱺 ?쇱씠 留롮븯吏留??대젃寃??덉슱?먭쾶 ?몄뼱?볦쑝??議곌툑? 留덉쓬??媛踰쇱썙吏??寃?媛숈븘??",
  });
});

app.listen(PORT, () => {
  console.log(`?덉슱(Swell) ?쒕쾭媛 ?ы듃 ${PORT}?먯꽌 ?묐룞 以묒엯?덈떎.`);
});

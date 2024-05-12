// 1. 로컬스토리지에서 x-access-token 확인
const jwt = localStorage.getItem("X-AUTH-TOKEN");
setHeader(jwt);

// 로그아웃 버튼 이벤트 연결
const btnSignOut = document.querySelector("#sign-out");
btnSignOut.addEventListener("click", signOut);

async function setHeader(jwt) {
    if (!jwt) {
        return false;
    }

    // 2. 토큰 검증 API 요청
    const jwtReturn = await axios({
        method: "post", // http method
        url: "http://localhost:8080/jwt",
        headers: { "X-AUTH-TOKEN": jwt }, // packet header
        data: {}, // packet body
    });

    // 3. 유효한 토큰이 아니라면, 로그아웃
    const isValidJwt = jwtReturn.status === 200;

    if (!isValidJwt) {
        signOut();
        return false;
    }

    // 4. 유효한 토큰이라면 로그인 상태 확인. 헤더 로그인/회원가입 -> 안녕하세요 (닉네임)님으로 수정
    const nickname = jwtReturn.data;

    const spanNickname = document.querySelector(".nickname");

    spanNickname.innerText = nickname;
    
    console.log(nickname + "닉네임");
    return true;
}

function signOut(event) {
    localStorage.removeItem("X-AUTH-TOKEN"); // 토큰 삭제하고
    location.replace("./signin.html");
}
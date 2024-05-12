/* 
회원가입 API 연동

1. #signup 클릭
2. #userID, #password, nickname 값 확인 (정규표현식 확인)
3. 회원가입 API 요청
4. 요청이 성공적이지 않다면, alert message
5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동

*/
const btnSignUp = document.querySelector("#signup");

// 1. #signup 클릭
btnSignUp.addEventListener("click", signup);

async function signup(event) {
    const userId = document.querySelector("#userID").value;
    const password = document.querySelector("#password").value;
    const nickname = document.querySelector("#nickname").value;

    // 2. #email, #password, nickname 값 확인 (정규표현식 확인)
    const userIDRegExp = /^[a-z]+[a-z0-9]{5,19}$/; // 아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20
    const passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
    const nicknameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문

    if (!userIDRegExp.test(userId)) {
        return alert("아이디 형식: 영문자로 시작하는 영문자 또는 숫자 6-20");
    }
    if (!passwordRegExp.test(password)) {
        return alert("비밀번호 형식: 8-16 문자, 숫자 조합");
    }
    if (!nicknameRegExp.test(nickname)) {
        return alert("닉네임 형식 2-10 한글, 숫자 또는 영문");
    }

    // 3. 회원가입 API 요청
    try {
        const signUpReturn = await axios.post(`http://localhost:8080/user/save`, {
            userId: userId,
            password: password,
            nickname: nickname
        });

        // 4. 요청이 성공적이지 않다면, alert message
        if (signUpReturn.status === 201) {
            if (signUpReturn.data) {
                alert(signUpReturn.data);
            }
            return location.replace("./index.html");
        } else {
            return alert("요청에 문제가 생겼습니다.");
        }
    } catch (error) {
        console.error(error);
        return alert("요청에 문제가 생겼습니다.");
    }
}
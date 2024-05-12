const btnSignIn = document.querySelector("#signin");

// 1. #signin 클릭
btnSignIn.addEventListener("click", signIn);

async function signIn(event) {
	const userId = document.querySelector("#userID").value;
	const password = document.querySelector("#password").value;

	// 2. #email, #password 값 확인 (두 값이 모두 입력 되어 있지 않으면 return)
	if (!userId || !password) {
		return alert("회원 정보를 입력해주세요.");
	}

	// 3. 로그인 API 요청
	const signInReturn = await axios({
		method: "post", // http method  
		url: `http://localhost:8080/user/login`,
		headers: {}, // packet header
		data: { userId: userId, password: password }, // packet body
	});


	const signInStatus = signInReturn.status === 200;
	if(!signInStatus){
		return alert("아이디 혹은 비밀번호가 틀렸습니다.");
	}

	const jwt = signInReturn.data;
	localStorage.setItem("X-AUTH-TOKEN", jwt);
	alert("로그인이 완료되었습니다.");
	return location.replace("./index.html");


}
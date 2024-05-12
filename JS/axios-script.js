function getJwtToken() {
    return localStorage.getItem("X-AUTH-TOKEN");
}

var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(37.484649, 126.812369), //지도의 중심좌표.
	level: 7 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴


// 카카오 지도 확대, 축소
// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

//비동기 요청 데이터
async function getDataSet(category) {
	const jwt = getJwtToken();
	let qs = category;
	let dataSet;
	if (!qs) {
		dataSet = await axios({
			method: "GET",
			url: `http://localhost:8080/food`,
			headers: { "X-AUTH-TOKEN": jwt }
		});
		return dataSet.data;
	} else {
		dataSet = await axios({
			method: "GET",
			url: `http://localhost:8080/food/category?category=${qs}`,
			headers: { "X-AUTH-TOKEN": jwt }
		});
		return dataSet.data
	}
}

getDataSet();

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

//주소-좌표 변환 함수
function getAddress(address) {
	return new Promise((resolve, reject) => {
		// 주소로 좌표를 검색합니다
		geocoder.addressSearch(address, function (result, status) {
			// 정상적으로 검색이 완료됐으면 
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			}
			reject(new Error("[getAddress Error] : not valid Address"))
		});
	});
}

async function setMap(dataSet) {
	for (var i = 0; i < dataSet.length; i++) {
		let position = await getAddress(dataSet[i].address);

		// 마커를 생성합니다
		var marker = new kakao.maps.Marker({
			map: map, // 마커를 표시할 지도
			position: position, // 마커를 표시할 위치
		});

		markerArray.push(marker);

		// 마커에 표시할 인포윈도우를 생성합니다
		var infowindow = new kakao.maps.InfoWindow({
			content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
			disableAutoPan: true, // 인포윈도우를 열 때 지도가 자동으로 패닝하지 않을지의 여부 (기본값: false)
		});

		infowindowArray.push(infowindow);

		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
		// 이벤트 리스너로는 클로저를 만들어 등록합니다
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
		kakao.maps.event.addListener(
			marker,
			"click",
			makeOverListener(map, marker, infowindow, position)
		);
		// 커스텀: 맵을 클릭하면 현재 나타난 인포윈도우가 없어지게끔
		kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
	}
}

function makeOverListener(map, marker, infowindow, position) {
	return function () {
		// 1. 클릭시 다른 인포윈도우 닫기
		closeInfowindow();
		infowindow.open(map, marker);
		// 2. 클릭한 곳으로 짇 중심 이동하기
		map.panTo(position);
	};
}

// 커스텀
// 1. 클릭시 다른 인포윈도우 닫기
let infowindowArray = [];
function closeInfowindow() {
	for (let infowindow of infowindowArray) {
		infowindow.close();
	}
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다
function makeOutListener(infowindow) {
	return function () {
		infowindow.close();
	};
}
function getContent(data) {
	// 인포윈도우 가공
	return `
	<div class="infowindow">
	<div class="infowindow-img-container">
		<img src="${data.image}" class="infowindow-img">
	</div>
	<div class="infowindow-body">
		<h5 class="infowindow-title">${data.title}</h5>
		<p class="infowindow-address">${data.address}</p>
		<a href="${data.url}" class="infowindow-btn" target="_blank" >네이버 사이트</a>
	</div>
`;
}

//카테고리 분류
const categoryMap = {
	korean: "한식",
	chinese: "중식",
	japanese: "일식",
	american: "양식",
	snack: "분식",
	sushi: "회/초밥",
	cafe: "카페/디저트",
	etc: "기타"
};

const categoryList = document.querySelector(".categort-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	let categoryDataSet = await getDataSet(category);

	//기존 마커 삭제
	closeMarker();
	//기존 인포윈도우 닫기
	closeInfowindow();

	setMap(categoryDataSet);
}
let markerArray = [];
function closeMarker() {
	for (let marker of markerArray) {
		marker.setMap(null);
	}
}

async function setting() {
	try {
		const dataSet = await getDataSet();
		setMap(dataSet);
	} catch (error) {
		console.error(error);
	}

}
setting();

const modal = document.getElementById("add-restaurant");

document.querySelector(".nav-contact").addEventListener("click", function () {
	modal.style.display = "block";
});

document.querySelector(".btn-cancel").addEventListener("click", function () {
	modal.style.display = "none";
});

window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

async function addRestaurant() {
	const jwt = getJwtToken();
	const title = document.getElementById('title').value;
	const address = document.getElementById('address').value;
	const image = document.getElementById('image').value;
	const url = document.getElementById('url').value;
	const category = document.querySelector("select[name=category] option:checked").value;

	if (category === "") {
		alert("카테고리를 선택해주세요.");
		return;
	}

	const data = {
		title: title,
		address: address,
		image: image,
		url: url,
		category: category
	};

	try {
		const response = await axios.post('http://localhost:8080/food', data, {
			headers: { "X-AUTH-TOKEN": jwt }	
		});
		console.log('음식점 추가 성공: ', response);
		alert("음식점 정보를 추가했습니다!");
		// 모달 닫기
		closeModal();
	} catch (error) {
		console.error('음식점 추가 실패: ', error);
		alert("다시 시도해주세요");
		closeModal();
	}
	console.log(categoryValue);
}

document.getElementById('restaurant-form').addEventListener('submit', function (event) {
	event.preventDefault();
	addRestaurant();
});

function closeModal() {
	modal.style.display = "none";
}

// 로그아웃 버튼 이벤트 연결

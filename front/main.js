import { io } from 'socket.io-client';
/** 본인 비디오 */
const myFace = document.querySelector('.myFace');
/** 카메라 on/off 버튼 */
const cameraBtn = document.querySelector('.camera');
/** 스피커 on/off 버튼 */
const speakerBtn = document.querySelector('.speaker');
/** 상대방 비디오  */
const peerFace = document.querySelector('.peerFace');
/** 본인 MediaStream 저장 */
let myStream;
/** speaker */
let muted = false;
/** video */
let cameraOff = false;
/** websocket으로 통신 */
const socket = io('ws://localhost:3000', {
	withCredentials: true,
});

socket.on('connect', () => {
	console.log('connect');
});

socket.on('server', data => {
	console.log(data);
});

// 서버에서 사람이 들어오면 Peer A에 알립니다.
// 이로 인해 Peer A가 합류를 요청(offer) 합니다.
socket.on('comeHere', async () => {
	const offer = await myPeerConnection.createOffer();
	myPeerConnection.setLocalDescription(offer);
	socket.emit('offer', offer, 1);
});
// Peer B가 합류를 받고 ok함(answer)
socket.on('offer', async offer => {
	myPeerConnection.setRemoteDescription(offer);
	const answer = await myPeerConnection.createAnswer();
	myPeerConnection.setLocalDescription(answer);
	socket.emit('answer', answer, 1);
});
// Peer A가 ok받는다.
socket.on('answer', answer => {
	myPeerConnection.setRemoteDescription(answer);
});

socket.on('ice', ice => {
	myPeerConnection.addIceCandidate(ice);
});

socket.emit('client', '클라이언트 입니다.');

/** 본인 비디오 연결 */
async function getMedia() {
	try {
		myStream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: true,
		});

		myFace.srcObject = myStream;
	} catch (err) {
		console.error('getMedia 과정에서 에러가 났습니다. \n', err);
	}
}

/** Peer A 초기화 */
const myPeerConnection = new RTCPeerConnection();

function settingPeerConnection() {
	myPeerConnection.addEventListener('addstream', data => {
		peerFace.srcObject = data.stream;
	});

	myPeerConnection.addEventListener('icecandidate', data => {
		socket.emit('ice', data.candidate, 1);
	});

	myStream
		.getTracks()
		.forEach(track => myPeerConnection.addTrack(track, myStream));
}
// 비동기 제어
async function getMediaAndConnection() {
	await getMedia();
	settingPeerConnection();
}
getMediaAndConnection();

// 웹브라우저에 먼저 들어온 사람이 Peer A가 됩니다. 채널은 임의로 1번으로 고정하겠습니다.
socket.emit('join', 1);

// speaker handler
function speakerOnOff() {
	myStream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
	if (!muted) {
		speakerBtn.innerText = '스피커 on';
		muted = true;
	} else {
		speakerBtn.innerText = '스피커 off';
		muted = false;
	}
}
// camera handler
function cameraOnOff() {
	myStream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
	if (!cameraOff) {
		cameraBtn.innerText = '카메라 on';
		cameraOff = true;
	} else {
		cameraBtn.innerText = '카메라 off';
		cameraOff = false;
	}
}

speakerBtn.addEventListener('click', speakerOnOff);
cameraBtn.addEventListener('click', cameraOnOff);

/// ================== 데이터 채널 부분 ================

// // Offer side
// const channel = myPeerConnection.createDataChannel('chat');
// channel.onopen = () => {
// 	channel.send('Hi you');
// };
// channel.onmessage = e => {
// 	console.log('Offer side', e.data);
// };

// // Answerer side
// myPeerConnection.ondatachannel = e => {
// 	const channel = e.channel;
// 	channel.onopen = e => {
// 		channel.send('Hi back');
// 	};
// 	channel.onmessage = e => {
// 		console.log('Answerer side', e.data);
// 		show.innerText = e.data;
// 	};
// };

// Both sides 위의 두 로직 합치기
const channel = myPeerConnection.createDataChannel('chat', {
	negotiated: true,
	id: 0,
});
channel.onopen = () => {
	channel.send('Hi!');
};
channel.onmessage = e => {
	console.log(e.data);
	show.innerText = e.data;
};

const input = document.querySelector('.input');
const btn = document.querySelector('.channel');
const show = document.querySelector('.show');

btn.addEventListener('click', () => {
	channel.send(input.value);
	input.value = '';
});

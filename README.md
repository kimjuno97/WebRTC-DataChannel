# [WebRTC로 서버 안태우고 라이브채팅 구현하기](https://kimjunho97.tistory.com/9)

### 구동방법

- backend 디렉토리에서 터미널을 열고 'npm start'
- front 디렉토리에서 터미널을 열고 'npm start'

### 실행

두개의 브라우저를 열고 [http://localhost:4000](http://localhost:4000) 으로접속하면,
서로 connection되는 것을 볼 수 있습니다.
연결하는 절차는 모두 생략되어 있습니다.
실제로 사용하려면 그 과정을 구현해줘야합니다.
또한, 3명이상이 될때는 고려하지 않은 로직인점 참고해주세요.

### 참고

npm package의script에 아래처럼 install 명령어가 세팅되어 있습니다.

```
	"scripts": {
		"start": "webpack-dev-server --hot",
		"prestart": "npm install"
	},
```

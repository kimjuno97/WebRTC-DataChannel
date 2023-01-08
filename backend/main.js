import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: ['http://localhost:4000', 'http://10.58.52.96:4000'],
		credentials: true,
	},
});

/** 사람 수 */
let human = 0;

io.on('connect', socket => {
	socket.on('client', data => {
		console.log(data);
	});
	socket.emit('server', '서버입니다');

	// 두명이상이 되면 클라이언트에 알린다.
	socket.on('join', channel => {
		socket.join(channel);
		human += 1;
		if (human > 1) {
			socket.to(channel).emit('comeHere');
		}
	});
	// offer 전달
	socket.on('offer', (offer, channel) => {
		socket.to(channel).emit('offer', offer);
	});
	// answer 전달
	socket.on('answer', (answer, channel) => {
		socket.to(channel).emit('answer', answer);
	});
	// video 정보를 보냄
	socket.on('ice', (ice, channel) => {
		socket.to(channel).emit('ice', ice);
	});
});

io.listen(3000);

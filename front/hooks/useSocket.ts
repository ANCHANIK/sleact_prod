import io from 'socket.io-client';
import { useCallback } from 'react';

const backUrl = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {}; // 다양한 소켓 관리
const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect(); // socket 연결 종료
      delete sockets[workspace]; // 연결 종료 후 삭제
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }
  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }
  // connect: api 와 연결
  // sockets[worksapce].emit('hello', 'world'); // emit: 데이터 보내는 명령어. ('이벤트명', data)
  // sockets[worksapce].on('message', (data) => {
  //   // on: 데이터 받는 명령어. ('이벤트명', callback함수)
  //   console.log(data);
  // });
  // sockets[worksapce].on('data', (data) => {
  //   console.log(data);
  // })
  // sockets[worksapce].on('onlineList', (data) => {
  //   console.log(data);
  // })

  // connect와 disconnect를 잘 해주지 않으면, 다른 workspace에 잘못된 통신이 오갈수 있다.

  return [sockets[workspace], disconnect];
};

export default useSocket;

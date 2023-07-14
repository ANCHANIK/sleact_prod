import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, DragOver, Header } from '@pages/Channel/styles';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import { useParams } from 'react-router';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import useSWRInfinite from 'swr/infinite';
import { IChannel, IChat, IUser } from '@typings/db';
import useSocket from '@hooks/useSocket';
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import InviteChannelModal from '@components/InviteChannelModal';
import { toast } from 'react-toastify';

const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { data: myData } = useSWR('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const { data: channelMemberData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  // socket 연결
  const [socket] = useSocket(workspace);

  // useSWRInfinite 선언시 같이 사용하기 좋은 선언
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const scrollbarRef = useRef<Scrollbars>(null);

  const onSubmitForm = useCallback(
    (e: HTMLFormElement) => {
      e.preventDefault();

      if (chat?.trim() && chatData && channelData) {
        // 채팅시 생기는 딜레이 mutate 사용으로 방지
        const savedChat = chat;
        mutateChat((preChatData) => {
          preChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return preChatData;
        }, false).then(() => {
          localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
          setChat('');
          if (scrollbarRef.current) scrollbarRef.current?.scrollToBottom();
        });

        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
            content: savedChat,
          })
          .then((res) => {
            mutateChat();
            setChat('');
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, channelData, mutateChat, setChat, workspace, channel],
  );

  const onMessage = useCallback(
    (data: IChat) => {
      if ((data.Channel.name === channel && data.content.startsWith('uploads\\')) || data.UserId !== myData?.id) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
            } else {
              toast.success('New Messages!', {
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
                closeOnClick: true,
              });
            }
          }
        });
      }
    },
    [channel, myData, mutateChat],
  );

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  // 로딩시 스크롤바 제일 아래에 위치
  useEffect(() => {
    if (chatData?.length === 1) {
      setTimeout(() => {
        scrollbarRef.current?.scrollToBottom();
      }, 500);
    }
  }, [chatData]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  }, [workspace, channel]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData();
      if (e.dataTransfer.items) {
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          if (e.dataTransfer.items[i].kind === 'file') {
            const images = e.dataTransfer.items[i].getAsFile();
            console.log(images);
            formData.append('image', images);
          }
        }
      } else {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const files = e.dataTransfer.files[i];
          formData.append('image', files);
        }
      }
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
      });
    },
    [workspace, channel],
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  if (!myData) {
    return null;
  }

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMemberData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            초대하기
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} placeholder={''} />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default Channel;

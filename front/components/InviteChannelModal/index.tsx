import React, { useCallback, useState, VFC } from 'react';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}
const InviteChannelModal: VFC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const { data: userData } = useSWR<IUser>(
    // data : userData 데이터 변수명 개명
    '/api/users',
    fetcher,
    {
      dedupingInterval: 2000,
    },
  );
  const { mutate: mutateMember } = useSWR<IUser[]>(
    userData && channel ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    // 로그인 상태일때만 channel 정보를 가져옴
    fetcher,
  );

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();

      if (!newMember || !newMember.trim()) {
        return;
      }

      axios
        .post(
          `/api/workspaces/${workspace}/channels/${channel}/members`,
          {
            email: newMember,
          },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          setShowInviteChannelModal(false);
          setNewMember('');
          mutateMember();
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [workspace, newMember],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>채널 멤버 초대</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;

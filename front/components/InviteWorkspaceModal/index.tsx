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
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}
const InviteWorkspaceModal: VFC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const { data: userData } = useSWR<IUser | false>(
    // data : userData 데이터 변수명 개명
    '/api/users',
    fetcher,
    {
      dedupingInterval: 2000,
    },
  );
  const { data: channelData, mutate: mutateMember } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
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
          `/api/workspaces/${workspace}/members`,
          {
            email: newMember,
          },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          setShowInviteWorkspaceModal(false);
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
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;

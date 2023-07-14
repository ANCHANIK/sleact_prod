import { NavLink, useLocation } from 'react-router-dom';
import React, { useEffect, VFC } from 'react';
import { IUser } from '@typings/db';
import { useParams } from 'react-router';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

interface Props {
  member: IUser;
  isOnline: boolean;
}
const EachDM: VFC<Props> = ({ member, isOnline }) => {
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  const date = localStorage.getItem(`${workspace}-${member.id}`) || 0;
  const { data: count, mutate } = useSWR<number>(
    userData ? `/api/workspaces/${workspace}/dms/${member.id}/unreads?after=${date}` : null,
    fetcher,
  );

  useEffect(() => {
    if (location.pathname === `/workspace/${workspace}/dm/${member.id}`) {
      mutate(0);
    }
  }, [mutate, location.pathname, workspace, member]);

  return (
    <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
      <i
        className={`c-icon c-member__presence c-presence c-icon--inline ${
          isOnline ? 'c-presence--active c-icon--presence-online' : 'c-presence--away c-icon--presence-offline'
        }`}
        aria-hidden="true"
        data-qa="presence_indicator"
        data-qa-presence-self="false"
        data-qa-presence-active="false"
        data-qa-presence-dnd="false"
      />
      <span>{member.nickname}</span>
      {member.id === userData?.id && <span> (나)</span>}
      {(count && count > 0 && <span className="count">{count}</span>) || null}
    </NavLink>
  );
};

export default EachDM;

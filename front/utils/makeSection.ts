import { IChat, IDM } from '@typings/db';
import dayjs from 'dayjs';

export default function makeSection(chatList: (IChat | IDM)[]) {
  const sections: { [keys: string]: (IChat | IDM)[] } = {};

  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}

/*
  [
    {id: 1, d: '2021-04-18'},
    {id: 2, d: '2021-04-21'},
    {id: 3, d: '2021-04-20'},
    {id: 4, d: '2021-04-21'},
  ]

  section = [
    '2021-04-18': [1],
    '2021-04-20': [3],
    '2021-04-21': [2, 4]
  ]

*/

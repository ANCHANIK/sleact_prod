import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

// email, nickname 중복으로 인해 custom hooks 제작
type ReturnTypes<T> = [T, (e: ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>];

const useInput = <T>(initialData: T): ReturnTypes<T> => {
  // TS가 인라인 콜백함수는 매개변수를 추론해 준다.
  //<T=any> : 제네릭 타입
  // T = type임
  // T 가 String이면 return 값도 string

  // any 대신 => ChangeEvent<HTMLInputElement>,
  // e.target.value 대신 => e.target.value as unknown as T

  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as unknown as T);
    
  }, [initialData]);

  return [value, handler, setValue];
};

export default useInput;

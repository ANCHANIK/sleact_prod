import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Form, Error, Label, Input, LinkContainer, Header, Button, Success } from './styles';
import useInput from "@hooks/useInput";
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { Redirect, useHistory } from 'react-router';

const SignUp = () => {
  const {data, mutate} = useSWR('/api/users', fetcher);
  const history = useHistory();

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, setPassword] = useInput('');
  const [passwordCheck, setPasswordCheck] = useInput('');
  const [mismatchError, setMismatchError] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const [validation, setValidation] = useState(true);
  const [validationText, setValidationText] = useState('');

  // 중복 제거로 custom hook 제작
  // const onChangeEmail = useCallback( (e) => {
  //   setEmail(e.target.value);
  // },[]);
  // const onChangeNickname = useCallback( (e) => {
  //   setNickname(e.target.value);
  // },[]);
  useEffect(() => {
    email.length > 0 && setValidation(true);
    nickname.length > 0 && setValidation(true);
    password.length > 0 && setValidation(true);
    passwordCheck.length > 0 && setValidation(true);
    
  }, [data ,email, nickname, password, passwordCheck, signUpSuccess])
  
  const onChangePassword = useCallback( (e) => {
    setPassword(e);
    setMismatchError(e.target?.value !== passwordCheck);
    
  },[passwordCheck]); // 함수 외부의 변수는 작성할 필요 없음

  const onChangePasswordCheck = useCallback( (e) => {
    setPasswordCheck(e);
    setMismatchError(e.target?.value !== password);
  },[password]);

  const onSubmit = useCallback( (e) => {
    
    e.preventDefault();

    // validation
    if(!email) {
      setValidation(false);
      setValidationText('이메일을 입력해 주세요');
      return;
    }
    if(!nickname) {
      setValidation(false);
      setValidationText('닉네임을 입력해 주세요.');
      return;
    }
    if(!password) {
      setValidation(false);
      setValidationText('비밀번호를 입력해 주세요.');
      return;
    }
    if(!passwordCheck) {
      setValidation(false);
      setValidationText('비밀번호 확인을 입력해 주세요.');
      return;
    }
    
    if(!mismatchError && email && nickname && password && passwordCheck){
      // 요청 보내기 전 초기화 작업
      setSignUpError('');
      setSignUpSuccess(false);
      axios
        .post('/api/users', {     // back port num : 8081
        email,
        nickname,
        password,
      })
      .then((res) => {
        setSignUpSuccess(true);
        if(res.data === "ok") {
          setTimeout(() => {
            history.push('/login');
          }, 3000)
        }
      }) // 성공
      .catch((err) => {
        setSignUpError(err.response.data);
      }) // 실패
      .finally(() => {}); // 성공하든 실패하든 공통적으로 실행

    }
  }, [email, nickname, password, passwordCheck, mismatchError]);
  
  if (data === undefined) {
    return <>...로딩중</>
  }

  // return 들은 항상 hooks 밑에 있어야 한다.
  if (data) {
    return <Redirect to="/workspace/sleact/channel/일반" />
  }
  
  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="nickname-label">
          <span>닉네임</span>
          <div>
            <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
        </Label>
        <Label id="password-check-label">
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              id="password-check"
              name="password-check"
              value={passwordCheck}
              onChange={onChangePasswordCheck}
            />
          </div>
          { !validation && <Error>{validationText}</Error>}
          
          {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
          {signUpError && <Error>{signUpError}</Error>}
          {signUpSuccess && <Success>회원가입되었습니다! 로그인 페이지로 이동합니다.</Success>}
        </Label>
        <Button type="submit">회원가입</Button>
      </Form>
      <LinkContainer>
        이미 회원이신가요?&nbsp;
        <Link to="/login">로그인 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default SignUp;

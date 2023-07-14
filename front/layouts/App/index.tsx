import React from 'react';
import loadable from '@loadable/component';
import { Switch, Route, Redirect } from 'react-router-dom';

// import Login from '@pages/Login';
// import SignUp from '@pages/SignUp';
// import Workspace from '@layouts/Workspace';

//code spliting
const LogIn = loadable(() => import('@pages/Login'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Workspace = loadable(() => import('@layouts/Workspace'));

const App = () => {
  return (
    <Switch>
      <Redirect exact path="/" to="/login" />
      <Route path="/login" component={LogIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/workspace/:workspace" component={Workspace} />
      // /workspace/:'파라미터' : ':' 파라미터를 읽음
    </Switch>
  );
};

export default App;

// pages - 서비스 페이지
// components - 짜잘한 컴포넌트
// layouts - 페이지들 간 공통 레이아웃

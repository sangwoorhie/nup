import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../src/css/index.css';

// 구글 클라이언트 ID 추가
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;
const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID!;
console.log('clientId', clientId);
console.log('naverClientId', naverClientId);

Modal.setAppElement('#root');

// Naver 로그인 SDK 스크립트 추가
const naverScript = document.createElement('script');
naverScript.src =
  'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
naverScript.async = true;
document.head.appendChild(naverScript);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

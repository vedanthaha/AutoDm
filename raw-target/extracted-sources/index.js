import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tokens.css';
import './styles/tailwind.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { PostHogProvider } from 'posthog-js/react'
import { GoogleOAuthProvider } from '@react-oauth/google';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);
const options = {
  api_host: "https://us.i.posthog.com",
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    {/* <React.StrictMode> */}

    <GoogleOAuthProvider clientId="513244001098-sc5uaftko99q9d30mm87f94hveshjfh1.apps.googleusercontent.com">

      {/* <PostHogProvider
      apiKey="phc_PsnyQsx7c41FforOqHHVStRBLvmP5ck7X7PjsNAOgn2"
      options={options}
    >
       */}
      <App />
      {/* </PostHogProvider> */}
    </GoogleOAuthProvider>

    {/* </React.StrictMode> */}
  </BrowserRouter>
);

reportWebVitals();

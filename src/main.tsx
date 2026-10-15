import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router";
import { router } from "./app/router";
import { useAuthStore } from './core/auth/store';
import './index.css'

// 앱 시작 시 저장된 토큰으로 로그인 상태 확인 (한 번만 실행)
void useAuthStore.getState().loadMe();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

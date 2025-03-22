import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css'; // 更新样式导入路径
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

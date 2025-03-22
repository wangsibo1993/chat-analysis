import React, { useState } from 'react';
import './App.css';
import ConversationPanel from './components/ConversationPanel/ConversationPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import useFileUpload from './hooks/useFileUpload';
import useChatApi from './hooks/useChatApi';
import { parseContentToMessages } from './utils/conversationUtils';

function App() {
  // 对话展示相关状态
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  
  // AI对话相关状态
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  // 模板预览相关状态
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ id: null, name: '', content: '', format: 'markdown' });
  
  // 使用自定义钩子
  const { handleFileUpload } = useFileUpload(setMessages, setAllConversations, setCurrentConversationIndex);
  const { sendMessage, handleKeyPress, isLoading } = useChatApi(chatMessages, setChatMessages);

  // 解析消息
  const parseMessages = (text) => {
    if (!text.trim()) return;

    const parsedMessages = parseContentToMessages(text);
    
    if (parsedMessages.length > 0) {
      setMessages(parsedMessages);
      // 更新对话列表
      const newConversation = {
        id: allConversations.length > 0 ? Math.max(...allConversations.map(c => c.id)) + 1 : 1,
        messages: parsedMessages
      };
      setAllConversations([...allConversations, newConversation]);
      setCurrentConversationIndex(allConversations.length);
    }
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: chatInput
    };
    
    setChatInput('');
    sendMessage(userMessage);
  };

  return (
    <div className="App">
      <ConversationPanel 
        messages={messages}
        allConversations={allConversations}
        currentConversationIndex={currentConversationIndex}
        setCurrentConversationIndex={setCurrentConversationIndex}
        setMessages={setMessages}
        setChatInput={setChatInput}
        onParseMessages={parseMessages}
        onFileUpload={handleFileUpload}
      />

      {/* 在App组件中找到ChatPanel组件的使用位置，添加conversationMessages属性 */}
      <ChatPanel 
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onKeyPress={handleKeyPress}
        conversationMessages={messages} // 添加这一行，传递对话展示区域的消息
      />
      
      {/* 模板预览模态框 */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-content preview-modal">
            <h3>预览: {currentTemplate.name}</h3>
            <div className="template-preview">
              {currentTemplate.format === 'markdown' ? (
                <div className="markdown-preview">
                  <pre>{currentTemplate.content}</pre>
                </div>
              ) : (
                <pre>{currentTemplate.content}</pre>
              )}
            </div>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowPreviewModal(false)}
              >
                关闭
              </button>
              <button 
                className="modal-button use"
                onClick={() => {
                  setChatInput(currentTemplate.content);
                  setShowPreviewModal(false);
                }}
              >
                使用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
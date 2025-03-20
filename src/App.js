import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationWindowRef = useRef(null);
  const chatWindowRef = useRef(null);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const parseMessages = () => {
    if (!inputText.trim()) return;

    const messagePattern = /(assistant|user):(.*?)(?=(assistant:|user:|$))/gs;
    const matches = [...inputText.matchAll(messagePattern)];
    
    const parsedMessages = matches.map(match => ({
      role: match[1].trim(),
      text: match[2].trim()
    }));

    setMessages(parsedMessages);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: chatInput
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://10.139.162.46:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwq:32b',
          messages: [...chatMessages, userMessage],
          stream: true
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let inferenceProcess = '';
      let actualResult = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        // 假设推理过程和实际结果在流中有特定标记
        if (chunk.includes('推理过程')) {
          inferenceProcess += chunk;
        } else if (chunk.includes('实际结果')) {
          actualResult += chunk;
        }
      }

      console.log('Inference Process:', inferenceProcess);
      console.log('Actual Result:', actualResult);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `推理过程: ${inferenceProcess}\n实际结果: ${actualResult}`
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (conversationWindowRef.current) {
      conversationWindowRef.current.scrollTop = conversationWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const getAvatar = (role) => {
    return role === 'assistant' 
      ? 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer';
  };

  return (
    <div className="App">
      <div className="conversation-panel">
        <div className="panel-header">对话展示</div>
        <div className="chat-window" ref={conversationWindowRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'assistant' ? '坐席' : '客户'}
              </div>
              <div className="message-container">
                <div className="avatar">
                  <img src={getAvatar(message.role)} alt={message.role} />
                </div>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="input-container">
          <textarea
            className="input-box"
            value={inputText}
            onChange={handleInputChange}
            placeholder="请输入对话内容，格式如：assistant:喂。 user:喂，你好。"
          />
          <button className="parse-button" onClick={parseMessages}>
            解析并展示
          </button>
        </div>
      </div>

      <div className="chat-panel">
        <div className="panel-header">AI 对话</div>
        <div className="chat-window" ref={chatWindowRef}>
          {chatMessages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-role">
                {message.role === 'assistant' ? 'AI' : '我'}
              </div>
              <div className="message-container">
                <div className="avatar">
                  <img src={getAvatar(message.role)} alt={message.role} />
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <textarea
            className="input-box chat-input"
            value={chatInput}
            onChange={handleChatInputChange}
            onKeyPress={handleKeyPress}
            placeholder="输入消息，按Enter发送..."
          />
          <button 
            className="send-button" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

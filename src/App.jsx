import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Key, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsKeySaved(true);
    }
  };

  const clearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsKeySaved(false);
    setResultImage(null);
    setStory('');
  };

  const generateFairyTale = async () => {
    if (!story.trim()) {
      setError('이야기를 먼저 들려주세요!');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setResultImage(null);

    try {
      // Using @google/genai
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const response = await ai.models.generateImages({
        model: 'gemini-3.1-flash-image-preview',
        prompt: `A beautiful kid-friendly fairy tale book illustration of: ${story}. Vibrant colors, magical, enchanting, high quality, masterpiece.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        }
      });
      
      if (response && response.generatedImages && response.generatedImages.length > 0) {
        // Retrieve base64 image data
        const image = response.generatedImages[0].image; 
        setResultImage(`data:image/jpeg;base64,${image.imageBytes}`);
      } else {
         setError('이미지를 생성하지 못했어요. 다시 시도해주세요.');
      }
      
    } catch (err) {
      console.error(err);
      setError('마법을 부리는 중 문제가 생겼어요: ' + (err.message || err.toString()));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!isKeySaved ? (
          <motion.div 
            key="setup"
            className="glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h1><Sparkles size={36} color="#FFDF00" /> 상상 요술 지팡이</h1>
            <p>비밀의 마법 열쇠(API Key)를 입력해서 요술을 시작하세요!</p>
            <div style={{ textAlign: 'left' }}>
              <label className="label">Gemini API Key</label>
              <input 
                type="password" 
                placeholder="AI 마법 열쇠를 넣어주세요..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <button onClick={saveKey} disabled={!apiKey.trim()}>
              <Key size={20} /> 마법 시작하기
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="main"
            className="glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}><Sparkles size={28} /> 요술 스케치북</h2>
              <button 
                onClick={clearKey} 
                style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.1)', color: '#333', boxShadow: 'none' }}
              >
                열쇠 변경
              </button>
            </div>

            {!resultImage && !isGenerating ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p>어떤 상상을 하고 있나요? 자유롭게 이야기해주세요!</p>
                <textarea 
                  placeholder="예: 하늘을 나는 분홍색 코끼리와 달콤한 솜사탕 구름..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                />
                {error && <p style={{ color: '#FF0844', fontWeight: 'bold' }}>{error}</p>}
                
                <button onClick={generateFairyTale} style={{ width: '100%' }}>
                  <ImageIcon size={20} /> 상상을 현실로 만들기!
                </button>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                style={{ padding: '40px 0' }}
              >
                <div className="loading-spinner"></div>
                <h2 style={{ color: 'var(--primary)' }}>요정이 그림을 그리고 있어요...</h2>
                <p>조금만 기다려주세요 🧚‍♀️✨</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="fairy-tale-layout">
                  <div className="fairy-tale-image">
                    <div className="image-card">
                      <img src={resultImage} alt="상상한 그림" />
                    </div>
                  </div>
                  <div className="fairy-tale-text">
                    <p style={{ fontSize: '1.4rem', fontStyle: 'italic', fontWeight: '600', color: '#444' }}>
                      "{story}"
                    </p>
                    <p>우리 친구의 멋진 상상이 동화책의 한 페이지로 완성되었어요!</p>
                  </div>
                </div>
                
                <button onClick={() => { setResultImage(null); setStory(''); }} style={{ marginTop: '20px' }}>
                  <RotateCcw size={20} /> 새로운 동화 만들기
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

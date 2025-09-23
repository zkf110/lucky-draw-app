import React, { useState, useEffect } from 'react';
import './App.css';
import AnimationScreen from './AnimationScreen';

function App() {
  const [allNumbers, setAllNumbers] = useState([]);
  const [thirdPrizeWinners, setThirdPrizeWinners] = useState([]);
  const [secondPrizeWinners, setSecondPrizeWinners] = useState([]);
  const [firstPrizeWinners, setFirstPrizeWinners] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinningNumber, setCurrentWinningNumber] = useState(null);
  const [drawType, setDrawType] = useState(null); // 'third' | 'second' | 'first'

  useEffect(() => {
    // Initialize numbers from 1 to 200
    const numbers = Array.from({ length: 200 }, (_, i) => i + 1);
    setAllNumbers(numbers);
  }, []);

  const getRandomNumber = (availableNumbers) => {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    return availableNumbers[randomIndex];
  };

  const startDraw = async (prizeType, count) => {
    if (isDrawing) return;

    setIsDrawing(true);
    setDrawType(prizeType);
    setCurrentWinningNumber(null); // Clear previous winning number

    // 5-second animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    let newWinners = [];
    let availableForDraw = [...allNumbers];

    // 按原实现风格：高等级奖项抽取前排除低等级已中签号码
    if (prizeType === 'second') {
      // Exclude third prize winners from second prize draw
      availableForDraw = availableForDraw.filter(num => !thirdPrizeWinners.includes(num));
    } else if (prizeType === 'first') {
      // Exclude second and third prize winners from first prize draw
      availableForDraw = availableForDraw
        .filter(num => !thirdPrizeWinners.includes(num))
        .filter(num => !secondPrizeWinners.includes(num));
    }

    for (let i = 0; i < count; i++) {
      if (availableForDraw.length === 0) break;

      const winner = getRandomNumber(availableForDraw);
      newWinners.push(winner);

      // Remove the drawn number from available numbers
      availableForDraw = availableForDraw.filter(num => num !== winner);

      // Update current winning number for animation display
      setCurrentWinningNumber(winner);
      await new Promise(resolve => setTimeout(resolve, 350)); // Short delay for visual effect
    }

    if (prizeType === 'third') {
      setThirdPrizeWinners(prev => [...prev, ...newWinners]);
    } else if (prizeType === 'second') {
      setSecondPrizeWinners(prev => [...prev, ...newWinners]);
    } else if (prizeType === 'first') {
      setFirstPrizeWinners(prev => [...prev, ...newWinners]);
    }

    setAllNumbers(availableForDraw); // Update the global pool of numbers
    setIsDrawing(false);
    setDrawType(null);
    setCurrentWinningNumber(null); // Clear after draw
  };

  return (
    <div className="App">
      {isDrawing && <AnimationScreen winningNumber={currentWinningNumber} />}

      <header className="App-header">
        <h1>浙江交通集团2026届校园招聘抽奖</h1>
        <p className="subtitle">交融天下 通达致远</p>
      </header>

      <main className="App-main">
        <div className="prize-layout">
          {/* 第一行：一等奖 */}
          <div className="prize-row top">
            <div className="prize-section">
              <h2>一等奖 (1名)</h2>
              <button
                onClick={() => startDraw('first', 1)}
                disabled={
                  isDrawing ||
                  firstPrizeWinners.length >= 1 ||
                  secondPrizeWinners.length < 10 ||
                  thirdPrizeWinners.length < 20
                }
                className="draw-button first-prize"
              >
                {firstPrizeWinners.length >= 1 ? '已抽完' : '抽取一等奖'}
              </button>
              <div className="winners-list">
                {firstPrizeWinners.length > 0 ? (
                  firstPrizeWinners.map((winner, index) => (
                    <span key={index} className="winner-number">{winner}</span>
                  ))
                ) : (
                  <p>暂无中奖者</p>
                )}
              </div>
            </div>
          </div>

          {/* 第二行：二、三等奖 */}
          <div className="prize-row bottom">
            <div className="prize-section">
              <h2>二等奖 (10名)</h2>
              <button
                onClick={() => startDraw('second', 10)}
                disabled={
                  isDrawing ||
                  secondPrizeWinners.length >= 10 ||
                  thirdPrizeWinners.length < 20
                }
                className="draw-button second-prize"
              >
                {secondPrizeWinners.length >= 10 ? '已抽完' : '抽取二等奖'}
              </button>
              <div className="winners-list">
                {secondPrizeWinners.length > 0 ? (
                  secondPrizeWinners.map((winner, index) => (
                    <span key={index} className="winner-number">{winner}</span>
                  ))
                ) : (
                  <p>暂无中奖者</p>
                )}
              </div>
            </div>

            <div className="prize-section">
              <h2>三等奖 (20名)</h2>
              <button
                onClick={() => startDraw('third', 20)}
                disabled={isDrawing || thirdPrizeWinners.length >= 20}
                className="draw-button"
              >
                {thirdPrizeWinners.length >= 20 ? '已抽完' : '抽取三等奖'}
              </button>
              <div className="winners-list">
                {thirdPrizeWinners.length > 0 ? (
                  thirdPrizeWinners.map((winner, index) => (
                    <span key={index} className="winner-number">{winner}</span>
                  ))
                ) : (
                  <p>暂无中奖者</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 浙江交通集团. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;

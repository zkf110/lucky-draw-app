import React, { useState, useEffect } from 'react';
import './AnimationScreen.css';

const AnimationScreen = ({ winningNumber }) => {
  const [displayNumber, setDisplayNumber] = useState('...');

  useEffect(() => {
    let interval;
    if (winningNumber === null) {
      // During the 5-second animation, show random numbers
      interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 200) + 1);
      }, 100);
    } else {
      // Once a winning number is determined, display it
      setDisplayNumber(winningNumber);
    }

    return () => clearInterval(interval);
  }, [winningNumber]);

  return (
    <div className="animation-screen">
      <div className="animation-content">
        <p className="drawing-text">正在抽取幸运儿...</p>
        <div className="number-display">
          {displayNumber}
        </div>
        <p className="countdown-text">请稍候</p>
      </div>
    </div>
  );
};

export default AnimationScreen;

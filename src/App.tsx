import React, {useEffect, useState} from 'react';
import './App.css';

const zeroPad = (num: any, places: any) => String(num).padStart(places, '0');
const audio = new Audio("/bell.mp3");

function App() {
  const [time, setTime] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if(time > 0 && isRunning) {
        let timeout = window.setTimeout(() => {
          setTime(time - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }
    else if(time === 0 && isRunning) {
        audio.play();
        setIsRunning(false);
    }
  }, [isRunning, time]);

  function setTimerAndStart(time: number) {
      setTime(time);
      setIsRunning(true);
  }

  return (
    <div className="App">
        <p>{Math.trunc(time / 60)}:{zeroPad((time % 60), 2)}</p>
        <button onClick={() => setIsRunning(true)}>Start</button>
        <button onClick={() => setIsRunning(false)}>Stop</button>
        <button onClick={() => setTimerAndStart(60*25)}>Start Pomodoro</button>
        <button onClick={() => setTimerAndStart(60*5)}>Start Short Break</button>
        <button onClick={() => setTimerAndStart(60*15)}>Start Long Break</button>
    </div>
  );
}

export default App;

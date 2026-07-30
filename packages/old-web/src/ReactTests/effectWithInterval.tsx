import { useState, useEffect } from 'react';

const EffectWithInterval = () => {
  const [timer, setTimer] = useState(60)

  const countDown = () => {
    setInterval(() => {
      setTimer(timer - 1)
    }, 1000)
  }

  useEffect(countDown, [countDown])

  return (
    <div>
      <h1>Testing a timer in a test</h1>
      {timer}
    </div>
  );
}

export default EffectWithInterval;

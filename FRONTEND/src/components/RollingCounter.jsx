import { useEffect, useState } from 'react';

const RollingCounter = ({ value = '120000', duration = 2000 }) => {
  const digits = value.split('');
  const [displayDigits, setDisplayDigits] = useState(Array(digits.length).fill(0));

  useEffect(() => {
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const newDigits = digits.map((digit, i) => {
        if (isNaN(parseInt(digit))) return digit;

        const current = Math.floor(Math.random() * 10);
        const stopAt = parseInt(digit);

        return progress < 1 ? current : stopAt;
      });

      setDisplayDigits(newDigits);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <div className="flex  text-6xl md:text-7xl font-bold text-emerald-400">
      {displayDigits.map((digit, i) => (
        <span
          key={i}
          className="inline-block w-12 md:w-16 text-center animate-pulse transition-all duration-150"
        >
          {digit}
        </span>
      ))}
      {/* Removed the '+' sign for Positive Feedback */}
    </div>
  );
};

export default RollingCounter;

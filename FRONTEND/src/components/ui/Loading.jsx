import React from 'react';

/**
 * World-Class Loading Component with Premium UI/UX
 * Features: Multiple loading animations, customizable sizes and colors
 */
const Loading = ({
  type = 'spinner',
  size = 'md',
  color = 'amber',
  fullScreen = false,
  text = 'Loading...',
  className = ''
}) => {
  // Size variations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color variations
  const colorClasses = {
    amber: 'text-amber-400 border-amber-400',
    blue: 'text-blue-400 border-blue-400',
    green: 'text-green-400 border-green-400',
    red: 'text-red-400 border-red-400',
    purple: 'text-purple-400 border-purple-400'
  };

  // Loading spinner component
  const Spinner = () => (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
  );

  // Pulse dots component
  const Dots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full bg-current animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  // Wave bars component
  const Bars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-2 ${colorClasses[color]} bg-current rounded-t`}
          style={{
            height: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '40px',
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  // Premium glow spinner
  const GlowSpinner = () => (
    <div className="relative">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-current border-t-transparent`} />
      <div className={`absolute inset-0 ${sizeClasses[size]} ${colorClasses[color]} rounded-full border-2 border-transparent border-t-current animate-spin opacity-50`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
    </div>
  );

  // Gradient ring component
  const GradientRing = () => (
    <div className={`${sizeClasses[size]} rounded-full spinner-glow animate-spin`} />
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <Dots />;
      case 'bars':
        return <Bars />;
      case 'glow':
        return <GlowSpinner />;
      case 'gradient':
        return <GradientRing />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderLoader()}
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-md ${className}`}>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {content}
    </div>
  );
};

// Add wave animation to CSS (inline style for this component)
const waveKeyframes = `
@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined' && !document.querySelector('#wave-keyframes')) {
  const style = document.createElement('style');
  style.id = 'wave-keyframes';
  style.textContent = waveKeyframes;
  document.head.appendChild(style);
}

export default Loading;

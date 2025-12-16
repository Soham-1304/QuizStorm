import { getTimerColor } from '../../utils/helpers';

/**
 * Timer Component - Doodle Pop Design
 */
const Timer = ({ timeRemaining, totalTime }) => {
    // Untimed Mode Handling
    const isUntimed = totalTime <= 0;

    // If untimed, force Green and 100% circle
    const color = isUntimed ? 'green' : getTimerColor(timeRemaining, totalTime);
    const percentage = isUntimed ? 100 : (timeRemaining / totalTime) * 100;

    // Map helper colors to tailwind classes
    const colorMap = {
        green: 'text-green-600 stroke-green-500',
        yellow: 'text-yellow-600 stroke-yellow-500',
        red: 'text-red-600 stroke-red-500',
    };

    return (
        <div className="relative inline-block">
            {/* Hand-drawn circle effect */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Scribble */}
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    strokeDasharray="10 5"
                />
                {/* Progress Scribble */}
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    className={`transition-all duration-1000 ease-linear ${colorMap[color].split(' ')[1]}`}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                    style={{ filter: 'url(#squiggle)' }}
                />

                {/* SVG Filter for "Hand Drawn" look */}
                <defs>
                    <filter id="squiggle">
                        <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
                        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-wiggle" style={{ animationDuration: '2s' }}>
                <span className={`font-bold font-doodle ${colorMap[color].split(' ')[0]} ${isUntimed ? 'text-7xl -mt-2' : 'text-5xl'}`}>
                    {isUntimed ? '∞' : timeRemaining}
                </span>
            </div>
        </div>
    );
};

export default Timer;

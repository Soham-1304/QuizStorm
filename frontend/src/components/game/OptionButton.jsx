/**
 * Option Button - Doodle Pop Design
 */
const OptionButton = ({
    option,
    optionIndex,
    isSelected,
    isCorrect,
    showResult,
    onClick,
    disabled,
}) => {
    const getButtonClass = () => {
        const baseClass = "w-full p-4 rounded-xl flex items-center gap-4 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group";

        if (showResult) {
            if (isCorrect) {
                return `${baseClass} bg-green-400 border-black text-white transform -rotate-1`;
            } else if (isSelected && !isCorrect) {
                return `${baseClass} bg-red-400 border-black text-white transform rotate-1`;
            } else {
                return `${baseClass} bg-gray-100 border-gray-400 text-gray-400 opacity-60`;
            }
        } else if (isSelected) {
            return `${baseClass} bg-blue-400 border-black text-white transform scale-105 rotate-1`;
        } else {
            return `${baseClass} bg-white border-black text-gray-900 hover:bg-yellow-100 hover:scale-[1.02] cursor-pointer hover:-rotate-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`;
        }
    };

    const getLetterColor = () => {
        const colors = ['bg-pink-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400'];
        return colors[optionIndex % colors.length];
    };

    return (
        <button
            className={getButtonClass()}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            <span className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getLetterColor()}`}>
                {String.fromCharCode(65 + optionIndex)}
            </span>
            <span className="flex-1 text-left font-doodle text-xl font-bold">{option}</span>

            {showResult && isCorrect && (
                <span className="text-4xl absolute right-4 animate-bounce">✅</span>
            )}
            {showResult && isSelected && !isCorrect && (
                <span className="text-4xl absolute right-4 animate-wiggle">❌</span>
            )}
        </button>
    );
};

export default OptionButton;

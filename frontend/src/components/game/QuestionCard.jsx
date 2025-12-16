import OptionButton from './OptionButton';

/**
 * Question Card - Doodle Pop Design
 */
const QuestionCard = ({
    questionText,
    options,
    selectedOption,
    correctOption,
    onSelectOption,
    disabled,
    mediaUrl,
    mediaType = 'none',
}) => {
    return (
        <div className="relative">
            {/* Background Blackboard Effect */}
            <div className="bg-gray-800 p-8 rounded-sm transform -rotate-1 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] border-4 border-gray-700 relative overflow-hidden">
                {/* Chalk dust effect */}
                <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

                {/* Media Section (Image/Video) */}
                {(mediaType === 'image' || mediaType === 'video') && mediaUrl && (
                    <div className="mb-8 flex justify-center">
                        {mediaType === 'image' ? (
                            <div className="relative border-4 border-white transform rotate-1 shadow-lg bg-gray-900 rounded-lg overflow-hidden max-h-48 md:max-h-60 w-full max-w-2xl">
                                <img
                                    src={mediaUrl}
                                    alt="Question Media"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex'; // Show fallback
                                    }}
                                />
                                {/* Fallback if image breaks */}
                                <div className="absolute inset-0 hidden items-center justify-center bg-gray-800 text-gray-500 font-doodle text-xl">
                                    🖼️ Image not found
                                </div>
                            </div>
                        ) : (
                            <div className="relative border-4 border-white transform rotate-1 shadow-lg bg-gray-900 rounded-lg overflow-hidden max-h-64 md:max-h-80 w-full max-w-2xl">
                                <video
                                    src={mediaUrl}
                                    controls
                                    autoPlay
                                    muted
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                )}

                <h2 className="text-2xl md:text-3xl font-bold font-doodle text-white text-center mt-6 mb-8 leading-relaxed tracking-wide border-b-2 border-dashed border-gray-600 pb-6">
                    {questionText}
                </h2>

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                    {options.map((option, index) => (
                        <OptionButton
                            key={index}
                            option={option}
                            optionIndex={index}
                            isSelected={selectedOption === index}
                            isCorrect={correctOption === index}
                            showResult={correctOption !== null}
                            onClick={() => onSelectOption(index)}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;

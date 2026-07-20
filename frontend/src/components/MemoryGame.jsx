import { useState, useEffect } from 'react';

const EMOJIS = ['🍃', '🌸', '🌊', '☀️', '🦋', '🐢', '🐚', '🌙'];

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export default function MemoryGame() {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        initGame();
    }, []);

    function initGame() {
        const deck = [...EMOJIS, ...EMOJIS];
        const shuffled = shuffle(deck).map((emoji, index) => ({
            id: index,
            emoji,
            isFlipped: false,
            isMatched: false
        }));
        setCards(shuffled);
        setFlippedIndices([]);
        setMatchedPairs(0);
        setMoves(0);
        setIsChecking(false);
    }

    function handleCardClick(index) {
        if (isChecking) return;
        if (cards[index].isFlipped || cards[index].isMatched) return;

        const newFlippedIndices = [...flippedIndices, index];
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);
            const [firstIndex, secondIndex] = newFlippedIndices;
            
            if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
                // Match
                setTimeout(() => {
                    const matchCards = [...newCards];
                    matchCards[firstIndex].isMatched = true;
                    matchCards[secondIndex].isMatched = true;
                    setCards(matchCards);
                    setFlippedIndices([]);
                    setIsChecking(false);
                    setMatchedPairs(p => p + 1);
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    const resetCards = [...newCards];
                    resetCards[firstIndex].isFlipped = false;
                    resetCards[secondIndex].isFlipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }

    const isWon = matchedPairs === EMOJIS.length && EMOJIS.length > 0;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto 36px', padding: '0 40px' }} className="game-container">
            <div style={{
                borderRadius: 22, padding: '32px 36px',
                background: 'rgba(255,255,255,0.72)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,.07)',
                backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, width: '100%' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 22,
                        background: 'linear-gradient(135deg,#f08060,#e04040)',
                        boxShadow: '0 4px 14px rgba(240,128,96,.3)'
                    }}>🧩</div>
                    <div>
                        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.25rem', color: '#1a1c2e', marginBottom: 2 }}>
                            Memory Match Game
                        </h2>
                        <p style={{ fontSize: '.82rem', color: '#5a5f7a', fontWeight: 300 }}>
                            Relax your mind with a gentle matching game. Moves: {moves}
                        </p>
                    </div>
                </div>

                {isWon && (
                    <div style={{ marginBottom: 24, textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                        <h3 style={{ fontSize: '1.2rem', color: '#4cd48a', fontWeight: 600 }}>Wonderful playing!</h3>
                        <p style={{ fontSize: '.9rem', color: '#5a5f7a', marginBottom: 12 }}>You completed the game in {moves} moves.</p>
                        <button
                            onClick={initGame}
                            style={{
                                padding: '10px 24px', borderRadius: 50, border: 'none', cursor: 'pointer',
                                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: '.88rem',
                                background: 'linear-gradient(135deg,#7a6cf8,#5b9cf6)', color: '#fff',
                                boxShadow: '0 4px 16px rgba(122,108,248,.4)', transition: 'all .2s'
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                )}

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
                    perspective: '1000px', width: '100%', maxWidth: 400
                }} className="cards-grid">
                    {cards.map((card, idx) => {
                        const isFlipped = card.isFlipped || card.isMatched;
                        return (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(idx)}
                                style={{
                                    aspectRatio: '1', position: 'relative',
                                    transformStyle: 'preserve-3d', transition: 'transform 0.4s',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    cursor: card.isMatched ? 'default' : 'pointer'
                                }}
                            >
                                {/* Card Back */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden',
                                    background: 'linear-gradient(135deg,#7a8fb8,#506090)',
                                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <span style={{ color: '#fff', fontSize: '1.5rem', opacity: 0.8 }}>?</span>
                                </div>
                                {/* Card Front */}
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                                    background: card.isMatched ? '#e8f5ef' : '#fff',
                                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: card.isMatched ? '2px solid #4cd48a' : '2px solid #eee'
                                }}>
                                    <span style={{ fontSize: '2rem' }}>{card.emoji}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @media(max-width:640px){.game-container{padding:0 20px !important;} .cards-grid {gap: 8px !important; }}
            `}</style>
        </div>
    );
}

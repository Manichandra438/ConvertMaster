import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../config';

// ─── Pixel art helpers ────────────────────────────────────────────────────────
// Each sprite is a 2D array of hex color strings (or null for transparent).
// We render it as a tiny div with CSS box-shadows (no images needed).
const S = 3; // px per "pixel"

function buildBoxShadow(grid) {
    const shadows = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const color = grid[row][col];
            if (color) {
                shadows.push(`${col * S}px ${row * S}px 0 ${color}`);
            }
        }
    }
    return shadows.join(', ');
}

// ─── Sprite data ──────────────────────────────────────────────────────────────
// O=orange, D=dark-orange, W=white, B=black, P=pink, G=grey
const O = '#e07b39', D = '#b35a1f', W = '#fff', B = '#1a1a1a', P = '#f5b8a0', G = '#888';

// Cat — 12 cols × 14 rows
// Frame A (right foot forward), Frame B (left foot forward)
const CAT_A = [
    [null,null,O,null,null,null,null,O,null,null,null,null],
    [null,O,O,O,null,null,O,O,O,null,null,null],
    [O,O,O,O,O,O,O,O,O,O,null,null],
    [O,W,B,O,O,O,O,B,W,O,null,null],
    [O,O,P,O,O,O,O,P,O,O,null,null],
    [O,O,O,B,B,B,B,O,O,O,null,null],
    [null,O,O,O,O,O,O,O,O,null,null,null],
    [null,D,O,O,O,O,O,O,D,null,null,null],
    [null,D,O,O,O,O,O,O,D,null,D,D],
    [null,D,O,O,O,O,O,D,null,null,null,D],
    [null,null,D,O,O,O,D,null,null,null,null,null],
    [null,null,D,D,null,null,D,D,null,null,null,null],
    [null,null,D,null,null,null,null,D,null,null,null,null],
    [null,D,D,null,null,null,null,null,D,D,null,null],
];

const CAT_B = [
    [null,null,O,null,null,null,null,O,null,null,null,null],
    [null,O,O,O,null,null,O,O,O,null,null,null],
    [O,O,O,O,O,O,O,O,O,O,null,null],
    [O,W,B,O,O,O,O,B,W,O,null,null],
    [O,O,P,O,O,O,O,P,O,O,null,null],
    [O,O,O,B,B,B,B,O,O,O,null,null],
    [null,O,O,O,O,O,O,O,O,null,null,null],
    [null,D,O,O,O,O,O,O,D,null,null,null],
    [D,D,O,O,O,O,O,O,D,null,null,null],
    [D,null,null,D,O,O,O,O,D,null,null,null],
    [null,null,null,null,D,O,O,D,null,null,null,null],
    [null,null,null,null,D,D,D,D,null,null,null,null],
    [null,null,null,D,D,null,null,D,D,null,null,null],
    [null,null,null,null,null,null,null,null,null,null,null,null],
];

// Robot — 10 cols × 14 rows
const RB = '#607d8b', RL = '#90a4ae', RD = '#37474f', RY = '#ffeb3b', RC = '#00bcd4';

const ROBOT_A = [
    [null,RB,RB,RB,RB,RB,RB,RB,RB,null],
    [null,RB,RL,RL,RL,RL,RL,RL,RB,null],
    [null,RB,RY,RL,RL,RL,RL,RY,RB,null],
    [null,RB,RY,RL,RC,RC,RL,RY,RB,null],
    [null,RB,RL,RL,RL,RL,RL,RL,RB,null],
    [null,null,RB,RB,RB,RB,RB,RB,null,null],
    [RD,RD,RB,RL,RL,RL,RL,RB,RD,RD],
    [RD,null,RB,RL,RL,RL,RL,RB,null,RD],
    [null,null,RB,RL,RL,RL,RL,RB,null,null],
    [null,null,RB,RL,RL,RL,RL,RB,null,null],
    [null,null,RD,RD,null,null,RD,RD,null,null],
    [null,null,RD,RD,null,null,RD,RD,null,null],
    [null,RD,RD,null,null,null,null,RD,RD,null],
    [null,null,null,null,null,null,null,null,null,null],
];

const ROBOT_B = [
    [null,RB,RB,RB,RB,RB,RB,RB,RB,null],
    [null,RB,RL,RL,RL,RL,RL,RL,RB,null],
    [null,RB,RY,RL,RL,RL,RL,RY,RB,null],
    [null,RB,RY,RL,RC,RC,RL,RY,RB,null],
    [null,RB,RL,RL,RL,RL,RL,RL,RB,null],
    [null,null,RB,RB,RB,RB,RB,RB,null,null],
    [RD,RD,RB,RL,RL,RL,RL,RB,RD,RD],
    [null,RD,RB,RL,RL,RL,RL,RB,RD,null],
    [null,null,RB,RL,RL,RL,RL,RB,null,null],
    [null,null,RB,RL,RL,RL,RL,RB,null,null],
    [null,null,RD,RD,null,null,RD,RD,null,null],
    [null,null,RD,RD,null,null,RD,RD,null,null],
    [null,null,null,RD,RD,RD,RD,null,null,null],
    [null,null,null,null,null,null,null,null,null,null],
];

// Precompute box-shadows
const SHADOWS = {
    catA: buildBoxShadow(CAT_A),
    catB: buildBoxShadow(CAT_B),
    robotA: buildBoxShadow(ROBOT_A),
    robotB: buildBoxShadow(ROBOT_B),
};

const CAT_W = 12 * S;
const CAT_H = 14 * S;
const ROBOT_W = 10 * S;
const ROBOT_H = 14 * S;

// ─── Jokes ────────────────────────────────────────────────────────────────────
const CAT_JOKES = [
    "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛",
    "A SQL query walks into a bar, walks up\nto two tables and asks:\n'Can I JOIN you?' 🍺",
    "There are 10 types of people:\nthose who understand binary,\nand those who don't. 😼",
    "I would tell you a UDP joke,\nbut you might not get it. 📦",
    "Why did the developer go broke?\nUsed up all their cache! 💸",
];

const ROBOT_JOKES = [
    "My code has no bugs —\nonly undocumented features! 🚀",
    "!false\n— it's funny because it's true. 🤖",
    "Why do Java devs wear glasses?\nBecause they don't C#! 👓",
    "I'm not lazy,\nI'm on energy-saving mode. ⚡",
    "404: Funny joke not found.\nPlease try again later. 🔧",
];

// ─── Sprite component ─────────────────────────────────────────────────────────
function Sprite({ shadowA, shadowB, width, height, frame }) {
    const shadow = frame === 0 ? shadowA : shadowB;
    return (
        <div style={{
            position: 'relative',
            width: width + S,
            height: height + S,
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: S,
                height: S,
                boxShadow: shadow,
            }} />
        </div>
    );
}

// ─── Individual character ─────────────────────────────────────────────────────
function Character({ startX, jokes, shadowA, shadowB, spriteW, spriteH, speed }) {
    const [x, setX] = useState(startX);
    const [dir, setDir] = useState(1); // 1=right, -1=left
    const [frame, setFrame] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [jokeIndex, setJokeIndex] = useState(() => Math.floor(Math.random() * jokes.length));

    const xRef = useRef(startX);
    const dirRef = useRef(1);
    const hoveredRef = useRef(false);
    const rafRef = useRef(null);
    const frameTimerRef = useRef(null);

    // Frame animation (walk cycle)
    useEffect(() => {
        frameTimerRef.current = setInterval(() => {
            if (!hoveredRef.current) {
                setFrame(f => (f + 1) % 2);
            }
        }, 400);
        return () => clearInterval(frameTimerRef.current);
    }, []);

    // Walking movement — defined inside effect to avoid circular useCallback
    useEffect(() => {
        const walk = () => {
            if (!hoveredRef.current) {
                const maxX = window.innerWidth - spriteW - 20;
                const minX = 20;
                let newX = xRef.current + dirRef.current * speed;
                if (newX >= maxX) { newX = maxX; dirRef.current = -1; setDir(-1); }
                if (newX <= minX) { newX = minX; dirRef.current = 1; setDir(1); }
                xRef.current = newX;
                setX(newX);
            }
            rafRef.current = requestAnimationFrame(walk);
        };
        rafRef.current = requestAnimationFrame(walk);
        return () => cancelAnimationFrame(rafRef.current);
    }, [speed, spriteW]);

    const handleMouseEnter = () => {
        hoveredRef.current = true;
        setHovered(true);
        setJokeIndex(Math.floor(Math.random() * jokes.length));
    };

    const handleMouseLeave = () => {
        hoveredRef.current = false;
        setHovered(false);
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 30,
                left: x,
                zIndex: 200,
                cursor: 'pointer',
                userSelect: 'none',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Speech bubble — lives outside the flipped sprite so text is always readable */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            bottom: spriteH + 10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#2d2d2d',
                            border: '1px solid #007acc',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontSize: 11,
                            lineHeight: 1.5,
                            color: '#d4d4d4',
                            width: 'max-content',
                            maxWidth: 220,
                            whiteSpace: 'pre-wrap',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                            pointerEvents: 'none',
                            zIndex: 201,
                        }}
                    >
                        {jokes[jokeIndex]}
                        {/* Bubble tail */}
                        <div style={{
                            position: 'absolute',
                            bottom: -7,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '7px solid #007acc',
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sprite — only this gets flipped when walking left */}
            <div style={{ transform: `scaleX(${dir === 1 ? 1 : -1})`, transformOrigin: 'center bottom' }}>
                <Sprite shadowA={shadowA} shadowB={shadowB} width={spriteW} height={spriteH} frame={frame} />
            </div>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function WalkingCharacters() {
    return (
        <>
            <Character
                startX={Math.floor(window.innerWidth * 0.15)}
                jokes={CAT_JOKES}
                shadowA={SHADOWS.catA}
                shadowB={SHADOWS.catB}
                spriteW={CAT_W}
                spriteH={CAT_H}
                speed={config.walkingCharacters.cat.speed}
            />
            <Character
                startX={Math.floor(window.innerWidth * 0.72)}
                jokes={ROBOT_JOKES}
                shadowA={SHADOWS.robotA}
                shadowB={SHADOWS.robotB}
                spriteW={ROBOT_W}
                spriteH={ROBOT_H}
                speed={config.walkingCharacters.robot.speed}
            />
        </>
    );
}

import React, { useEffect, useRef } from 'react';
import logo from '../../images/logo.png';

// Brand loader — the real logo image with a gradient dash orbiting a
// rounded-square outline around it (the outline matches the logo's shape).
//
// Disappear animation: Suspense unmounts its fallback instantly, so on
// unmount we clone the loader into a fixed overlay ("ghost"), fade/zoom it
// out, and remove it — the content beneath appears through the fade.
const EXIT_MS = 380;

const Loading = () => {
    const rootRef = useRef(null);

    useEffect(() => {
        const node = rootRef.current;
        return () => {
            if (!node) return;
            const ghost = node.cloneNode(true);
            ghost.style.position = 'fixed';
            ghost.style.inset = '0';
            ghost.style.zIndex = '9999';
            ghost.style.pointerEvents = 'none';
            ghost.style.transition = `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease`;
            document.body.appendChild(ghost);
            requestAnimationFrame(() => {
                ghost.style.opacity = '0';
                ghost.style.transform = 'scale(1.08)';
            });
            setTimeout(() => ghost.remove(), EXIT_MS + 60);
        };
    }, []);

    return (
        <div ref={rootRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh', background: 'var(--idm-surface, #ffffff)' }}>
            <style>{`
                @keyframes idm-loader-orbit {
                    to { stroke-dashoffset: 100; }
                }
                .idm-loader-orbit {
                    animation: idm-loader-orbit 1.4s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .idm-loader-orbit { animation: none; }
                }
            `}</style>
            <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="130" height="130" viewBox="0 0 512 512" fill="none" style={{ position: 'absolute', inset: 0 }} role="img" aria-label="Loading">
                    <defs>
                        <linearGradient id="idm-loader-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#9B1FE8" />
                            <stop offset="55%" stopColor="#D6219C" />
                            <stop offset="100%" stopColor="#F5333F" />
                        </linearGradient>
                    </defs>
                    {/* faint track + gradient comet tracing the outline */}
                    <rect
                        x="7" y="7" width="498" height="498" rx="127"
                        stroke="#f1f5f9" strokeWidth="9"
                    />
                    <rect
                        className="idm-loader-orbit"
                        x="7" y="7" width="498" height="498" rx="127"
                        stroke="url(#idm-loader-grad)" strokeWidth="9"
                        strokeLinecap="round" pathLength="100"
                        strokeDasharray="30 70"
                    />
                </svg>
                <img src={logo} alt="" style={{ width: 118, height: 118, objectFit: 'contain' }} />
            </div>
        </div>
    );
};

export default Loading;

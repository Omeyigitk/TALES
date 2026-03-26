"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from './VFXOverlay.module.css';

interface EffectInstance {
    id: string;
    type: 'NAT20' | 'NAT1' | 'SUCCESS';
    playerName?: string;
}

export const VFXOverlay: React.FC<{ activeEffect: any, conditions?: any[], weather?: { type: string, severity: string, backgroundUrl?: string } }> = ({ activeEffect, conditions = [], weather = { type: 'clear', severity: 'medium' } }) => {
    const [queue, setQueue] = useState<EffectInstance[]>([]);
    const [lightnings, setLightnings] = useState<{ id: number, x: number, dur: number, fdur: number }[]>([]);

    useEffect(() => {
        if (activeEffect) {
            const id = Math.random().toString(36).substring(7);
            setQueue(prev => [...prev, { ...activeEffect, id }]);
            setTimeout(() => {
                setQueue(q => q.filter(e => e.id !== id));
            }, 3000);
        }
    }, [activeEffect]);

    // Lightning strike timer for thunder/storm
    useEffect(() => {
        if (weather?.type !== 'thunder' && weather?.type !== 'blizzard') return;
        const interval = weather.severity === 'heavy' ? 2500 : weather.severity === 'light' ? 8000 : 5000;
        const timer = setInterval(() => {
            const id = Date.now();
            const x = 10 + Math.random() * 80;
            const dur = 0.1 + Math.random() * 0.15;
            const fdur = 0.2 + Math.random() * 0.2;
            setLightnings(prev => [...prev, { id, x, dur, fdur }]);
            setTimeout(() => setLightnings(prev => prev.filter(l => l.id !== id)), 600);
        }, interval);
        return () => clearInterval(timer);
    }, [weather?.type, weather?.severity]);

    const renderParticles = (count: number, color: string) => {
        return Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * 360;
            const dist = 100 + Math.random() * 200;
            const x = Math.cos(angle * Math.PI / 180) * dist;
            const y = Math.sin(angle * Math.PI / 180) * dist;
            return (
                <div
                    key={i}
                    className={styles.particle}
                    style={{ backgroundColor: color, '--x': `${x}px`, '--y': `${y}px` } as any}
                />
            );
        });
    };

    const getConditionClass = (c: any) => {
        const name = typeof c === 'string' ? c.toLowerCase() : (c.name || '').toLowerCase();
        if (name.includes('blinded') || name.includes('kör')) return styles.blinded;
        if (name.includes('poisoned') || name.includes('zehir')) return styles.poisoned;
        if (name.includes('frightened') || name.includes('korkmuş')) return styles.frightened;
        if (name.includes('charmed') || name.includes('büyü')) return styles.charmed;
        if (name.includes('stunned') || name.includes('sersem')) return styles.stunned;
        if (name.includes('paralyzed') || name.includes('felç')) return styles.paralyzed;
        if (name.includes('petrified') || name.includes('taşlaş')) return styles.petrified;
        if (name.includes('unconscious') || name.includes('baygın')) return styles.unconscious;
        return '';
    };

    const renderWeather = () => {
        if (!weather || weather.type === 'clear') return null;
        const count = weather.severity === 'heavy' ? 120 : weather.severity === 'light' ? 35 : 70;

        // ─ RAIN ─
        if (weather.type === 'rain') {
            return (
                <div className={styles.weatherRain}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.drop} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.4 + Math.random() * 0.4}s`,
                            height: `${12 + Math.random() * 12}px`,
                            opacity: 0.4 + Math.random() * 0.4
                        }} />
                    ))}
                </div>
            );
        }

        // ─ SNOW ─
        if (weather.type === 'snow') {
            return (
                <div className={styles.weatherSnow}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.flake} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${4 + Math.random() * 8}s`,
                            opacity: 0.5 + Math.random() * 0.5
                        }} />
                    ))}
                </div>
            );
        }

        // ─ FOG ─
        if (weather.type === 'fog') {
            return <div className={`${styles.weatherFog} ${styles[weather.severity] || styles.medium}`} />;
        }

        // ─ SANDSTORM ─
        if (weather.type === 'sandstorm') {
            return (
                <div className={styles.weatherSand}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.grain} style={{
                            top: `${Math.random() * 100}%`,
                            width: `${30 + Math.random() * 80}px`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${1 + Math.random() * 2}s`,
                            '--vy': `${(Math.random() - 0.5) * 40}px`
                        } as any} />
                    ))}
                </div>
            );
        }

        // ─ THUNDER / STORM ─
        if (weather.type === 'thunder') {
            const rainCount = weather.severity === 'heavy' ? 150 : 80;
            return (
                <div className={styles.weatherThunder}>
                    {/* Heavy rain */}
                    {Array.from({ length: rainCount }).map((_, i) => (
                        <div key={`r${i}`} className={styles.drop} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 1.5}s`,
                            animationDuration: `${0.3 + Math.random() * 0.3}s`,
                            height: `${18 + Math.random() * 10}px`,
                            opacity: 0.5 + Math.random() * 0.4
                        }} />
                    ))}
                    {/* Lightning bolts */}
                    {lightnings.map(l => (
                        <React.Fragment key={l.id}>
                            <div className={styles.thunderFlash} style={{ '--fdur': `${l.fdur}s` } as any} />
                            <div className={styles.lightning} style={{ '--lx': `${l.x}%`, '--dur': `${l.dur}s` } as any} />
                        </React.Fragment>
                    ))}
                </div>
            );
        }

        // ─ BLIZZARD ─
        if (weather.type === 'blizzard') {
            const snowCount = weather.severity === 'heavy' ? 200 : 120;
            const windCount = weather.severity === 'heavy' ? 20 : 10;
            return (
                <div className={styles.weatherBlizzard}>
                    {Array.from({ length: snowCount }).map((_, i) => (
                        <div key={`s${i}`} className={styles.flake} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${1.5 + Math.random() * 3}s`,
                            opacity: 0.6 + Math.random() * 0.4
                        }} />
                    ))}
                    {Array.from({ length: windCount }).map((_, i) => (
                        <div key={`w${i}`} className={styles.blizzardWind} style={{
                            top: `${Math.random() * 100}%`,
                            width: `${80 + Math.random() * 200}px`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${0.5 + Math.random() * 1}s`
                        }} />
                    ))}
                    {lightnings.map(l => (
                        <React.Fragment key={l.id}>
                            <div className={styles.thunderFlash} style={{ '--fdur': `${l.fdur}s` } as any} />
                        </React.Fragment>
                    ))}
                </div>
            );
        }

        // ─ EMBERS / VOLCANO ─
        if (weather.type === 'embers') {
            return (
                <div className={styles.weatherEmbers}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.ember} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 5}s`,
                            '--ex': `${(Math.random() - 0.5) * 100}px`,
                            '--ex2': `${(Math.random() - 0.5) * 80}px`
                        } as any} />
                    ))}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(100, 30, 0, 0.08)', animation: 'none' }} />
                </div>
            );
        }

        // ─ BLOOD RAIN ─
        if (weather.type === 'blood') {
            return (
                <div className={styles.weatherBlood}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.bloodDrop} style={{
                            left: `${Math.random() * 100}%`,
                            height: `${10 + Math.random() * 15}px`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            opacity: 0.5 + Math.random() * 0.4
                        }} />
                    ))}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(80, 0, 0, 0.1)' }} />
                </div>
            );
        }

        // ─ MAGIC ─
        if (weather.type === 'magic') {
            return (
                <div className={styles.weatherMagic}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.magicOrb} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${4 + Math.random() * 8}s`,
                            '--mx': `${(Math.random() - 0.5) * 80}px`,
                            '--mx2': `${(Math.random() - 0.5) * 60}px`,
                            '--mx3': `${(Math.random() - 0.5) * 80}px`
                        } as any} />
                    ))}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(99, 50, 150, 0.06)', animation: 'none' }} />
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.vfxContainer}>
            {/* Weather - rendered first (behind everything) */}
            {renderWeather()}

            {/* Condition Ambient Overlays */}
            {conditions.map((c, i) => {
                const cls = getConditionClass(c);
                if (!cls) return null;
                return <div key={`cond-${i}`} className={`${styles.conditionOverlay} ${cls}`} />;
            })}

            {/* Dice VFX - rendered last (on top) */}
            {queue.map((effect) => (
                <div key={effect.id} className={`${styles.effect} ${effect.type === 'NAT20' ? styles.nat20 : styles.nat1}`}>
                    <div className={`${styles.flash} ${effect.type === 'NAT20' ? styles.nat20Flash : styles.nat1Flash}`} />
                    <div className={styles.title}>
                        {effect.type === 'NAT20' ? 'CRITICAL!' : 'FUMBLE!'}
                    </div>
                    {effect.playerName && (
                        <div className={styles.subtitle}>
                            {effect.playerName} rolled a {effect.type === 'NAT20' ? '20' : '1'}
                        </div>
                    )}
                    {effect.type === 'NAT20' && renderParticles(30, '#fbbf24')}
                    {effect.type === 'NAT1' && renderParticles(20, '#ef4444')}
                </div>
            ))}
        </div>
    );
};

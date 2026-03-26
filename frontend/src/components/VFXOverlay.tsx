"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from './VFXOverlay.module.css';

interface EffectInstance {
    id: string;
    type: 'NAT20' | 'NAT1' | 'SUCCESS';
    playerName?: string;
}

export const VFXOverlay: React.FC<{ 
    activeEffect: any, 
    conditions?: any[], 
    weather?: { type: string, types?: string[], severity: string, backgroundUrl?: string } 
}> = ({ activeEffect, conditions = [], weather = { type: 'clear', types: ['clear'], severity: 'medium' } }) => {
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

    // Get normalized types (support both old 'type' and new 'types' array)
    const activeTypes = Array.isArray(weather?.types) ? weather.types : (weather?.type ? [weather.type] : ['clear']);

    // Lightning strike timer for thunder/storm/blizzard
    useEffect(() => {
        const hasLightning = activeTypes.includes('thunder') || activeTypes.includes('blizzard');
        if (!hasLightning) {
            if (lightnings.length > 0) setLightnings([]);
            return;
        }

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
    }, [activeTypes.join(','), weather?.severity]);

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

    const renderWeatherType = (type: string) => {
        if (type === 'clear') return null;
        const count = weather.severity === 'heavy' ? 120 : weather.severity === 'light' ? 35 : 70;

        // ─ RAIN ─
        if (type === 'rain') {
            return (
                <div key="rain" className={styles.weatherRain}>
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
        if (type === 'snow') {
            return (
                <div key="snow" className={styles.weatherSnow}>
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
        if (type === 'fog') {
            return <div key="fog" className={`${styles.weatherFog} ${styles[weather.severity] || styles.medium}`} />;
        }

        // ─ SANDSTORM ─
        if (type === 'sandstorm') {
            return (
                <div key="sandstorm" className={styles.weatherSand}>
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
        if (type === 'thunder') {
            const rainCount = weather.severity === 'heavy' ? 150 : 80;
            return (
                <div key="thunder" className={styles.weatherThunder}>
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
                    {/* Lightning bolts rendered separately to sync across types if needed */}
                </div>
            );
        }

        // ─ BLIZZARD ─
        if (type === 'blizzard') {
            const snowCount = weather.severity === 'heavy' ? 200 : 120;
            const windCount = weather.severity === 'heavy' ? 20 : 10;
            return (
                <div key="blizzard" className={styles.weatherBlizzard}>
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
                </div>
            );
        }

        // ─ EMBERS / VOLCANO ─
        if (type === 'embers') {
            return (
                <div key="embers" className={styles.weatherEmbers}>
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
        if (type === 'blood') {
            return (
                <div key="blood" className={styles.weatherBlood}>
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
        if (type === 'magic') {
            return (
                <div key="magic" className={styles.weatherMagic}>
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

        // ─ TORNADO ─
        if (type === 'tornado') {
            const debrisCount = weather.severity === 'heavy' ? 80 : weather.severity === 'light' ? 30 : 50;
            return (
                <div key="tornado" className={styles.weatherTornado}>
                    <div className={styles.tornadoCore} />
                    {Array.from({ length: debrisCount }).map((_, i) => (
                        <div key={i} className={styles.tornadoDebris} style={{
                            top: `${20 + Math.random() * 60}%`,
                            left: `${30 + Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${1.5 + Math.random() * 3}s`,
                            '--tr': `${40 + Math.random() * 120}px`,
                            '--ty': `${(Math.random() - 0.5) * 60}px`
                        } as any} />
                    ))}
                </div>
            );
        }

        // ─ METEOR SHOWER ─
        if (type === 'meteor') {
            const meteorCount = weather.severity === 'heavy' ? 20 : weather.severity === 'light' ? 6 : 12;
            return (
                <div key="meteor" className={styles.weatherMeteor}>
                    {Array.from({ length: meteorCount }).map((_, i) => {
                        const size = 3 + Math.random() * 5;
                        const delay = Math.random() * 10;
                        const dur = 1.5 + Math.random() * 2;
                        const startX = Math.random() * 80;
                        return (
                            <React.Fragment key={i}>
                                <div className={styles.meteor} style={{
                                    left: `${startX}%`,
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    animationDelay: `${delay}s`,
                                    animationDuration: `${dur}s`,
                                    '--mangle': '45deg'
                                } as any} />
                                <div className={styles.meteorTrail} style={{
                                    left: `${startX}%`,
                                    width: `${40 + Math.random() * 60}px`,
                                    animationDelay: `${delay}s`,
                                    animationDuration: `${dur}s`,
                                    '--mangle': '45deg'
                                } as any} />
                            </React.Fragment>
                        );
                    })}
                </div>
            );
        }

        // ─ ECLIPSE ─
        if (type === 'eclipse') {
            return (
                <div key="eclipse" className={styles.weatherEclipse}>
                    <div className={styles.eclipseCorona} />
                </div>
            );
        }

        // ─ AUTUMN LEAVES ─
        if (type === 'leaves') {
            return (
                <div key="leaves" className={styles.weatherLeaves}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.leaf} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${5 + Math.random() * 8}s`,
                            opacity: 0.6 + Math.random() * 0.4,
                            '--lsx': `${(Math.random() - 0.5) * 80}px`,
                            '--lsx2': `${(Math.random() - 0.5) * 60}px`
                        } as any} />
                    ))}
                </div>
            );
        }

        // ─ ACID RAIN ─
        if (type === 'acid') {
            return (
                <div key="acid" className={styles.weatherAcid}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.acidDrop} style={{
                            left: `${Math.random() * 100}%`,
                            height: `${12 + Math.random() * 10}px`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            opacity: 0.5 + Math.random() * 0.5
                        }} />
                    ))}
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={`sp${i}`} className={styles.acidSplash} style={{
                            left: `${Math.random() * 100}%`,
                            bottom: `${Math.random() * 15}%`,
                            width: `${6 + Math.random() * 10}px`,
                            height: `${6 + Math.random() * 10}px`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${0.8 + Math.random() * 0.8}s`
                        }} />
                    ))}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(30, 80, 10, 0.07)' }} />
                </div>
            );
        }

        return null;
    };

    return (
        <div className={styles.vfxContainer}>
            {/* Weather Layers */}
            {activeTypes.map(type => renderWeatherType(type))}

            {/* Lightning Bolts (Shared across types) */}
            {lightnings.map(l => (
                <React.Fragment key={l.id}>
                    <div className={styles.thunderFlash} style={{ '--fdur': `${l.fdur}s` } as any} />
                    <div className={styles.lightning} style={{ '--lx': `${l.x}%`, '--dur': `${l.dur}s` } as any} />
                </React.Fragment>
            ))}

            {/* Condition Ambient Overlays */}
            {conditions.map((c, i) => {
                const cls = getConditionClass(c);
                if (!cls) return null;
                return <div key={`cond-${i}`} className={`${styles.conditionOverlay} ${cls}`} />;
            })}

            {/* Dice VFX */}
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

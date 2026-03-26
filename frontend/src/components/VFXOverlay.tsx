"use client";

import React, { useEffect, useState, useCallback } from 'react';
import styles from './VFXOverlay.module.css';

interface EffectInstance {
    id: string;
    type: 'NAT20' | 'NAT1' | 'SUCCESS';
    playerName?: string;
}

export const VFXOverlay: React.FC<{ activeEffect: any, conditions?: any[], weather?: { type: string, severity: string } }> = ({ activeEffect, conditions = [], weather = { type: 'clear', severity: 'medium' } }) => {
    const [queue, setQueue] = useState<EffectInstance[]>([]);

    useEffect(() => {
        if (activeEffect) {
            const id = Math.random().toString(36).substring(7);
            setQueue(prev => [...prev, { ...activeEffect, id }]);
            
            // Auto-remove after animation
            setTimeout(() => {
                setQueue(q => q.filter(e => e.id !== id));
            }, 3000);
        }
    }, [activeEffect]);

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
                    style={{ 
                        backgroundColor: color,
                        '--x': `${x}px`,
                        '--y': `${y}px`
                    } as any}
                />
            );
        });
    };

    // Helper to get effect class for a condition
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

    // Render Weather Elements
    const renderWeather = () => {
        if (!weather || weather.type === 'clear') return null;

        const count = weather.severity === 'heavy' ? 100 : weather.severity === 'light' ? 30 : 60;
        
        if (weather.type === 'rain') {
            return (
                <div className={styles.weatherRain}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.drop} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }} />
                    ))}
                </div>
            );
        }
        
        if (weather.type === 'snow') {
            return (
                <div className={styles.weatherSnow}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.flake} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 5}s`, opacity: 0.3 + Math.random() * 0.7 }} />
                    ))}
                </div>
            );
        }

        if (weather.type === 'fog') {
            return <div className={`${styles.weatherFog} ${styles[weather.severity] || styles.medium}`} />;
        }

        if (weather.type === 'sandstorm') {
            return <div className={`${styles.weatherSand} ${styles[weather.severity] || styles.medium}`} />;
        }

        return null;
    };

    return (
        <div className={styles.vfxContainer}>
            {/* Weather Ambient */}
            {renderWeather()}
            {/* Condition Ambient Overlays */}
            {conditions.map((c, i) => {
                const cls = getConditionClass(c);
                if (!cls) return null;
                return <div key={`cond-${i}`} className={`${styles.conditionOverlay} ${cls}`} />;
            })}

            {queue.map((effect) => (
                <div key={effect.id} className={`${styles.effect} ${effect.type === 'NAT20' ? styles.nat20 : styles.nat1}`}>
                    
                    {/* Background Flash */}
                    <div className={`${styles.flash} ${effect.type === 'NAT20' ? styles.nat20Flash : styles.nat1Flash}`} />

                    {/* Main Content */}
                    <div className={styles.title}>
                        {effect.type === 'NAT20' ? 'CRITICAL!' : 'FUMBLE!'}
                    </div>
                    {effect.playerName && (
                        <div className={styles.subtitle}>
                            {effect.playerName} rolled a {effect.type === 'NAT20' ? '20' : '1'}
                        </div>
                    )}

                    {/* Particles */}
                    {effect.type === 'NAT20' && renderParticles(30, '#fbbf24')}
                    {effect.type === 'NAT1' && renderParticles(20, '#ef4444')}
                </div>
            ))}
        </div>
    );
};

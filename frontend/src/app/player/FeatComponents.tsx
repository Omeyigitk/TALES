"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const FeatSpellSelectionArea = ({ featName, requirements, selections, onUpdate, token, isRaceFeat = false }: any) => {
    const [libSpells, setLibSpells] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [openSlotIdx, setOpenSlotIdx] = useState<number | null>(null);

    useEffect(() => {
        const fetchNeededSpells = async () => {
            setLoading(true);
            try {
                // Fetch all level 0 and 1 spells to cover most feats
                const res = await axios.get(`${API_URL}/api/spells?max_level=1`, { headers: { 'Authorization': `Bearer ${token}` } });
                setLibSpells(res.data);
            } catch (err) {
                console.error("Feat spells fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNeededSpells();
    }, [token]);

    const toggleSpell = (spellName: string, slotIdx: number) => {
        const newSels = [...selections];
        newSels[slotIdx] = spellName;
        onUpdate(newSels);
        setOpenSlotIdx(null);
    };

    const borderColor = isRaceFeat ? 'border-rose-700/50' : 'border-yellow-700/50';
    const textColor = isRaceFeat ? 'text-rose-400' : 'text-yellow-400';

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{requirements.label}</p>
            <div className="grid grid-cols-1 gap-2">
                {requirements.slots.map((slot: any, idx: number) => {
                    const currentSpell = selections[idx];

                    const filtered = libSpells.filter(s => {
                        if (slot.type === 'cantrip' && s.level_int !== 0) return false;
                        if (slot.type === 'leveled' && s.level_int !== slot.level) return false;
                        if (slot.school && !slot.school.includes(s.school.toLowerCase())) return false;
                        if (slot.needsAttackRoll) {
                            const desc = (s.desc || "").toLowerCase();
                            if (!desc.includes("attack roll") && !desc.includes("saldırı zarı")) return false;
                        }
                        if (slot.classRestriction && !(s.class || "").includes(slot.classRestriction)) return false;
                        return true;
                    });

                    return (
                        <div key={idx} className="relative">
                            <button
                                onClick={() => setOpenSlotIdx(openSlotIdx === idx ? null : idx)}
                                className={`w-full flex items-center justify-between p-2 bg-gray-950 border rounded-lg text-xs font-bold transition-all ${borderColor} ${currentSpell ? textColor : 'text-gray-500'}`}
                            >
                                <span>{slot.label}: {currentSpell || 'Seçilmedi'}</span>
                                <span>{openSlotIdx === idx ? '▲' : '▼'}</span>
                            </button>

                            {openSlotIdx === idx && (
                                <div className="absolute z-[100] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-2 space-y-1">
                                    {loading ? (
                                        <p className="text-gray-500 text-xs p-2">Yükleniyor...</p>
                                    ) : filtered.length === 0 ? (
                                        <p className="text-gray-500 text-xs p-2">Uygun büyü bulunamadı.</p>
                                    ) : (
                                        filtered.map(s => (
                                            <div
                                                key={s.name}
                                                onClick={() => toggleSpell(s.name, idx)}
                                                className={`p-2 rounded hover:bg-gray-800 cursor-pointer text-xs flex justify-between items-center ${currentSpell === s.name ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                                            >
                                                <span>{s.name}</span>
                                                <span className="text-[10px] opacity-50">{s.school}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {requirements.autoSpells && (
                <div className="flex flex-wrap gap-1">
                    {requirements.autoSpells.map((s: string) => (
                        <span key={s} className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800/50">Auto: {s}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FeatStatSelectionArea = ({ featName, requirements, selection, onUpdate, isRaceFeat = false }: any) => {
    const borderColor = isRaceFeat ? 'border-rose-700/50' : 'border-yellow-700/50';

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">İstatistik Artışı</p>
            <div className="flex flex-wrap gap-2">
                {requirements.statChoices.map((st: string) => (
                    <button
                        key={st}
                        onClick={() => onUpdate(st)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${selection === st ? (isRaceFeat ? 'bg-yellow-700 border-yellow-500 text-white' : 'bg-yellow-700 border-yellow-500 text-white') : `bg-gray-900 ${borderColor} text-gray-400 hover:border-gray-400`}`}
                    >
                        {st} +1
                    </button>
                ))}
            </div>
        </div>
    );
};

export const FeatChoiceSelectionArea = ({ featName, choice, selections = [], onUpdate, isRaceFeat = false }: any) => {
    const [open, setOpen] = useState(false);
    const borderColor = isRaceFeat ? 'border-rose-700/50' : 'border-yellow-700/50';
    const textColor = isRaceFeat ? 'text-rose-400' : 'text-yellow-400';

    const toggleOption = (optName: string) => {
        let newSels = [...selections];
        if (newSels.includes(optName)) {
            newSels = newSels.filter(s => s !== optName);
        } else {
            if (newSels.length < choice.count) {
                newSels.push(optName);
            }
        }
        onUpdate(newSels);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{choice.label} Seçimi ({selections.length} / {choice.count})</p>
                <button onClick={() => setOpen(!open)} className={`text-[10px] font-bold uppercase transition-all ${open ? 'text-white' : textColor}`}>
                    {open ? 'Kapat' : 'Listeyi Gör'}
                </button>
            </div>

            {selections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selections.map((s: string) => (
                        <span key={s} onClick={() => toggleOption(s)} className={`px-2 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${isRaceFeat ? 'bg-rose-900/30 border-rose-700 text-rose-300' : 'bg-yellow-900/30 border-yellow-700 text-yellow-300'}`}>
                            {s} ✕
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <div className="grid grid-cols-1 gap-1 bg-gray-950 border border-gray-800 rounded-lg p-2 max-h-64 overflow-y-auto">
                    {choice.options.map((opt: any) => {
                        const isSelected = selections.includes(opt.name);
                        const isAtLimit = selections.length >= choice.count && !isSelected;
                        return (
                            <div
                                key={opt.name}
                                onClick={() => !isAtLimit && toggleOption(opt.name)}
                                className={`p-2 rounded transition-all cursor-pointer border ${isSelected ? (isRaceFeat ? 'bg-rose-900/40 border-rose-700 text-white' : 'bg-yellow-900/40 border-yellow-700 text-white') : isAtLimit ? 'opacity-30 border-transparent grayscale' : 'hover:bg-gray-800 border-transparent text-gray-400'}`}
                            >
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-xs font-black">{opt.name}</span>
                                    {isSelected && <span className="text-[10px]">✓</span>}
                                </div>
                                <p className="text-[10px] opacity-70 leading-tight">{opt.desc}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

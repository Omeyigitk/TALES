import { ALL_METAMAGICS, ALL_MANEUVERS, ALL_FIGHTING_STYLES } from "./[campaignId]/feats_data";

export const getFeatRequirements = (featName: string, libFeats: any[]) => {
    const feat = libFeats.find(f => f.name === featName);

    // Normal effects are searched first
    let effects = feat?.effects || [];

    // HARDCODED OVERRIDES for missing DB structure
    if (featName === "Metamagic Adept" && effects.length === 0) {
        effects = [{ type: 'choice', label: 'Metamagic', count: 2, options: ALL_METAMAGICS }];
    } else if (featName === "Martial Adept" && effects.length === 0) {
        effects = [{ type: 'choice', label: 'Maneuver', count: 2, options: ALL_MANEUVERS }];
    } else if (featName === "Fighting Initiate" && effects.length === 0) {
        effects = [{ type: 'choice', label: 'Fighting Style', count: 1, options: ALL_FIGHTING_STYLES }];
    } else if (featName === "Superior Technique" && effects.length === 0) {
        effects = [{ type: 'choice', label: 'Maneuver', count: 1, options: ALL_MANEUVERS }];
    }

    const statChoiceEffect = effects.find((e: any) => e.type === 'stat_choice');

    // Disable manual spell choices for most feats as per user request
    // Magic Initiate, Fey Touched, etc. will no longer show the spell selection UI
    const spellChoiceEffects = effects.filter((e: any) => e.type === 'spell_choice' && (
        featName === "Metamagic Adept" || // Metamagic Adept usually uses 'choice' but just in case
        featName === "Martial Adept"     // Martial Adept usually uses 'choice'
    ));

    const spellAutoEffects = effects.filter((e: any) => e.type === 'spell_auto');
    const choiceEffects = effects.filter((e: any) => e.type === 'choice');

    if (!statChoiceEffect && spellChoiceEffects.length === 0 && spellAutoEffects.length === 0 && choiceEffects.length === 0) return null;

    return {
        label: `${featName} Seçimleri`,
        statChoices: statChoiceEffect?.options,
        slots: spellChoiceEffects.length > 0 ? spellChoiceEffects.map((eff: any, idx: number) => ({
            type: eff.level === 0 ? 'cantrip' : 'leveled',
            count: 1,
            level: eff.level,
            school: eff.schools,
            classRestriction: eff.classRestriction,
            needsAttackRoll: eff.needsAttackRoll,
            label: eff.label || (eff.level === 0 ? `Cantrip ${idx + 1}` : `${eff.level}. Seviye Büyü`)
        })) : null,
        autoSpells: spellAutoEffects.map((e: any) => e.value),
        choices: choiceEffects.map((e: any) => ({
            label: e.label,
            count: e.count || 1,
            options: e.options
        }))
    };
};

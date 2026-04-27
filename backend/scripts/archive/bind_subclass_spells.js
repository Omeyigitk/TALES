const fs = require('fs');

const dbPath = 'c:/Users/Ömer Yiğit/.gemini/antigravity/scratch/dnd-app/backend/data/spells_hybrid.json';
const dbRaw = fs.readFileSync(dbPath, 'utf8');
const spellsObj = JSON.parse(dbRaw);
const spellsArray = Array.isArray(spellsObj) ? spellsObj : Object.values(spellsObj);

const spellMap = new Map();
spellsArray.forEach(s => {
    // lowercase the name and strip punctuation for easier matching
    const norm = s.name.toLowerCase().replace(/[^a-z]/g, '');
    spellMap.set(norm, s);
});

const classSubclassSpells = {
    // CLERIC
    "Arcana Domain": ["detect magic", "magic missile", "magic weapon", "nystul's magic aura", "dispel magic", "magic circle", "arcane eye", "leomund's secret chest", "planar binding", "teleportation circle"],
    "Death Domain": ["false life", "ray of sickness", "blindness/deafness", "ray of enfeeblement", "animate dead", "vampiric touch", "blight", "death ward", "antilife shell", "cloudkill"],
    "Forge Domain": ["identify", "searing smite", "heat metal", "magic weapon", "elemental weapon", "protection from energy", "fabricate", "wall of fire", "animate objects", "creation"],
    "Grave Domain": ["bane", "false life", "gentle repose", "ray of enfeeblement", "revivify", "vampiric touch", "blight", "death ward", "antilife shell", "raise dead"],
    "Knowledge Domain": ["command", "identify", "augury", "suggestion", "nondetection", "speak with dead", "arcane eye", "confusion", "legend lore", "scrying"],
    "Light Domain": ["burning hands", "faerie fire", "flaming sphere", "scorching ray", "daylight", "fireball", "guardian of faith", "wall of fire", "flame strike", "scrying"],
    "Nature Domain": ["animal friendship", "speak with animals", "barkskin", "spike growth", "plant growth", "wind wall", "dominate beast", "grasping vine", "insect plague", "tree stride"],
    "Order Domain": ["command", "heroism", "hold person", "zone of truth", "mass healing word", "slow", "compulsion", "locate creature", "commune", "dominate person"],
    "Peace Domain": ["heroism", "sanctuary", "aid", "warding bond", "beacon of hope", "sending", "aura of purity", "otiluke's resilient sphere", "greater restoration", "rary's telepathic bond"],
    "Trickery Domain": ["charm person", "disguise self", "mirror image", "pass without trace", "blink", "dispel magic", "dimension door", "polymorph", "dominate person", "modify memory"],
    "Twilight Domain": ["faerie fire", "sleep", "moonbeam", "see invisibility", "aura of vitality", "leomund's tiny hut", "aura of life", "greater invisibility", "circle of power", "mislead"],
    "War Domain": ["divine favor", "shield of faith", "magic weapon", "spiritual weapon", "crusader's mantle", "spirit guardians", "freedom of movement", "stoneskin", "flame strike", "hold monster"],

    // PALADIN
    "Oath of Devotion": ["protection from evil and good", "sanctuary", "lesser restoration", "zone of truth", "beacon of hope", "dispel magic", "freedom of movement", "guardian of faith", "commune", "flame strike"],
    "Oath of the Ancients": ["ensnaring strike", "speak with animals", "moonbeam", "misty step", "plant growth", "protection from energy", "ice storm", "stoneskin", "commune with nature", "tree stride"],
    "Oath of Vengeance": ["bane", "hunter's mark", "hold person", "misty step", "haste", "protection from energy", "banishment", "dimension door", "hold monster", "scrying"],
    "Oath of the Crown": ["command", "compelled duel", "warding bond", "zone of truth", "aura of vitality", "spirit guardians", "banishment", "guardian of faith", "circle of power", "geas"],
    "Oath of Conquest": ["armor of agathys", "command", "hold person", "spiritual weapon", "bestow curse", "fear", "dominate beast", "stoneskin", "cloudkill", "dominate person"],
    "Oath of Redemption": ["sanctuary", "sleep", "calm emotions", "hold person", "counterspell", "hypnotic pattern", "otiluke's resilient sphere", "stoneskin", "hold monster", "wall of force"],
    "Oath of Glory": ["guiding bolt", "heroism", "enhance ability", "magic weapon", "haste", "protection from energy", "compulsion", "freedom of movement", "commune", "flame strike"],
    "Oath of the Watchers": ["alarm", "detect magic", "moonbeam", "see invisibility", "counterspell", "nondetection", "aura of purity", "banishment", "hold monster", "scrying"],
    "Oath of the Open Sea": ["create or destroy water", "expeditious retreat", "augury", "misty step", "call lightning", "tidal wave", "control water", "freedom of movement", "commune with nature", "maelstrom"],
    "Oathbreaker": ["hellish rebuke", "inflict wounds", "crown of madness", "darkness", "animate dead", "bestow curse", "blight", "confusion", "contagion", "dominate person"],

    // RANGER
    "Gloom Stalker": ["disguise self", "rope trick", "fear", "greater invisibility", "seeming"],
    "Horizon Walker": ["protection from evil and good", "misty step", "haste", "banishment", "teleportation circle"],
    "Monster Slayer": ["protection from evil and good", "zone of truth", "magic circle", "banishment", "hold monster"],
    "Fey Wanderer": ["charm person", "misty step", "dispel magic", "dimension door", "mislead"],
    "Swarmkeeper": ["faerie fire", "mage hand", "web", "gaseous form", "arcane eye", "insect plague"],
    "Drakewarden": ["thaumaturgy"],

    // WARLOCK
    "The Archfey": ["faerie fire", "sleep", "calm emotions", "phantasmal force", "blink", "plant growth", "dominate beast", "greater invisibility", "dominate person", "seeming"],
    "The Celestial": ["cure wounds", "guiding bolt", "flaming sphere", "lesser restoration", "daylight", "revivify", "guardian of faith", "wall of fire", "flame strike", "greater restoration"],
    "The Fathomless": ["create or destroy water", "thunderwave", "gust of wind", "silence", "lightning bolt", "sleet storm", "control water", "summon elemental", "cone of cold"],
    "The Fiend": ["burning hands", "command", "blindness/deafness", "scorching ray", "fireball", "stinking cloud", "fire shield", "wall of fire", "flame strike", "hallow"],
    "The Genie": ["detect evil and good", "wish"], // Simplifying, genies give different spells per type
    "The Great Old One": ["dissonant whispers", "tasha's hideous laughter", "detect thoughts", "phantasmal force", "clairvoyance", "sending", "dominate beast", "evard's black tentacles", "dominate person", "telekinesis"],
    "The Hexblade": ["shield", "wrathful smite", "blur", "branding smite", "blink", "elemental weapon", "phantasmal killer", "staggering smite", "banishing smite", "cone of cold"],
    "The Undead": ["bane", "false life", "blindness/deafness", "phantasmal force", "speak with dead", "phantom steed", "death ward", "greater invisibility", "antilife shell", "cloudkill"],
    "The Undying": ["false life", "ray of sickness", "blindness/deafness", "silence", "feign death", "speak with dead", "aura of life", "death ward", "contagion", "legend lore"],

    // DRUID
    "Circle of the Land": ["spider climb", "spike growth", "lightning bolt", "meld into stone", "stone shape", "stoneskin", "passwall", "wall of stone", "blur"], // Just sample
    "Circle of Spores": ["chill touch", "blindness/deafness", "gentle repose", "animate dead", "gaseous form", "blight", "confusion", "cloudkill", "contagion"],
    "Circle of Wildfire": ["fire bolt", "burning hands", "cure wounds", "flaming sphere", "scorching ray", "plant growth", "revivify", "aura of life", "fire shield", "flame strike", "mass cure wounds"],

    // SORCERER
    "Aberrant Mind": ["arms of hadar", "dissonant whispers", "mind sliver", "calm emotions", "detect thoughts", "hunger of hadar", "sending", "evard's black tentacles", "summon aberration", "rary's telepathic bond", "telekinesis"],
    "Clockwork Soul": ["alarm", "protection from evil and good", "aid", "lesser restoration", "dispel magic", "protection from energy", "freedom of movement", "summon construct", "greater restoration", "wall of force"],
    "Divine Soul": [], // They choose cleric spells freely, no fixed list
    "Lunar Sorcery": ["color spray", "faerie fire", "sanctuary", "shield", "blindness/deafness", "moonbeam", "ray of enfeeblement", "lesser restoration"], // sample

}

let updateCount = 0;

for (const [subclass, rawSpells] of Object.entries(classSubclassSpells)) {
    for (const rawName of rawSpells) {
        const norm = rawName.toLowerCase().replace(/[^a-z]/g, '');
        const target = spellMap.get(norm);
        if (target) {
            target.subclasses = target.subclasses || [];
            if (!target.subclasses.includes(subclass)) {
                target.subclasses.push(subclass);
                updateCount++;
            }
        } else {
             // Missing spell, maybe we should log it
             // console.log(`Did not find spell for subclass: ${subclass} - ${rawName}`);
        }
    }
}

let resultData = Array.isArray(spellsObj) ? spellsArray : spellsArray.reduce((acc, curr) => { acc[curr.name] = curr; return acc; }, {});
fs.writeFileSync(dbPath, JSON.stringify(resultData, null, 4));
console.log(`Successfully appended subclass mappings for ${updateCount} spell connections.`);

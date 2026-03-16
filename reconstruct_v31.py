import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def extract_balanced_block(text, start_pos):
    # Find the FIRST '{' after or at start_pos
    s = text.find('{', start_pos)
    if s == -1: return ""
    
    bal = 1
    for i in range(s + 1, len(text)):
        if text[i] == '{': bal += 1
        elif text[i] == '}': bal -= 1
        if bal == 0:
            return text[s:i+1]
    return ""

def main():
    fragments_dir = r"C:\tmp"
    output_path = r"c:\Users\Ömer Yiğit\.gemini\antigravity\scratch\dnd-app\reconstruct_v31.tsx"

    print("Loading fragments...")
    f_p1 = read_file(os.path.join(fragments_dir, "f_p1.tsx"))
    f_attacks = read_file(os.path.join(fragments_dir, "f_attacks.tsx"))
    f_spells = read_file(os.path.join(fragments_dir, "f_spells.tsx"))
    f_inventory = read_file(os.path.join(fragments_dir, "f_inventory.tsx"))
    f_story = read_file(os.path.join(fragments_dir, "f_story.tsx"))

    # 1. Base Structure
    marker_p1 = "{/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}"
    base_content = f_p1.split(marker_p1)[0]
    
    injection_point = "const chatEndRef = useRef<HTMLDivElement>(null);"
    derived_vars = """
    // --- Derived Variables ---
    const lv = character?.level || 1;
    const level = lv;
    const prof = Math.ceil(lv / 4) + 1;
    const stats: any = character?.stats || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    const mods: any = {
        STR: mod(stats.STR || 10, 'STR'),
        DEX: mod(stats.DEX || 10, 'DEX'),
        CON: mod(stats.CON || 10, 'CON'),
        INT: mod(stats.INT || 10, 'INT'),
        WIS: mod(stats.WIS || 10, 'WIS'),
        CHA: mod(stats.CHA || 10, 'CHA')
    };
    const cls = character?.classRef?.name || '';
    const mcs = character?.multiclasses || [];
    const clsName = cls;
    const hpPct = character ? Math.round((currentHp / character.maxHp) * 100) : 0;
    const actualSpellsList = actualSpells || [];
    
    const saveCombatState = async (updates: any) => {
        if (!character) return;
        try {
            await axios.put(`${API_URL}/api/characters/${character._id}`, updates, { headers: { 'Authorization': `Bearer ${token}` } });
        } catch (e) { console.error(e); }
    };
    """
    base_content = base_content.replace(injection_point, injection_point + derived_vars)

    # 2. Extract Sections
    def extract_jsx(text, pattern):
        matches = list(re.finditer(pattern, text))
        if not matches: return ""
        # Find the one that actually looks like a JSX block (starts with { and has balanced braces)
        blocks = []
        for m in matches:
            # We want the '{' that is part of the conditional
            # Usually it's { condition && ( ... ) }
            # So let's look for the '{' before the match
            idx = text.rfind('{', 0, m.start())
            if idx != -1:
                block = extract_balanced_block(text, idx)
                if m.group(0) in block:
                    blocks.append(block)
        return max(blocks, key=len) if blocks else ""

    attacks_ui = extract_jsx(f_attacks, r'activeTab\s*===\s*["\']attacks["\']')
    spells_ui = extract_jsx(f_spells, r'activeTab\s*===\s*["\']spells["\']')
    inventory_ui = extract_jsx(f_inventory, r'activeTab\s*===\s*["\']inventory["\']')

    attacks_logic = ""
    if '(() => {' in f_attacks:
        attacks_logic = f_attacks.split('(() => {')[1].split('return (')[0]

    # Story regions (using markers)
    world_m = f_story.find('══════════ TAB: WORLD ══════════')
    party_m = f_story.find('══════════ TAB: PARTY ══════════')
    gallery_m = f_story.find('── GALLERY MODAL ──')

    # Find the opening '{' for each region
    story_m = f_story.find('{activeTab === "story"')
    
    def get_region_block(text, start_pos, end_pos):
        if start_pos == -1: return ""
        # If end_pos is given, sharpen the search
        raw = text[start_pos:end_pos] if end_pos != -1 else text[start_pos:]
        # Ensure it starts with { and ends with balanced }
        return extract_balanced_block(text, start_pos)

    story_region = get_region_block(f_story, story_m, world_m)
    
    # For world and party, we need to find the {activeTab === ...
    world_start = f_story.find('{activeTab === "world"', world_m)
    world_region = get_region_block(f_story, world_start, party_m)
    
    party_start = f_story.find('{activeTab === "party"', party_m)
    party_region = get_region_block(f_story, party_start, gallery_m)

    # Modals
    modal_patterns = [
        r'isGalleryOpen\s*&&',
        r'selectedImage\s*&&',
        r'showToast\s*&&',
        r'showRestModal\s*&&',
        r'showLevelUp\s*&&',
        r'isWhisperModalOpen\s*&&',
        r'showSpellPicker\s*&&',
        r'showCustomResourceModal\s*&&'
    ]
    
    all_modals = []
    for p in modal_patterns:
        block = extract_jsx(f_story, p)
        if block: all_modals.append(block)
    
    modals_ui = "\n\n".join(all_modals)

    # 3. Assembly
    full_code = base_content + marker_p1 + "\n"
    
    full_code += '                {(activeTab === "attacks" || activeTab === "spells") && (() => {\n'
    full_code += attacks_logic
    full_code += "                    return (\n"
    full_code += '                        <div className="pb-8 space-y-5">\n'
    full_code += f'                            {attacks_ui}\n'
    full_code += f'                            {spells_ui}\n'
    full_code += '                        </div>\n'
    full_code += '                    );\n'
    full_code += '                })()}\n\n'
    
    full_code += f'                {inventory_ui}\n\n'
    full_code += f'                {story_region}\n\n'
    full_code += f'                {world_region}\n\n'
    full_code += f'                {party_region}\n\n'
    
    full_code += '                {/* Modals */}\n'
    full_code += f'                {modals_ui}\n'
    
    full_code += "            </div>\n"
    full_code += "        </div>\n"
    full_code += "    );\n"
    full_code += "};\n\n"
    full_code += "export default PlayerSheet;\n"

    print(f"Writing output to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_code)
    print("Done!")

if __name__ == "__main__":
    main()

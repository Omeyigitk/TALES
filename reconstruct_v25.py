import sys

def read_utf8(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def main():
    paths = {
        'p1': '/tmp/f_p1.tsx',
        'attacks': '/tmp/f_attacks.tsx',
        'spells': '/tmp/f_spells.tsx',
        'inventory': '/tmp/f_inventory.tsx',
        'story': '/tmp/f_story.tsx'
    }
    
    data = {}
    for k, v in paths.items():
        data[k] = read_utf8(v)
    
    # Assembly v25
    content = []
    
    # 1. P1
    content.extend(data['p1'][:2334])
    
    # 2. Attacks & Spells Container
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    content.extend(data['attacks'][1:90]) # Logic
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    
    # Blocks from f_attacks
    content.extend(data['attacks'][93:103]) # Concentration
    content.extend(data['attacks'][104:177]) # Attacks Block 1
    content.extend(data['attacks'][178:213]) # Pinned Spells
    content.extend(data['attacks'][214:285]) # Resources (skip line 286 extra div)
    
    # Spells Block (from f_spells)
    # Line 1 is activeTab check. Line 2 is div.
    content.extend(data['spells'][0:332])
    content.append('                            </div>\n') # Close f_spells div
    content.append('                        )}\n')    # Close f_spells activeTab check
    
    # Close Outer Container
    content.append('                        </div>\n')
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # 3. Inventory Tab
    content.extend(data['inventory'][0:91])
    
    # 4. Story & Rest
    # f_story lines 1-5 is broken.
    content.append('                {activeTab === \"story\" && (\n')
    content.append('                    <div className=\"max-w-3xl pb-8 space-y-6\">\n')
    content.extend(data['story'][5:]) # content starts at line 6
    
    with open('reconstruct_final_v25.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_final_v25.tsx")

if __name__ == "__main__":
    main()

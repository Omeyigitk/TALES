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
    
    content = []
    
    # 1. P1
    content.extend(data['p1'][:2334])
    
    # 2. Attacks & Spells Logic Block
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    content.extend(data['attacks'][1:90]) # Logic (2-90)
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    
    # Concentration
    content.extend(data['attacks'][93:103]) # 94-103
    
    # Attacks UI
    content.extend(data['attacks'][104:177]) # 105-177 (Includes closures)
    
    # Pinned Spells
    content.extend(data['attacks'][178:213]) # 179-213 (Includes closures)
    
    # Resources
    content.extend(data['attacks'][240:285]) # 241-285. Skip 286 (index 285).
    content.append('                                    </div>\n') # Manual grid close
    content.append('                                )}\n')      # Manual activeTab check close
    
    # Spells Tab
    content.extend(data['spells'][0:332]) # 1-332
    content.append('                                </div>\n') # Manual spells div close
    content.append('                            )}\n')      # Manual spells activeTab close
    
    # Outer Closures
    content.append('                        </div>\n')      # Closures for pb-8 div
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # 3. Inventory
    content.extend(data['inventory'][0:91])
    
    # 4. Story
    content.append('                {activeTab === \"story\" && (\n')
    content.append('                    <div className=\"max-w-3xl pb-8 space-y-6\">\n')
    content.extend(data['story'][5:])
    
    with open('reconstruct_v26.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v26.tsx")

if __name__ == "__main__":
    main()

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
    
    # Assembly v24
    content = []
    
    # 1. Base (up to Attacks marker)
    content.extend(data['p1'][:2334])
    
    # 2. Complex Attacks & Spells Tab
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    # Logic (f_attacks.tsx lines 2-90)
    content.extend(data['attacks'][1:90]) 
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    # Concentration Status (f_attacks.tsx lines 94-103)
    content.extend(data['attacks'][93:103])
    # Attacks UI (f_attacks.tsx lines 105-238)
    content.extend(data['attacks'][104:238])
    # Resources UI (f_attacks.tsx lines 240-285 - skip 286!)
    content.extend(data['attacks'][239:285])
    # Spells UI (f_spells.tsx lines 1-333)
    # We strip the outer activeTab check and div to merge it cleanly
    content.append('                            {activeTab === \"spells\" && (\n')
    content.append('                                <div className=\"space-y-6 pb-20\">\n')
    content.extend(data['spells'][2:332])
    content.append('                                </div>\n')
    content.append('                            )}\n')
    # End of return and closure
    content.append('                        </div>\n')
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # 3. Inventory Tab
    content.extend(data['inventory'][0:91])
    
    # 4. Story & Rest
    content.extend(data['story'][0:2])
    content.extend(data['story'][5:])
    
    with open('reconstruct_v24.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v24.tsx")

if __name__ == "__main__":
    main()

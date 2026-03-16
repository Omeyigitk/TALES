import sys

def read_utf8(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
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
    
    # 2. Attacks & Spells Container
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    content.extend(data['attacks'][1:90]) # Logic (2-90)
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    
    # Blocks from f_attacks
    content.extend(data['attacks'][93:103]) # Concentration (94-103)
    content.extend(data['attacks'][104:177]) # Attacks Block 1
    content.extend(data['attacks'][178:213]) # Pinned Spells
    content.extend(data['attacks'][240:285]) # Resources
    
    # Close Resources & Attacks
    content.append('                                            );\n')
    content.append('                                        })}\n') # Close map
    content.append('                                    </div>\n') # Close grid div
    content.append('                                )}\n')          # Close activeTab attacks check
    
    # Spells Block (Heal f_spells)
    content.extend(data['spells'][0:332])
    content.append('                                </div>\n') # Close f_spells internal div
    content.append('                            )}\n')      # Close f_spells activeTab check
    
    # Container Closures
    content.append('                        </div>\n')      # Close pb-8 div
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # 3. Inventory
    content.extend(data['inventory'][0:91]) # Balanced
    
    # 4. Story (Fragment starts at 6)
    content.append('                {activeTab === \"story\" && (\n')
    content.append('                    <div className=\"max-w-3xl pb-8 space-y-6\">\n')
    content.extend(data['story'][5:]) # This includes the whole footer too.
    
    with open('reconstruct_final_balanced.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_final_balanced.tsx")

if __name__ == "__main__":
    main()

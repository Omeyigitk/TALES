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
    
    # Assembly
    content = []
    # 1. P1
    content.extend(data['p1'][:2334])
    
    # 2. Outer container start
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (\n')
    content.append('                    <div className=\"max-w-4xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n')
    
    # 3. Attacks
    content.extend(data['attacks'][104:290])
    
    # 4. Spells
    content.extend(data['spells'][0:333])
    
    # 5. Outer container end
    content.append('\n                    </div>\n                )}\n')
    
    # 6. Inventory
    content.extend(data['inventory'][0:91])
    
    # 7. Story & rest
    content.extend(data['story'][0:2])
    content.extend(data['story'][5:])
    
    with open('reconstruct_v21.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v21.tsx")

if __name__ == "__main__":
    main()

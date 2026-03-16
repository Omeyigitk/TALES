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
    
    # 2. Attacks logic + Outer container start (from f_attacks)
    # Line 1 to 104 is logic + start of container
    content.extend(data['attacks'][0:104])
    
    # 3. Attacks UI (blocks at 105, 178, 215)
    # We include everything up to line 287 (indexing 286)
    # BUT we skip line 286 (indexing 285) because it's an extra </div>
    content.extend(data['attacks'][104:285]) # Up to before the extra </div>
    # skip data['attacks'][285] which is '</div>\n' at line 286
    content.extend(data['attacks'][286:287]) # Include line 287: ');\n' for the map return
    # Wait, line 287 is ');\n'. line 288 is '})()}'
    
    # 4. Spells UI
    content.append('\n                    {activeTab === "spells" && (\n')
    content.append('                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">\n')
    # Use Spells internal content (skip its own activeTab check lines)
    # f_spells.tsx line 1-2 is {activeTab === "spells" && ( and <div ...>
    content.extend(data['spells'][2:332]) # The content (skip 1-2 and end closures)
    content.append('                        </div>\n')
    content.append('                    )}\n')
    
    # 5. Attacks/Spells container closures (from f_attacks)
    content.extend(data['attacks'][287:]) # line 288 (})()}), 289 (</div>), 290 ()})
    
    # 6. Inventory
    content.extend(data['inventory'][0:91])
    
    # 7. Story & rest
    content.extend(data['story'][0:2]) # lines 1-2
    content.extend(data['story'][5:])  # lines 6 onwards
    
    with open('reconstruct_v22.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v22.tsx")

if __name__ == "__main__":
    main()

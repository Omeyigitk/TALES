import sys
import re

def read_utf8(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def audit_and_fix(content, name):
    # Counts
    b = content.count('{') - content.count('}')
    p = content.count('(') - content.count(')')
    d = len(re.findall(r'<div\b', content)) - content.count('</div')
    
    print(f"Fragment {name}: B:{b} P:{p} D:{d}")
    
    # Fix Divs
    if d > 0:
        content += '\n' + ('</div>' * d) + '\n'
    elif d < 0:
        # Surgically remove trailing </div> tags
        for _ in range(abs(d)):
            content = content.rstrip()
            if content.endswith('</div>'):
                content = content[:-6]
    
    # Fix Braces/Parens
    if b > 0: content += ('}' * b)
    if p > 0: content += (')' * p)
    
    return content

def main():
    paths = {
        'p1': '/tmp/f_p1.tsx',
        'attacks': '/tmp/f_attacks.tsx',
        'spells': '/tmp/f_spells.tsx',
        'inventory': '/tmp/f_inventory.tsx',
        'story': '/tmp/f_story.tsx'
    }
    
    # 1. P1
    p1 = read_utf8(paths['p1'])
    # Fix P1 if needed, but it should be fine.
    
    # 2. Attacks
    attacks_full = read_utf8(paths['attacks'])
    # We want logic + tab start
    # Let's just fix the whole thing and take segments.
    # Actually, easier to just fix the logic block specifically.
    
    # 3. Spells
    spells = read_utf8(paths['spells'])
    spells = audit_and_fix(spells, "Spells")
    
    # 4. Inventory
    inventory = read_utf8(paths['inventory'])
    inventory = audit_and_fix(inventory, "Inventory")
    
    # 5. Story
    story = read_utf8(paths['story'])
    story = audit_and_fix(story, "Story")
    
    # ASSEMBLY
    lines_p1 = p1.splitlines(keepends=True)
    lines_atk = attacks_full.splitlines(keepends=True)
    
    content = []
    content.extend(lines_p1[:2334])
    
    # Join Block
    content.append('\n                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    content.extend(lines_atk[1:90]) # Logic
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    content.extend(lines_atk[93:103]) # Conc
    content.extend(lines_atk[104:177]) # Atk1
    content.extend(lines_atk[178:213]) # Pinned
    
    # Resources (Manual Stitch)
    content.extend(lines_atk[240:285]) # Resources UI
    content.append('                                            );\n')
    content.append('                                        })}\n')
    content.append('                                    </div>\n')
    content.append('                                )}\n')
    
    # Integrated Spells (Already fixed)
    content.append(spells)
    
    # Closures for outer
    content.append('                        </div>\n')
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # Integrated Inventory
    content.append(inventory)
    
    # Integrated Story
    content.append(story)
    
    with open('reconstruct_v28.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v28.tsx")

if __name__ == "__main__":
    main()

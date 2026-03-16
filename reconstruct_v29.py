import sys
import re

def read_utf8(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def heal_fragment(content, name):
    print(f"Healing {name}...")
    
    # DIVS
    o_div = len(re.findall(r'<div\b', content))
    c_div = content.count('</div')
    diff_div = o_div - c_div
    print(f"  Divs: {o_div} vs {c_div} (Diff: {diff_div})")
    if diff_div > 0:
        content += '\n' + ('</div>' * diff_div) + '\n'
    elif diff_div < 0:
        for _ in range(abs(diff_div)):
            last_idx = content.rfind('</div>')
            if last_idx != -1:
                content = content[:last_idx] + content[last_idx+6:]

    # BRACES
    o_b = content.count('{')
    c_b = content.count('}')
    diff_b = o_b - c_b
    print(f"  Braces: {o_b} vs {c_b} (Diff: {diff_b})")
    if diff_b > 0:
        content += '\n' + ('}' * diff_b) + '\n'
    elif diff_b < 0:
        for _ in range(abs(diff_b)):
            last_idx = content.rfind('}')
            if last_idx != -1:
                content = content[:last_idx] + content[last_idx+1:]

    # PARENS
    o_p = content.count('(')
    c_p = content.count(')')
    diff_p = o_p - c_p
    print(f"  Parens: {o_p} vs {c_p} (Diff: {diff_p})")
    if diff_p > 0:
        content += '\n' + (')' * diff_p) + '\n'
    elif diff_p < 0:
        for _ in range(abs(diff_p)):
            last_idx = content.rfind(')')
            if last_idx != -1:
                content = content[:last_idx] + content[last_idx+1:]

    return content

def main():
    paths = {
        'p1': '/tmp/f_p1.tsx',
        'attacks': '/tmp/f_attacks.tsx',
        'spells': '/tmp/f_spells.tsx',
        'inventory': '/tmp/f_inventory.tsx',
        'story': '/tmp/f_story.tsx'
    }
    
    # Read and Heal
    data = {}
    for k, v in paths.items():
        raw = read_utf8(v)
        if k == 'p1':
            data[k] = raw # P1 is the skeleton, keep it as is
        else:
            # Special case for Attacks: we want to only heal the INTERNAL part?
            # No, heal the whole thing then take segments.
            data[k] = heal_fragment(raw, k)
    
    # Stitching v29
    lines_p1 = data['p1'].splitlines(keepends=True)
    lines_atk = read_utf8(paths['attacks']).splitlines(keepends=True) # Use raw for indexing
    
    content = []
    # 1. P1
    content.extend(lines_p1[:2334])
    
    # 2. Attacks & Spells Container
    content.append('\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n')
    content.append('                {(activeTab === \"attacks\" || activeTab === \"spells\") && (() => {\n')
    content.extend(lines_atk[1:90]) # Logic
    content.append('\n                    return (\n')
    content.append('                        <div className=\"pb-8 space-y-5\">\n')
    
    # Concentration
    content.extend(lines_atk[93:103])
    
    # Specific Attacks Block (Heal it specifically)
    atk_block = "".join(lines_atk[104:177]) + "".join(lines_atk[178:213]) + "".join(lines_atk[240:285])
    atk_block = heal_fragment(atk_block, "AttacksUI")
    content.append(atk_block)
    
    # Integrated Spells (Healed)
    content.append(data['spells'])
    
    # Closures for outer
    content.append('                        </div>\n')
    content.append('                    );\n')
    content.append('                })()}\n')
    
    # 3. Inventory
    content.append(data['inventory'])
    
    # 4. Story
    content.append(data['story'])
    
    with open('reconstruct_v29.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v29.tsx")

if __name__ == "__main__":
    main()

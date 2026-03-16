import os

def read_lines(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()

def main():
    try:
        p1_lines = read_lines('/tmp/f_p1.tsx')
        attacks_lines = read_lines('/tmp/f_attacks.tsx')
        spells_lines = read_lines('/tmp/f_spells.tsx')
        inventory_lines = read_lines('/tmp/f_inventory.tsx')
        story_lines = read_lines('/tmp/f_story.tsx')

        # 1. P1 up to main tab closure (line 2333)
        # We include up to index 2334 (lines 1 to 2334)
        final_content = ''.join(p1_lines[:2334])

        # 2. Add marker and Outer container for Attacks/Spells
        final_content += '\n                {/* ══════════ TAB: ATTACKS & SPELLS ══════════ */}\n'
        final_content += '                {(activeTab === \"attacks\" || activeTab === \"spells\") && (\n'
        final_content += '                    <div className=\"max-w-4xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500\">\n'

        # 3. Attacks Internal (105-290, which is indexing 104:290)
        final_content += ''.join(attacks_lines[104:290])

        # 4. Spells Internal (1-333, which is indexing 0:333)
        final_content += ''.join(spells_lines[0:333])

        # 5. Close Outer container
        final_content += '\n                    </div>\n                )}\n'

        # 6. Inventory Internal (1-91, which is indexing 0:91)
        final_content += ''.join(inventory_lines[0:91])

        # 7. Story & Rest (f_story.tsx)
        # Fix story tab (lines 1-5 is broken empty tab)
        final_content += ''.join(story_lines[0:2]) # lines 1-2
        final_content += ''.join(story_lines[5:])  # lines 6 onwards

        with open('reconstruct_v20.tsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        
        print(f'Done. Lines: {len(final_content.splitlines())}')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == \"__main__\":
    main()

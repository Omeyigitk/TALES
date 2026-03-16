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
    
    # Assembly v23
    content = []
    # 1. P1
    content.extend(data['p1'][:2334])
    
    # 2. Attacks up to resource cards (line 285)
    # Index 285 is line 286. So data['attacks'][:285] is lines 1-285.
    content.extend(data['attacks'][:285])
    
    # 3. Spells (Full file)
    content.extend(data['spells'])
    
    # 4. Attacks closures (Skip line 286, take 287 onwards)
    # Index 285 is line 286. So data['attacks'][286:] is lines 287-end.
    content.extend(data['attacks'][286:])
    
    # 5. Inventory
    content.extend(data['inventory'][0:91])
    
    # 6. Story & rest
    content.extend(data['story'][0:2])
    content.extend(data['story'][5:])
    
    with open('reconstruct_v23.tsx', 'w', encoding='utf-8') as f:
        f.writelines(content)
    
    print(f"Reconstruction successful. File written to: reconstruct_v23.tsx")

if __name__ == "__main__":
    main()

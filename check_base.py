import os
import re

path = 'page_fixed_v30.tsx'
print(f"Auditing version: {path}")

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

tabs = ['attacks', 'spells', 'inventory', 'story', 'world', 'party']
for t in tabs:
    count = content.count(f'activeTab === "{t}"')
    alt_count = content.count(f"activeTab === '{t}'")
    total = count + alt_count
    if total > 0:
        print(f'Found tab: {t} ({total} hits)')
    else:
        print(f'MISSING tab: {t}')

print(f"Total lines: {len(content.splitlines())}")

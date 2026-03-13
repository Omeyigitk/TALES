
import re
import os

target_file = r'c:\Users\Ömer Yiğit\.gemini\antigravity\scratch\dnd-app\frontend\src\app\player\[campaignId]\sheet\page.tsx'

def analyze(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    brace_stack = []
    first_imbalance = None
    
    target_names = ['stats', 'mods', 'level', 'prof', 'clsName', 'mcs', 'slotTotals', 'canCast', 'extractDice', 'mod', 'getEffectiveScore', 'baseAttacks', 'resources']
    declarations = []

    for i, line in enumerate(lines):
        ln = i + 1
        
        # Check braces
        for char in line:
            if char == '{':
                brace_stack.append(ln)
            elif char == '}':
                if not brace_stack:
                    if first_imbalance is None:
                        first_imbalance = f"Extra '}}' found on line {ln}"
                else:
                    brace_stack.pop()
        
        # Check declarations
        for name in target_names:
            # Match const/let/var/function followed by whitespace and name
            pattern = rf'\b(const|let|var|function)\s+{re.escape(name)}\b'
            if re.search(pattern, line):
                declarations.append((ln, line.strip()))

    results = []
    results.append(f"Total Lines: {len(lines)}")
    results.append(f"Final brace balance: {len(brace_stack)}")
    if first_imbalance:
        results.append(first_imbalance)
    if brace_stack:
        results.append(f"Unclosed '{{' starts on line: {brace_stack[0]}")
        results.append(f"Total unclosed: {len(brace_stack)}")
        # Print the last few unclosed braces to help localize
        results.append(f"Last 5 unclosed braces start on lines: {brace_stack[-5:]}")

    results.append("\nTarget Declarations found:")
    for ln, content in declarations:
        results.append(f"Line {ln}: {content}")

    results_path = r'c:\Users\Ömer Yiğit\.gemini\antigravity\scratch\dnd-app\frontend\src\app\player\[campaignId]\sheet\analysis_results.txt'
    with open(results_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(results))
    print(f"Analysis complete. Results written to {results_path}")

if __name__ == "__main__":
    analyze(target_file)

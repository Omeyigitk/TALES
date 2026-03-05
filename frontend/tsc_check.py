import subprocess, re
result = subprocess.run(['npx', 'tsc', '--noEmit'], cwd='.', capture_output=True, text=True, encoding='utf-8')
errors = re.findall(r'.*error TS\d+.*', result.stdout + result.stderr)
print(f'Total errors: {len(errors)}')
for e in errors[:15]:
    print(e[:250])

path = r'src/app/player/[campaignId]/character-creator/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Update modal trigger condition
old1 = '{showFeatPicker !== null && (() => {'
new1 = (
    '{(showFeatPicker !== null || raceBonusFeat !== null) && (() => {\n'
    '                const isRacePicker = raceBonusFeat !== null;\n'
    '                const currentFeat = isRacePicker ? raceFeatStore[raceBonusFeat!] : asiSelections[showFeatPicker!]?.featName;\n'
    '                const closeModal = () => { setShowFeatPicker(null); setRaceBonusFeat(null); };\n'
    '                const selectFeat = (featName: string) => {\n'
    '                    if (isRacePicker) {\n'
    '                        setRaceFeatStore(prev => ({ ...prev, [raceBonusFeat!]: featName }));\n'
    '                    } else {\n'
    '                        const newAsi = [...asiSelections];\n'
    '                        newAsi[showFeatPicker!] = { ...newAsi[showFeatPicker!], featName };\n'
    '                        setAsiSelections(newAsi);\n'
    '                    }\n'
    '                    closeModal();\n'
    '                };'
)
if old1 in content:
    content = content.replace(old1, new1, 1)
    changes.append('1. modal trigger updated')
else:
    changes.append('1. SKIP: modal trigger not found')

# 2. Update close clicks (outer backdrop)
old2 = 'onClick={() => setShowFeatPicker(null)}\n                    >'
new2 = 'onClick={closeModal}\n                    >'
n = content.count(old2)
content = content.replace(old2, new2)
changes.append(f'2. outer backdrop click: {n} replaced')

# 3. Update X button
old3 = 'onClick={() => setShowFeatPicker(null)} className="text-gray-400 hover:text-white text-2xl leading-none">'
new3 = 'onClick={closeModal} className="text-gray-400 hover:text-white text-2xl leading-none">'
n = content.count(old3)
content = content.replace(old3, new3)
changes.append(f'3. X button: {n} replaced')

# 4. isSelected check
old4 = 'const isSelected = asiSelections[showFeatPicker]?.featName === feat.name;'
if old4 in content:
    content = content.replace(old4, 'const isSelected = currentFeat === feat.name;', 1)
    changes.append('4. isSelected updated')
else:
    # Maybe it has ! assertion already
    old4b = 'const isSelected = asiSelections[showFeatPicker!]?.featName === feat.name;'
    if old4b in content:
        content = content.replace(old4b, 'const isSelected = currentFeat === feat.name;', 1)
        changes.append('4. isSelected updated (! version)')
    else:
        changes.append('4. SKIP: isSelected not found')

# 5. Select onclick - find and replace the select button callback
# Look for the block that saves to asiSelections in the modal
old5 = (
    '                                                            const newAsi = [...asiSelections];\n'
    '                                                            newAsi[showFeatPicker] = { ...newAsi[showFeatPicker], featName: feat.name };\n'
    '                                                            setAsiSelections(newAsi);\n'
    '                                                            setShowFeatPicker(null);\n'
)
old5b = (
    '                                                            const newAsi = [...asiSelections];\n'
    '                                                            newAsi[showFeatPicker!] = { ...newAsi[showFeatPicker!], featName: feat.name };\n'
    '                                                            setAsiSelections(newAsi);\n'
    '                                                            setShowFeatPicker(null);\n'
)
new5 = '                                                            selectFeat(feat.name);\n'
if old5 in content:
    content = content.replace(old5, new5, 1)
    changes.append('5. select onclick updated')
elif old5b in content:
    content = content.replace(old5b, new5, 1)
    changes.append('5. select onclick updated (! version)')
else:
    changes.append('5. SKIP: select onclick not found, searching...')
    idx = content.find('setShowFeatPicker(null);', content.find('FEAT PICKER MODAL'))
    changes.append(f'   found at idx: {idx}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

for c in changes:
    print(c)
print('Done')

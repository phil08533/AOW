# Builds dist/index.html from the modules in src/. Usage: python3 tools/build.py
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(ROOT,'src')
a=open(os.path.join(SRC,'assets.js'), encoding='utf-8').read(); a=a[:a.index('// =================== TERRAIN')]
i=a.index('const ramp'); j=a.index('\n', a.index('function glow(hex)')); a=a[:i]+a[j+1:]
rd=lambda *fs: '\n'.join(open(os.path.join(SRC,f), encoding='utf-8').read() for f in fs)
parts={'ASSETS':a,'LEVELS':rd('levels.js','capitone.js'),'FEATURES':rd('hd.js', 'jamestown.js', 'detail.js', 'features.js','space.js','arena.js','robotcity.js','pets.js','sabers.js','ocean.js','moon.js','dialogue.js','bounty.js','gunmods.js','racing.js','spacefx.js','preview.js', 'armor.js', 'vehicles.js', 'army.js', 'skycity.js', 'worlds2.js', 'earth2.js', 'zeltac2.js', 'face.js', 'raids.js', 'romance.js', 'residential.js', 'shipmods.js', 'galaxymap.js', 'citylife.js', 'juice.js', 'progress.js', 'polish.js', 'boarding.js', 'drone.js', 'story.js', 'hud.js', 'wizard.js', 'shiprooms.js', 'party.js', 'music.js', 'prologue.js', 'cinema.js', 'shipaudio.js', 'hudsize.js', 'crucible.js', 'editor.js', 'editmode.js', 'dualwield.js', 'chars.js', 'body.js', 'controller.js', 'hudfix.js', 'pcinput.js', 'looks.js', 'phase1.js', 'tablet.js', 'phase3.js', 'bubblecity.js', 'trailer.js', 'velocity.js', 'inventory.js', 'shipstore.js', 'outlaw.js', 'wanted.js', 'substances.js', 'fishing2.js', 'pacing.js', 'hudlog.js', 'shiphall.js', 'cuts.js', 'uwdress.js', 'updates.js', 'gallery.js', 'storyfix.js', 'finale.js', 'velstorm.js', 'velpolish.js', 'halo.js', 'fishing3.js', 'gunfx.js', 'range.js', 'burpvo_ids.js', 'burpvo.js', 'burpmore.js', 'burptrailer.js'),'MODELS3':rd('models3.js','models4.js')}
for k,f in [('RETRO','retro.js'),('WORLD','world.js'),('RIG','rig.js'),('ENV','env.js'),('BASE','base.js'),('MODELS2','models2.js'),('QUESTS','quests.js')]: parts[k]=open(os.path.join(SRC,f), encoding='utf-8').read()
parts['BASE']=rd('base.js','furniture.js')
h=open(os.path.join(SRC,'game.src.html'), encoding='utf-8').read()
for k,v in parts.items():
    assert '{{'+k+'}}' in h, k
    h=h.replace('{{'+k+'}}', v)
os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
open(os.path.join(ROOT,'dist','index.html'),'w', encoding='utf-8').write(h)
if os.path.exists(os.path.join(ROOT, 'dev.html')):
    import shutil
    shutil.copy2(os.path.join(ROOT, 'dev.html'), os.path.join(ROOT, 'dist', 'dev.html'))
print('built dist/index.html', len(h), 'bytes')

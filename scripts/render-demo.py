"""Render an illustrated, synthetic-data storyboard. Not live API evidence.
Requires Python Pillow and ffmpeg. Usage: python scripts/render-demo.py OUTPUT_DIR
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, sys, textwrap, json
out=Path(sys.argv[1]).resolve(); out.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def f(size,b=False): return ImageFont.truetype(bold if b else font,size)
scenes=[
 ('01 / THE PROBLEM','A clearer address.\nA better start.','PostCheck brings structured Nigerian postcode capture into customer onboarding.','POSTCHECK  /  VIRAL AD MEDIA'),
 ('02 / ACCESS','Public information.\nProtected tools.','Marketing pages explain the product. A verified account is required for the dashboard and postcode API.','PUBLIC → SIGN IN → DASHBOARD'),
 ('03 / CAPTURE','Start with a\nlocation reference.','Enter a postcode or use the segment-aware capture flow. This example is synthetic and does not identify an applicant.','FC  ·  01  ·  A01  ·  KP  ·  27'),
 ('04 / VALIDATE','Request a\nLevel 1 check.','The app sends the request through its server boundary. The API credential stays on the server.','BROWSER → POSTCHECK SERVER → NIPOST'),
 ('05 / EVIDENCE','Show the\nactual response.','Valid, missing, invalid and unavailable results must remain distinct. Replace this storyboard with a recorded live response for submission.','LIVE RESPONSE CAPTURE PENDING'),
 ('06 / HANDOFF','A structured\nonboarding handoff.','The workflow prepares JSON for a downstream bank or fintech review. Use only synthetic applicant fields in the demonstration.','CAPTURE → VALIDATE → JSON HANDOFF'),
 ('07 / SCOPE','Location is not\nidentity or residence.','A valid postcode is a location reference. Identity checks and proof of residence remain separate decisions.','NO CLAIM OF IDENTITY OR OCCUPANCY'),
 ('08 / AUDIT','Review checks\nin this browser.','Prototype history is scoped to the signed-in account in local browser storage. It is not a centralized or tamper-proof audit system.','ACCOUNT-SCOPED  /  BROWSER-LOCAL'),
 ('09 / PILOT','Measure before\nclaiming success.','Proposed targets: 8 of 10 testers complete unaided; p95 at most 3 seconds across at least 100 requests. These are not measured results.','FOUR-WEEK PILOT  /  PROPOSED TARGETS'),
 ('10 / NEXT STEP','Build the next\nonboarding step.','Seeking a scoped bank or fintech evaluation using synthetic records first. Final live recording and evidence are required before submission.','POSTCHECK  /  BUILT FOR NIGERIAN ONBOARDING'),
]
for i,(tag,title,body,callout) in enumerate(scenes):
 im=Image.new('RGB',(1280,720),'#111115'); d=ImageDraw.Draw(im)
 d.rectangle((0,0,16,720),fill='#ebc700')
 d.text((64,38),'PostCheck.',font=f(28,True),fill='#ffffff')
 d.text((850,44),'ILLUSTRATED DEMO DRAFT',font=f(17,True),fill='#ebc700')
 d.text((64,112),tag,font=f(20,True),fill='#ebc700')
 d.multiline_text((64,158),title,font=f(58,True),fill='#ffffff',spacing=8)
 lines=textwrap.wrap(body,78)
 d.multiline_text((68,332),'\n'.join(lines),font=f(26),fill='#d8d9df',spacing=11)
 d.rounded_rectangle((64,490,1216,582),radius=16,fill='#1c2d24',outline='#43654c',width=2)
 d.text((88,521),callout,font=f(23,True),fill='#ffffff')
 d.text((64,626),'Synthetic workflow illustration • Not live API evidence',font=f(20),fill='#b8bac3')
 d.text((1140,626),f'{i+1:02d} / 10',font=f(18),fill='#b8bac3')
 d.rectangle((64,680,1216,685),fill='#34343c');d.rectangle((64,680,64+int(1152*(i+1)/10),685),fill='#ebc700')
 im.save(out/f'scene-{i:02d}.png')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-i',str(out/f'scene-{i:02d}.png'),'-t','15','-vf','fade=t=in:st=0:d=0.5,fade=t=out:st=14.5:d=0.5','-r','24','-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p',str(out/f'clip-{i:02d}.mp4')],check=True)
(out/'concat.txt').write_text(''.join(f"file '{out}/clip-{i:02d}.mp4'\n" for i in range(len(scenes))))
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(out/'concat.txt'),'-c','copy','-movflags','+faststart',str(out/'PostCheck-Illustrated-Demo-Draft.mp4')],check=True)
(out/'storyboard.json').write_text(json.dumps(scenes,indent=2))
print(out/'PostCheck-Illustrated-Demo-Draft.mp4')

from PIL import Image
import os

base = r'C:\Users\HP\.gemini\antigravity\brain\e163913d-e82c-426c-9a4c-ab17e99003b8\.user_uploaded'
out_dir = r'public\images'

# Image 1: Mood 1 (DJ)
im1 = Image.open(os.path.join(base, 'media_1791868029597_9826a90a.png')).convert('RGB')
crop1 = im1.crop((148, 65, 544, 505))
crop1.save(os.path.join(out_dir, 'real_mood_dj.jpg'), quality=95)

# Image 2: Mood 2 (Combinación de la Habana)
im2 = Image.open(os.path.join(base, 'media_1791868040155_853b6d19.png')).convert('RGB')
crop2 = im2.crop((148, 65, 488, 505))
crop2.save(os.path.join(out_dir, 'real_mood_habana.jpg'), quality=95)

# Image 3: Adriá 1 (Amigos)
im3 = Image.open(os.path.join(base, 'media_1791868183838_a42f0136.png')).convert('RGB')
crop3 = im3.crop((148, 65, 544, 505))
crop3.save(os.path.join(out_dir, 'real_adria_amigos.jpg'), quality=95)

# Image 4: Adriá 2 (Selfie fiesta)
im4 = Image.open(os.path.join(base, 'media_1791868200365_baf0e649.png')).convert('RGB')
crop4 = im4.crop((148, 65, 544, 505))
crop4.save(os.path.join(out_dir, 'real_adria_selfie.jpg'), quality=95)

# Image 5: Señor Perú 1 (Flyer)
im5 = Image.open(os.path.join(base, 'media_1791868238919_e698ed7e.png')).convert('RGB')
crop5 = im5.crop((138, 54, 498, 510))
crop5.save(os.path.join(out_dir, 'real_senor_peru_flyer.jpg'), quality=95)

print('All 5 real photos cropped successfully!')

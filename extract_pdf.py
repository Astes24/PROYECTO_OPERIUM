import PyPDF2
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

reader = PyPDF2.PdfReader(r'OPERIUM_Entretenimiento_Encargo_Unico_4_Locales_12-10-2026.pdf')
with open('pdf_content.txt', 'w', encoding='utf-8') as f:
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        f.write(f"=== PAGE {i+1} ===\n")
        f.write(text)
        f.write("\n\n")
print(f"Extracted {len(reader.pages)} pages to pdf_content.txt")

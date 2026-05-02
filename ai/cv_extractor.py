#cv_extractor.pv  fichier
from fastapi import FastAPI, UploadFile, File
import PyPDF2, re, io

app = FastAPI()

def extraire_texte_pdf(file_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return "".join(p.extract_text() or "" for p in reader.pages)

def extraire_texte_docx(file_bytes):
    from docx import Document
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs)

def extraire_email(texte):
    m = re.search(r'\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b', texte, re.I)
    return m.group(0) if m else None

def extraire_telephone(texte):
    m = re.search(r'(\+?\d[\d\s.\-]{7,}\d)', texte)
    return m.group(0).strip() if m else None

def extraire_annees_experience(texte):
    # Cherche "5 ans", "3 years", etc.
    m = re.search(r'(\d+)\s*(?:ans?|années?|years?)', texte.lower())
    return int(m.group(1)) if m else 0

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_bytes = await file.read()
    nom = file.filename.lower()

    if nom.endswith(".pdf"):
        texte = extraire_texte_pdf(file_bytes)
    elif nom.endswith(".docx"):
        texte = extraire_texte_docx(file_bytes)
    else:
        return {"success": False, "error": "Format non supporté"}

    return {
        "success":   True,
        "text":      texte[:6000],  # Ollama reçoit ce texte brut
        "meta": {
            "email":             extraire_email(texte),
            "telephone":         extraire_telephone(texte),
            "annees_experience": extraire_annees_experience(texte),
            "nb_caracteres":     len(texte),
        }
    }
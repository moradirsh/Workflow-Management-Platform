import fitz  
import docx  
from PIL import Image
import anthropic
import os
from dotenv import load_dotenv
import base64
import io

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def extract_text_from_pdf(file_bytes: bytes) -> str:
    # Open PDF and extract text
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    # Open Word doc and extract text
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()

def extract_text_from_image(file_bytes: bytes, media_type: str = "image/jpeg") -> str:
    # Send image to Claude 
    base64_image = base64.standard_b64encode(file_bytes).decode("utf-8")
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": "Describe what you see in this image in detail. Focus on any text, documents, damage, incidents, or relevant information for a case management system."
                    }
                ]
            }
        ]
    )
    return message.content[0].text

def extract_file_content(file_bytes: bytes, filename: str) -> str:
    # Route to correct extractor based on file extension
    ext = filename.lower().split(".")[-1]
    
    if ext == "pdf":
        text = extract_text_from_pdf(file_bytes)
        if text:
            return text
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page = doc[0]
        pix = page.get_pixmap()
        img_bytes = pix.tobytes("jpeg")
        return extract_text_from_image(img_bytes, "image/jpeg")
    elif ext in ["docx", "doc"]:
        return extract_text_from_docx(file_bytes)
    elif ext == "jpg" or ext == "jpeg":
        return extract_text_from_image(file_bytes, "image/jpeg")
    elif ext == "png":
        return extract_text_from_image(file_bytes, "image/png")
    elif ext == "webp":
        return extract_text_from_image(file_bytes, "image/webp")
    else:
        return ""
from __future__ import annotations

import io

from app.core.logging import get_logger

log = get_logger(__name__)

MAX_OCR_CHARS = 4000


def image_to_text(data: bytes) -> str | None:
    if not data:
        return None
    try:
        import pytesseract
        from PIL import Image, ImageOps
    except ImportError:
        log.warning("ocr_unavailable", reason="pytesseract не установлен")
        return None
    try:
        image: Image.Image = Image.open(io.BytesIO(data))
        image = image.convert("RGB")
        if image.width < 1000:
            scale = max(2, 1000 // max(image.width, 1))
            image = image.resize((image.width * scale, image.height * scale))
        gray = ImageOps.autocontrast(image.convert("L"))
    except Exception as exc:
        log.warning("ocr_prepare_failed", error=str(exc))
        return None

    best = ""
    variants = (gray, image)
    configs = ("--oem 3 --psm 6", "")
    for variant in variants:
        for config in configs:
            try:
                text = pytesseract.image_to_string(variant, lang="rus+eng", config=config)
            except Exception as exc:
                log.warning("ocr_failed", error=str(exc))
                continue
            cleaned = " ".join(str(text).split())
            if len(cleaned) > len(best):
                best = cleaned
    if not best:
        return None
    log.info("ocr_done", chars=len(best))
    return best[:MAX_OCR_CHARS]

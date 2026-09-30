from types import SimpleNamespace

import httpx

from app.bot.handlers import _image_from_attachments
from app.integrations.max.client import MaxBotClient


def test_image_ref_from_payload():
    attachments = [{"type": "image", "payload": {"token": "t1", "url": "https://cdn.max.ru/x.jpg"}}]
    ref = _image_from_attachments(attachments)
    assert ref == {"token": "t1", "url": "https://cdn.max.ru/x.jpg"}


def test_image_ref_skips_other_types():
    attachments = [
        {"type": "contact", "payload": {"vcf_info": "x"}},
        {"type": "image", "payload": {}},
        {"type": "file", "payload": {"token": "t2", "url": "https://cdn.max.ru/y.pdf"}},
    ]
    ref = _image_from_attachments(attachments)
    assert ref == {"token": "t2", "url": "https://cdn.max.ru/y.pdf"}


def _client(handler) -> MaxBotClient:
    instance = MaxBotClient.__new__(MaxBotClient)
    instance._base_url = "https://botapi.max.ru"
    instance._settings = SimpleNamespace(
        max_bot_token="bot-token",
        max_ca_bundle="",
        max_request_timeout=15,
        max_verify_ssl=True,
    )
    instance._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return instance


async def test_fetch_attachment_downloads_direct_url():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "cdn.max.ru"
        return httpx.Response(200, content=b"image-bytes")

    data = await _client(handler).fetch_attachment("t1", "https://cdn.max.ru/x.jpg")
    assert data == b"image-bytes"


async def test_fetch_attachment_retries_with_auth():
    seen: list[str | None] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request.headers.get("Authorization"))
        if request.headers.get("Authorization") == "bot-token":
            return httpx.Response(200, content=b"auth-bytes")
        return httpx.Response(403)

    data = await _client(handler).fetch_attachment("t1", "https://cdn.max.ru/x.jpg")
    assert data == b"auth-bytes"
    assert seen[0] is None


async def test_fetch_attachment_falls_back_to_files_api():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "cdn.max.ru":
            return httpx.Response(404)
        if request.url.path == "/files":
            assert request.url.params["token"] == "t1"
            return httpx.Response(200, json={"url": "https://files.max.ru/a.jpg"})
        assert request.url.host == "files.max.ru"
        return httpx.Response(200, content=b"files-bytes")

    data = await _client(handler).fetch_attachment("t1", "https://cdn.max.ru/x.jpg")
    assert data == b"files-bytes"

import os, shutil, pytest, litellm
from types import SimpleNamespace

CHROMA_DIR = "app/data/chroma"

@pytest.fixture(autouse=True, scope="session")
def clean_chroma():
    if os.path.isdir(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    yield

@pytest.fixture(autouse=True)
def mock_litellm(monkeypatch):
    def _fake_completion(**kwargs):
        return SimpleNamespace(
            choices=[SimpleNamespace(message={"content": "FAKE_ANSWER"})],
            usage={"total_tokens": 1},
        )
    monkeypatch.setattr(litellm, "completion", _fake_completion)
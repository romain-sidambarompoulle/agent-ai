import os
import shutil
import litellm
import pytest

CHROMA_DIR = "app/data/chroma"

@pytest.fixture(autouse=True, scope="session")
def clean_chroma():
    """Supprime la DB Chroma persistante avant les tests."""
    if os.path.isdir(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    yield
    # pas de recréation à la fin – les tests restent isolés

@pytest.fixture(autouse=True)
def mock_litellm(monkeypatch):
    """Simule litellm.completion pour tous les tests."""
    def _fake_completion(**kwargs):
        return {
            "choices": [{"message": {"content": "FAKE_ANSWER"}}],
            "usage": {"total_tokens": 1},
        }
    monkeypatch.setattr(litellm, "completion", _fake_completion)
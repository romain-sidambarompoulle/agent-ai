import os
import shutil
import pytest

CHROMA_DIR = "app/data/chroma"

@pytest.fixture(autouse=True, scope="session")
def clean_chroma():
    """Supprime la DB Chroma persistante avant les tests."""
    if os.path.isdir(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
    yield
    # pas de recréation à la fin – les tests restent isolés
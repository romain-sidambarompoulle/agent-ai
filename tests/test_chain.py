import os
os.environ["CHROMA_TEMP"] = "1"   # force le mode in-memory pour ce test

from app.langserve_launch_example import get_chain


def test_get_chain_returns_chain() -> None:
    """Ensure get_chain builds a chain instance."""
    chain = get_chain()
    assert chain is not None
from langserve_launch_example import get_chain


def test_get_chain_returns_chain() -> None:
    """Ensure get_chain builds a chain instance."""
    chain = get_chain()
    assert chain is not None
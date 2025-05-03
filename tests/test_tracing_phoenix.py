"""
Test Pytest : vérifie que Phoenix reçoit au moins un span pendant un run CrewAI.
"""

import pytest
# --- OpenTelemetry : import robuste ---
try:
    # SDK ≤ 1.31
    from opentelemetry.sdk.trace.export import InMemorySpanExporter, SimpleSpanProcessor
except ImportError:
    # SDK ≥ 1.32 (la classe a déménagé)
    from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from phoenix.otel import register
from app.crew import run as crew_run
from phoenix.otel import register

# fonction qui déclenche réellement la Crew
from app.crew import run as crew_run


@pytest.fixture(scope="function")
def memory_exporter():
    """Initialise un exporter en mémoire et branche Phoenix dessus."""
    exporter = InMemorySpanExporter()
    tracer_provider = register(auto_instrument=True)
    tracer_provider.add_span_processor(SimpleSpanProcessor(exporter))
    yield exporter
    exporter.clear()

@pytest.mark.xfail(reason="TracerProvider déjà fixé avant Phoenix")
def test_tracing_phoenix(memory_exporter):
    """Assure qu'au moins un span est capturé pendant l'exécution d'une question fictive."""
    # --- Exécution artificielle ---
    crew_run("Ping Phoenix ?")

    # --- Vérification ---
    spans = memory_exporter.get_finished_spans()
    assert spans, "Phoenix n'a enregistré aucun span : le micro est muet !"
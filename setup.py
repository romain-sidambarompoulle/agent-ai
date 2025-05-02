from setuptools import setup, find_packages

setup(
    name="agent_ai_app",
    version="0.1.0",
    packages=find_packages(),   # trouve app/, tests/…
    python_requires=">=3.11",
)
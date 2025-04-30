from setuptools import setup, find_packages

setup(
    name="agent_ai_app",       # nom arbitraire
    version="0.0.1",
    packages=find_packages(),  # détecte langserve_launch_example
    include_package_data=True,
)
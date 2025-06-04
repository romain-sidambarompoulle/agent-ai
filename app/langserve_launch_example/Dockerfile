FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --upgrade pip && pip install -r requirements.txt
ENV CHROMA_TEMP=1
# CMD ["python","-m","pytest","-q"]
CMD ["uvicorn","langserve_launch_example.server:app","--host","0.0.0.0","--port","8001"]


FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --upgrade pip && pip install -r app/requirements.txt
ENV CHROMA_TEMP=1
CMD ["python","-m","pytest","-q"]
ENV OPENAI_API_KEY="test"

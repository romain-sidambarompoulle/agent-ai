from fastapi import FastAPI
from langserve import add_routes
from .chain import get_chain

app = FastAPI(title="LangServe Launch Example")

add_routes(app, get_chain())        # ✅ sans input_schema

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
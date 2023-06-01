from flask import Flask, render_template, request, jsonify
import random
import json
import openai
from langchain.document_loaders.base import Document
from langchain.indexes import VectorstoreIndexCreator
from langchain.utilities import ApifyWrapper
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os
from chat import get_response

app = Flask(__name__)


@app.get("/")
def index_get():
    return render_template("base.html")


@app.post("/predict")
def predict():
    text = request.get_json().get("message")

    # TODO: check text validity

    response = get_response(text)

    message = {"answer": response}

    print("in:" + text)
    print(jsonify(message))

    return jsonify(message)


if __name__ == "__main__":
    app.run(debug=True)

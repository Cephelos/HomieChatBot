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
from create import upload_index

app = Flask(__name__)


@app.get("/")
def index_get():
    return render_template("base.html")


@app.get("/url")
def url_get():
    return render_template("upload.html")


@app.post("/predict")
def predict():
    text = request.get_json().get("query")
    index_name = request.get_json().get("index_name")
    print(text)
    print(index_name)
    # TODO: check text validity

    response = get_response(text, index_name)

    message = {"answer": response}

    print("in:" + text)
    print(jsonify(message))

    return jsonify(message)


@app.post("/create_index")
def create_index():
    text = request.get_json().get("message")

    # TODO: check text validity
    print(text)

    response = upload_index(text)

    message = {"answer": response}

    print("in:" + text)
    print(jsonify(message))

    return jsonify(message)


if __name__ == "__main__":
    app.run(debug=True)

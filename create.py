import random
import json
import openai
from langchain.document_loaders.base import Document
from langchain.indexes import VectorstoreIndexCreator
from langchain.utilities import ApifyWrapper
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
import pinecone
from tqdm.auto import tqdm
from uuid import uuid4
import os
import tiktoken
from apify_client import ApifyClient
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import Pinecone
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQAWithSourcesChain

os.environ["OPENAI_API_KEY"] = "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"
os.environ["APIFY_API_TOKEN"] = "apify_api_vYzWRLX7dHb1H4qE7WjjsPhNPNoMf52QVzli"

client = ApifyClient("apify_api_5PWQzTgoKpZmu1kjwdWDIdNcs4W6Io25Nga8")


apify = ApifyWrapper()


def upload_index(url):
    try:
        run_input = {
            "aggressivePrune": False,
            "debugMode": False,
            "htmlTransformer": "readableText",
            "proxyConfiguration": {"useApifyProxy": True},
            "removeElementsCssSelector": "header, nav, footer",
            "saveFiles": False,
            "saveHtml": False,
            "saveMarkdown": False,
            "saveScreenshots": False,
            "startUrls": [{"url": url}],
            "textExtractor": "readableText",
            "crawlerType": "playwright:chrome",
            "maxCrawlDepth": 20,
            "maxCrawlPages": 9999999,
            "maxConcurrency": 200,
            "initialConcurrency": 0,
            "initialCookies": [],
            "dynamicContentWaitSecs": 10,
            "clickElementsCssSelector": '[aria-expanded="false"]',
            "readableTextCharThreshold": 100,
            "maxResults": 9999999,
        }

        run = client.actor("apify/website-content-crawler").call(run_input=run_input)

        print("passed scrape")

        data = client.dataset(run["defaultDatasetId"]).iterate_items()
        data_list = []

        for entry in data:
            data_list.append(
                {
                    "text": entry["text"],
                    "url": entry["metadata"]["canonicalUrl"],
                    "title": entry["metadata"]["canonicalUrl"],
                }
            )
        print("passed data processing")

        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=20)

        embeddings = OpenAIEmbeddings()

        res = embeddings.embed_documents(data_list[0]["text"])

        YOUR_API_KEY = "bab0e3e6-b740-4586-9098-7c515b6abd47"
        YOUR_ENV = "us-west1-gcp"

        index_name = ""

        for char in url:
            if char.isalpha():
                index_name = index_name + char.lower()
            else:
                pass

        print(index_name)

        pinecone.init(api_key=YOUR_API_KEY, environment=YOUR_ENV)

        print("passed pinecone init")

        if index_name not in pinecone.list_indexes():
            # we create a new index
            pinecone.create_index(
                name=index_name, metric="cosine", dimension=len(res[0])
            )

        print("passed test 1")

        index = pinecone.GRPCIndex(index_name)

        print("passed pinecone index creation")

        batch_limit = 100

        texts = []
        metadatas = []

        for i, record in enumerate(tqdm(data_list)):
            metadata = {"source": record["url"], "title": record["title"]}

            record_texts = text_splitter.split_text(record["text"])

            record_metadatas = [
                {"chunk": j, "text": text, **metadata}
                for j, text in enumerate(record_texts)
            ]

            texts.extend(record_texts)
            metadatas.extend(record_metadatas)

            if len(texts) >= batch_limit:
                ids = [str(uuid4()) for _ in range(len(texts))]
                embeds = embeddings.embed_documents(texts)
                index.upsert(vectors=zip(ids, embeds, metadatas))
                texts = []
                metadatas = []

        print(texts)

        if len(texts) > 0:
            ids = [str(uuid4()) for _ in range(len(texts))]
            embeds = embeddings.embed_documents(texts)
            index.upsert(vectors=zip(ids, embeds, metadatas))

        print("passed upsert")

        return "success"
    except:
        return "failuire"

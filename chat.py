import random
import json
import openai
from langchain.document_loaders.base import Document
from langchain.indexes import VectorstoreIndexCreator
from langchain.utilities import ApifyWrapper
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os

os.environ["OPENAI_API_KEY"] = "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"
os.environ["APIFY_API_TOKEN"] = "apify_api_vYzWRLX7dHb1H4qE7WjjsPhNPNoMf52QVzli"

apify = ApifyWrapper()

loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={
        "aggressivePrune": False,
        "debugMode": False,
        "htmlTransformer": "readableText",
        "proxyConfiguration": {"useApifyProxy": True},
        "removeElementsCssSelector": "header, nav, footer",
        "saveFiles": False,
        "saveHtml": False,
        "saveMarkdown": False,
        "saveScreenshots": False,
        "startUrls": [{"url": "http://help.rupahealth.com/en/"}],
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
    },
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)

index = VectorstoreIndexCreator().from_loaders([loader])


def get_response(msg):
    query = "How do I get your pizza?"
    result = index.query_with_sources(query)

    return result["answer"]


if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)

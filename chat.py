import random
import json
import openai
from langchain.document_loaders.base import Document
from langchain.indexes import VectorstoreIndexCreator
from langchain.utilities import ApifyWrapper
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.prompts import PromptTemplate
import pinecone
import os

os.environ["OPENAI_API_KEY"] = "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"
os.environ["APIFY_API_TOKEN"] = "apify_api_vYzWRLX7dHb1H4qE7WjjsPhNPNoMf52QVzli"

PINECONE_API_KEY = "bab0e3e6-b740-4586-9098-7c515b6abd47"
PINECONE_ENV = "us-west1-gcp"

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)

embeddings = OpenAIEmbeddings()


# apify = ApifyWrapper()

# loader = apify.call_actor(
#    actor_id="apify/website-content-crawler",
#    run_input={
#        "aggressivePrune": False,
#        "debugMode": False,
#        "htmlTransformer": "readableText",
#        "proxyConfiguration": {"useApifyProxy": True},
#        "removeElementsCssSelector": "header, nav, footer",
#        "saveFiles": False,
#        "saveHtml": False,
#        "saveMarkdown": False,
#        "saveScreenshots": False,
#        "startUrls": [{"url": "http://help.rupahealth.com/en/"}],
#        "textExtractor": "readableText",
#        "crawlerType": "playwright:chrome",
#        "maxCrawlDepth": 20,
#        "maxCrawlPages": 9999999,
#        "maxConcurrency": 200,
#        "initialConcurrency": 0,
#        "initialCookies": [],
#        "dynamicContentWaitSecs": 10,
#        "clickElementsCssSelector": '[aria-expanded="false"]',
#        "readableTextCharThreshold": 100,
#        "maxResults": 9999999,
#    },
#    dataset_mapping_function=lambda item: Document(
#        page_content=item["text"] or "", metadata={"source": item["url"]}
#    ),
# )

# index = VectorstoreIndexCreator().from_loaders([loader])

text_field = "text"
index_name = "langchain-rupa-health-practitioners"

index = pinecone.Index(index_name)

vectorstore = Pinecone(index, embeddings.embed_query, text_field)

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. Answer succinctly using at most two sentances. 

{context}

Question: {question}
Answer:"""
# 
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)

chain_type_kwargs = {"prompt": PROMPT}

llm = ChatOpenAI(
    openai_api_key="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",
    model_name="gpt-3.5-turbo",
    temperature=0.0,
)

qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever(), chain_type_kwargs=chain_type_kwargs
)



def get_response(msg):
    query = msg
    result = qa.run(query)
    
    return result




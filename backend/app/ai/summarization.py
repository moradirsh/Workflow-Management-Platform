from langchain_anthropic import ChatAnthropic #type: ignore
from langchain_core.prompts import ChatPromptTemplate #type: ignore
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatAnthropic(model = "claude-haiku-4-5-20251001", 
                    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY"))

prompt = ChatPromptTemplate.from_template("""
                                          You are a case management assistant. Sumarrize the following case in
                                          1-2 concise sentences. Focus on the key issue and what needs to be resolved
                                          Case Title: {title}
                                          Case Description: {description}
                                          Respond with only the summary, nothing else.
                                          """)
chain = prompt | llm

def summarize_case(title: str, description: str) -> str:
    response = chain.invoke({"title": title, "description": description})
    return response.content.strip() 

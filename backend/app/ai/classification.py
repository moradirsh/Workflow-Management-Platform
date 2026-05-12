from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate 
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatAnthropic(model = "claude-haiku-4-5-20251001", 
                    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY"))

prompt = ChatPromptTemplate.from_template("""
                                          You are a case management assistant. Classify the following case into one of these categories:
                                          - Contract
                                          - Billing
                                          - Legal
                                          - Technical
                                          - HR
                                          - Other
                                          Case Title: {title}
                                          Case Description: {description}
                                          Respond with only the category name, nothing else.
                                          """)

chain = prompt | llm

def classify_case(title: str, description: str) -> str:
    response = chain.invoke({"title": title, "description": description})
    return response.content.strip()

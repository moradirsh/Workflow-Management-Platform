from langchain_anthropic import ChatAnthropic 
from langchain_core.prompts import ChatPromptTemplate 
from langgraph.graph import StateGraph, END
from typing import TypedDict as TypeDict
from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatAnthropic(model = "claude-haiku-4-5-20251001", 
                    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY"))

# This will define the state that flows through the graph
class CaseState(TypeDict):
    title: str
    description: str
    category: str
    summary: str
    recommendation: str
    
recommendation_prompt = ChatPromptTemplate.from_template("""
                                                         You are a case management assistant. Based on the following
                                                         case details, provide 2-3 clear and actionable next steps.
                                                         Case Title: {title}
                                                         Case Description: {description}
                                                         Summary: {summary}
                                                         Respond with only the recommended next steps, numbered 1-3.
                                                         Be specific and actionable.
                                                         """)

recommendation_chain = recommendation_prompt | llm

def generate_recommendation(state: CaseState) -> CaseState:
    response = recommendation_chain.invoke({
        "title": state["title"],
        "description": state["description"],
        "summary": state["summary"]
    })
    state["recommendation"] = response.content.strip()
    return state

# Build graph
graph = StateGraph(CaseState)
graph.add_node("recommend", generate_recommendation)
graph.set_entry_point("recommend")
graph.add_edge("recommend", END)
workflow = graph.compile()

def get_recommendation(title: str, category: str, summary: str) -> str:
    result = workflow.invoke({
        "title": title,
        "description": "",  # We can pass an empty description since it's not used in the prompt
        "category": category,
        "summary": summary,
        "recommendation": ""  # This will be filled in by the graph
    })
    return result["recommendation"]
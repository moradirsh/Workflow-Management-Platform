# Stores automated case insights like classification, summary, recommendation, and confidence.
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"
    id = Column(Integer, primary_key = True, index = True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable = False)
    classification = Column(String, nullable = True)
    summary = Column(String, nullable = True)
    recommendation = Column(String, nullable = True)
    confidence = Column(Float, nullable = True) #type: ignore
    created_at = Column(DateTime(timezone = True), server_default = func.now())
    
    # Relationship to the Case model
    case = relationship("Case", back_populates = "ai_analysis")
# Comment management for cases
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter(prefix = "/cases", tags = ["Comments"])

# Get all comments for a specific case
@router.get("/{case_id}/comments", response_model = List[CommentRead])
def get_comments(case_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = db.query(Comment).filter(Comment.case_id == case_id).order_by(Comment.created_at.asc()).all()
    result = []
    for comment in comments:
        author = db.query(User).filter(User.id == comment.author_id).first()
        comment_data = CommentRead(id = comment.id, case_id = comment.case_id, author_id = comment.author_id, body = comment.body,
                                   created_at = comment.created_at, author_name = author.name if author else "Unknown")
        result.append(comment_data)
    return result


# Add a comment to a specific case (The one selected)
@router.post("/{case_id}/comments", response_model = CommentRead)
def add_comment(case_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if case and case.is_archived:
        raise HTTPException(status_code = 403, detail = "Cannot comment on an archived case")
    new_comment = Comment(case_id = case_id, author_id = current_user.id, body = comment.body)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return CommentRead(id = new_comment.id, case_id = new_comment.case_id, author_id = new_comment.author_id, body = new_comment.body,
                       created_at = new_comment.created_at, author_name = current_user.name)
    
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.db_models import User
from backend.app.schemas.api_schemas import UserRegister, UserLogin, UserResponse, Token
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed = get_password_hash(req.password)
    user = User(
        name=req.name,
        email=req.email.lower(),
        password_hash=hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/login", response_model=Token)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/demo", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Instant 1-click Demo Account login for seamless testing."""
    demo_email = "demo@datasense.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Demo Analyst",
            email=demo_email,
            password_hash=get_password_hash("datasense2026")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return current_user

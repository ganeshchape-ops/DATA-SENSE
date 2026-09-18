import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.models.db_models import User, ActivityLog
from backend.app.schemas.api_schemas import (
    UserRegister, UserLogin, UserResponse, Token,
    SendOTPRequest, VerifyOTPRequest, OTPResponse,
    ForgotPasswordRequest, ResetPasswordWithOTPRequest,
    UserUpdateProfile, ChangePasswordRequest
)
from backend.app.services.otp_service import create_and_send_otp, verify_otp_code
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

@router.post("/register", response_model=Token)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with role and mobile number."""
    existing_email = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    if req.mobile_number:
        existing_mobile = db.query(User).filter(User.mobile_number == req.mobile_number.strip()).first()
        if existing_mobile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists."
            )
    
    hashed = get_password_hash(req.password)
    user = User(
        name=req.name,
        email=req.email.lower(),
        mobile_number=req.mobile_number.strip() if req.mobile_number else None,
        company=req.company or "Enterprise",
        role=req.role or "Data Analyst",
        password_hash=hashed,
        is_verified=True,
        is_active=True,
        last_login=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log activity
    log = ActivityLog(user_id=user.id, action="register", details=f"Registered as {user.role} ({user.email})")
    db.add(log)
    db.commit()

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/login", response_model=Token)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email OR mobile number and password."""
    ident = (req.email or "").strip().lower()
    
    # Search by email or mobile number
    user = db.query(User).filter((User.email == ident) | (User.mobile_number == ident)).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/mobile number or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated by an administrator."
        )

    user.last_login = datetime.datetime.utcnow()
    log = ActivityLog(user_id=user.id, action="login", details="User signed in")
    db.add(log)
    db.commit()
        
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/demo", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Instant 1-click Demo Account login for seamless testing."""
    demo_email = "demo@ai-insight.io"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Alex Sterling",
            email=demo_email,
            mobile_number="+18005550199",
            company="AI Insight Labs",
            role="Lead Data Scientist",
            password_hash=get_password_hash("aiinsight2026"),
            is_verified=True,
            is_active=True,
            last_login=datetime.datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login = datetime.datetime.utcnow()
        db.commit()
        
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=user)

@router.post("/send-otp", response_model=OTPResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Generate and send 6-digit OTP code to mobile number or email."""
    success, msg, demo_otp = create_and_send_otp(db, req.target, req.purpose)
    if not success:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=msg)
    
    return OTPResponse(
        success=True,
        message=msg,
        target=req.target,
        expires_in_seconds=300,
        demo_otp=demo_otp
    )

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify submitted 6-digit OTP code."""
    valid, msg = verify_otp_code(db, req.target, req.otp_code, req.purpose)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    
    # If user exists, activate/verify
    user = db.query(User).filter((User.email == req.target) | (User.mobile_number == req.target)).first()
    if user:
        user.is_verified = True
        db.commit()
        token = create_access_token(user.id)
        return {"success": True, "message": msg, "token": Token(access_token=token, token_type="bearer", user=user)}
        
    return {"success": True, "message": msg}

@router.post("/forgot-password", response_model=OTPResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate forgot password workflow by dispatching verification OTP."""
    target = req.target.strip().lower()
    user = db.query(User).filter((User.email == target) | (User.mobile_number == target)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account registered with this email or mobile number.")
    
    success, msg, demo_otp = create_and_send_otp(db, target, purpose="forgot_password")
    if not success:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=msg)
        
    return OTPResponse(
        success=True,
        message=msg,
        target=target,
        expires_in_seconds=300,
        demo_otp=demo_otp
    )

@router.post("/reset-password")
def reset_password(req: ResetPasswordWithOTPRequest, db: Session = Depends(get_db)):
    """Reset account password using verified OTP code."""
    valid, msg = verify_otp_code(db, req.target, req.otp_code, purpose="forgot_password")
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
        
    target = req.target.strip().lower()
    user = db.query(User).filter((User.email == target) | (User.mobile_number == target)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    user.password_hash = get_password_hash(req.new_password)
    db.commit()
    
    log = ActivityLog(user_id=user.id, action="reset_password", details="Password reset via OTP verification")
    db.add(log)
    db.commit()

    return {"success": True, "message": "Password updated successfully. You can now login with your new password."}

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(req: UserUpdateProfile, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update profile details (Name, Company, Role, Mobile)."""
    if req.name is not None:
        current_user.name = req.name
    if req.company is not None:
        current_user.company = req.company
    if req.role is not None:
        current_user.role = req.role
    if req.mobile_number is not None:
        current_user.mobile_number = req.mobile_number
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Change account password while authenticated."""
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
        
    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully."}

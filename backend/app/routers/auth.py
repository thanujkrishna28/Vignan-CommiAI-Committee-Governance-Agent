from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, AuditLog
from app.auth.auth import (
    verify_password, create_access_token, hash_password, get_current_user
)
from app.schemas.schemas import LoginRequest, TokenResponse, UserOut, UserCreate

router = APIRouter(prefix="/api/auth", tags=["auth"])


KNOWN_DEMO_USERS = {
    # Official Faculty Named Mails from CSE Department Faculty List
    "kvkk_cse@vignan.ac.in": {
        "name": "Prof. Dr. K. V. Krishna Kishore",
        "role": "REGISTRAR",
        "phone": "+91-9440856976",
        "designation": "Professor & Dean, SOCE (Registrar)",
    },
    "dsvpk_cse@vignan.ac.in": {
        "name": "Dr. S. V. Phani Kumar",
        "role": "CONVENER",
        "phone": "+91-9912354004",
        "designation": "Professor & HoD, CSE (Convener)",
    },
    "edc_cse@vignan.ac.in": {
        "name": "Dr. E. Deepak Chowdary",
        "role": "IQAC",
        "phone": "+91-9553147457",
        "designation": "Asst. Prof. (IQAC Coordinator)",
    },
    "jv_cse@vignan.ac.in": {
        "name": "Dr. J. Veeranjaneyulu",
        "role": "MEMBER",
        "phone": "+91-9032128228",
        "designation": "Asst. Prof. (Committee Member)",
    },
    # Backward compatible aliases
    "registrar@example.com": {"name": "Prof. Dr. K. V. Krishna Kishore", "role": "REGISTRAR", "phone": "+91-9440856976"},
    "convener@example.com": {"name": "Dr. S. V. Phani Kumar", "role": "CONVENER", "phone": "+91-9912354004"},
    "iqac@example.com": {"name": "Dr. E. Deepak Chowdary", "role": "IQAC", "phone": "+91-9553147457"},
    "member@example.com": {"name": "Dr. J. Veeranjaneyulu", "role": "MEMBER", "phone": "+91-9032128228"},
}


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    from sqlalchemy import func
    email_clean = body.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email_clean).first()

    # Auto-provision or update demo user
    if not user and email_clean in KNOWN_DEMO_USERS:
        demo_info = KNOWN_DEMO_USERS[email_clean]
        user = User(
            name=demo_info["name"],
            email=email_clean,
            password_hash=hash_password("Demo@1234"),
            role=demo_info["role"],
            status="ACTIVE",
            phone=demo_info.get("phone", "+91-9876543210")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user and email_clean in KNOWN_DEMO_USERS:
        demo_info = KNOWN_DEMO_USERS[email_clean]
        user.name = demo_info["name"]
        user.role = demo_info["role"]
        user.status = "ACTIVE"
        if body.password == "Demo@1234" and not verify_password(body.password, user.password_hash):
            user.password_hash = hash_password("Demo@1234")
        db.commit()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive or suspended")
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    
    # Audit log
    log = AuditLog(
        user_id=user.id,
        action="user_login",
        entity_type="user",
        entity_id=user.id,
        description=f"User {user.email} logged in",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    db.commit()
    
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this institutional email already exists.")
    
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role.upper(),
        phone=body.phone,
        status="ACTIVE",
        last_login_at=datetime.utcnow()
    )
    db.add(user)
    
    log = AuditLog(
        user_id=user.id,
        action="user_registered",
        entity_type="user",
        entity_id=user.id,
        description=f"User {user.email} registered with role {user.role}",
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "avatar_url": user.avatar_url
        }
    }


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password")
async def forgot_password(body: dict, db: Session = Depends(get_db)):
    email = body.get("email")
    user = db.query(User).filter(User.email == email).first()
    # Always return success to prevent email enumeration
    return {"message": "If an account exists with this email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(body: dict, db: Session = Depends(get_db)):
    # Simplified reset - in production use proper token-based reset
    return {"message": "Password reset functionality requires email configuration."}

from datetime import datetime, timedelta
import os
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

# Cấu hình JWT từ biến môi trường
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

security_scheme = HTTPBearer()


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Sinh access token JWT với payload chứa thông tin user
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    """
    Middleware kiểm tra JWT trong các route được bảo vệ
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials 

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload  
    except JWTError:
        raise credentials_exception
    
def authorize(allowed_roles: List[str]):
    """
    Hàm "Factory" tạo ra một dependency
    để kiểm tra vai trò (role) của user.
    Giống hệt hàm authorize(allowedRoles) của bạn.
    """
    
    # Đây là dependency (middleware) thực sự sẽ được chạy
    async def role_checker(current_user: dict = Depends(verify_token)):
        """
        Hàm gác cổng này chạy SAU KHI verify_token chạy thành công.
        Nó nhận 'current_user' (payload) từ verify_token.
        """
        user_role = current_user.get("role")
        
        # Kiểm tra role
        if user_role not in allowed_roles:
            # Nếu không có quyền, ném lỗi 403
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden. Requires one of: {', '.join(allowed_roles)}"
            )
        
        # Nếu có quyền, trả về user
        return current_user
    
    # Hàm authorize() trả về hàm role_checker
    return role_checker

import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
print(f"Testing Cloudinary configuration: cloud_name={cloud_name}, api_key={api_key[:6]}***")

# Test upload with structured person/member folder hierarchy
person_id = "USR-2026-REGISTRAR-001"
folder_path = f"vignan-commiai/persons/{person_id}/statutory_credentials"

test_data = b"Vignan CommiAI - Official Statutory Institutional Appointment Order Archive"

try:
    res = cloudinary.uploader.upload(
        test_data,
        folder=folder_path,
        public_id="appointment_order_verified",
        resource_type="raw",
        overwrite=True
    )
    print("SUCCESS: Cloudinary upload structured successfully!")
    print("Public ID:", res.get("public_id"))
    print("Folder:", res.get("folder") or folder_path)
    print("Secure URL:", res.get("secure_url"))
except Exception as e:
    print("Cloudinary upload failed:", e)

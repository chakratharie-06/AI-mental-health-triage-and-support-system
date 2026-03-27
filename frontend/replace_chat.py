import os
import re

file_path = r"c:\Users\chakr\OneDrive\Desktop\AI mental health triage system\frontend\src\pages\ChatPage.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    # Backgrounds and Surfaces
    "#EFF5F5": "var(--bg-page)",
    "#F8FCFC": "var(--surface-primary)",
    "#F0F7F7": "var(--surface-secondary)",
    "#FFF9F0": "var(--warning-light)",
    "#E8F5F5": "var(--primary-50)",
    "#F5FAFA": "var(--primary-50)",
    "#E0EEED": "var(--primary-100)",
    "#E8F2F2": "var(--border-light)",
    "#D5EAEA": "var(--primary-200)",
    "#5BA4A4": "var(--primary-500)",
    "#3D7A7A": "var(--primary-700)",
    "#4A7A7A": "var(--primary-800)",
    
    # Text
    "#1E3A3A": "var(--text-primary)",
    "#2C3E3E": "var(--text-primary)",
    "#AABCBC": "var(--text-secondary)",
    "#A0C0C0": "var(--text-tertiary)",
    "#7A9A9A": "var(--text-tertiary)",
    
    # Crisis Banner
    "#FFF0F0": "var(--danger-light)",
    "#FFBABA": "var(--danger-base)",
    "#7A1A1A": "var(--danger-dark)",
    
    # Linear gradients specific
    "linear-gradient(135deg,#5BA4A4,#3D7A7A)": "var(--primary-500)", # simplified to solid primary
    "linear-gradient(135deg,#E8F5F5,#F0F8F0)": "var(--primary-50)",
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Fix a couple of explicit RGBAs if present
content = re.sub(r"rgba\(91,164,164,0\.28\)", "var(--shadow-md)", content)
content = re.sub(r"rgba\(91,164,164,0\.38\)", "var(--shadow-lg)", content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced colors successfully")

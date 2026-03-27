import os

file_path = r"c:\Users\chakr\OneDrive\Desktop\AI mental health triage system\frontend\src\pages\ResourcesPage.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    # Severity Badges / Backgrounds
    "bg-red-50 hover:bg-red-100": "bg-danger-light hover:bg-danger-light/80",
    "bg-red-50": "bg-danger-light",
    "border-red-200": "border-danger-base",
    "text-red-800": "text-danger-dark",
    "text-red-600": "text-danger-base",
    
    "bg-yellow-50 hover:bg-yellow-100": "bg-warning-light hover:bg-warning-light/80",
    "bg-yellow-50": "bg-warning-light",
    "border-yellow-200": "border-warning-base",
    "text-yellow-800": "text-warning-dark",
    "text-yellow-600": "text-warning-base",
    
    "bg-green-50 hover:bg-green-100": "bg-success-light hover:bg-success-light/80",
    "bg-green-50": "bg-success-light",
    "border-green-200": "border-success-base",
    "text-green-800": "text-success-dark",
    "text-green-600": "text-success-base",
    
    "bg-blue-50 hover:bg-blue-100": "bg-info-light hover:bg-info-light/80",
    "bg-blue-50": "bg-info-light",
    "border-blue-200": "border-info-base",
    "text-blue-800": "text-info-dark",
    "text-blue-600": "text-info-base",
    
    # Specific buttons/icons if any using blue/teal
    "text-blue-500": "text-primary-500",
    "bg-blue-100": "bg-primary-100",
    "text-blue-700": "text-primary-700",
    
    "from-teal-50 to-blue-50": "from-primary-50 to-secondary-50",
    "bg-teal-100": "bg-primary-100",
    "text-teal-600": "text-primary-600",
    "text-teal-800": "text-primary-800",
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced resources colors successfully")

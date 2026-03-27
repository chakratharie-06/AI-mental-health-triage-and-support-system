import os
import glob
import re

base_dir = r"c:\Users\chakr\OneDrive\Desktop\AI mental health triage system\frontend\src"

# Match Tailwind utility class patterns
def replace_colors(match):
    prefix = match.group(1)
    color = match.group(2)
    shade = match.group(3)

    if color in ["blue", "teal", "cyan"]:
        new_color = "primary"
    elif color in ["purple", "pink"]:
        new_color = "secondary"
    else:
        new_color = color

    return f"{prefix}-{new_color}-{shade}"

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern captures group1: prefixes (bg, text, border, ring, from, via, to, hover:..., focus:...)
    # group2: color name
    # group3: shade
    pattern = r'\b((?:hover:|focus:|active:|group-hover:)?(?:bg|text|border|ring|from|via|to))-(blue|teal|cyan|purple|pink)-(\d{2,3})\b'

    new_content = re.sub(pattern, replace_colors, content)
    
    # Custom semantics replacements mapping for standard red/green/yellow badges
    semantics = {
        "text-red-500": "text-danger-base",
        "text-red-600": "text-danger-base",
        "text-red-700": "text-danger-dark",
        "bg-red-500": "bg-danger-base",
        "bg-red-50": "bg-danger-light",
        "border-red-200": "border-danger-base",
        
        "text-green-500": "text-success-base",
        "text-green-600": "text-success-base",
        "text-green-700": "text-success-dark",
        "bg-green-500": "bg-success-base",
        "bg-green-50": "bg-success-light",
        "border-green-200": "border-success-base",
        
        "text-yellow-500": "text-warning-base",
        "text-yellow-600": "text-warning-base",
        "text-yellow-700": "text-warning-dark",
        "bg-yellow-500": "bg-warning-base",
        "bg-yellow-50": "bg-warning-light",
        "border-yellow-200": "border-warning-base",
    }
    
    for old, new in semantics.items():
        new_content = new_content.replace(old, new)

    if content != new_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Process pages and components
for ext in ("pages/*.jsx", "components/*.jsx"):
    for filepath in glob.glob(os.path.join(base_dir, ext)):
        process_file(filepath)

print("Done with global replace.")

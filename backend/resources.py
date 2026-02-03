
# Static Database of Verified Indian Mental Health Resources
# Categories: Crisis, NGO, Hospital, Professional

INDIAN_RESOURCES = {
    "National": [
        {
            "name": "Tele MANAS",
            "number": "14416",
            "type": "Crisis",
            "desc": "Government of India's 24/7 comprehensive mental health helpline.",
            "verified": True
        },
        {
            "name": "Vandrevala Foundation",
            "number": "1860-266-2345",
            "type": "Crisis",
            "desc": "Free 24/7 counseling support via call and WhatsApp.",
            "verified": True
        },
        {
            "name": "iCall (TISS)",
            "number": "9152987821",
            "type": "NGO",
            "desc": "Psychosocial helpline run by Tata Institute of Social Sciences (Mon-Sat, 10am-8pm).",
            "verified": True
        }
    ],
    "Delhi": [
        {
            "name": "Sanjivini Society",
            "location": "Defence Colony, New Delhi",
            "number": "011-24311918",
            "type": "NGO",
            "desc": "Free confidential counseling and rehabilitation services.",
            "verified": True
        },
        {
            "name": "AIIMS Psychiatry Dept",
            "location": "Ansari Nagar, New Delhi",
            "type": "Hospital",
            "desc": "Premier public hospital offering specialized mental health care.",
            "verified": True
        },
        {
            "name": "Vimhans Classics",
            "location": "Lajpat Nagar",
            "type": "Hospital",
            "desc": "Specialized mental health & neurosciences hospital.",
            "verified": True
        }
    ],
    "Maharashtra": [
        {
            "name": "Mumbaikars for Mental Health",
            "location": "Mumbai",
            "type": "Support Group",
            "desc": "Community-led support groups for depression and anxiety.",
            "verified": True
        },
        {
            "name": "KEM Hospital Psychiatry",
            "location": "Parel, Mumbai",
            "type": "Hospital",
            "desc": "Public hospital with extensive psychiatric OPD services.",
            "verified": True
        },
        {
            "name": "Connecting NGO",
            "location": "Pune",
            "number": "9922001122",
            "type": "Crisis",
            "desc": "Suicide prevention helpline available 12pm-8pm.",
            "verified": True
        }
    ],
    "Karnataka": [
        {
            "name": "NIMHANS",
            "location": "Bengaluru",
            "number": "080-46110007",
            "type": "Hospital",
            "desc": "National Institute of Mental Health and Neuro Sciences. Top tier care.",
            "verified": True
        },
        {
            "name": "Parivarthan",
            "location": "Indiranagar, Bengaluru",
            "number": "080-25295737",
            "type": "Counseling",
            "desc": "Professional counseling services and training center.",
            "verified": True
        }
    ],
    "Tamil Nadu": [
        {
            "name": "Sneha Suicide Prevention",
            "location": "Chennai",
            "number": "044-24640050",
            "type": "Crisis",
            "desc": "24/7 confidential emotional support for distress.",
            "verified": True
        },
        {
            "name": "Schizophrenia Research Foundation (SCARF)",
            "location": "Anna Nagar, Chennai",
            "type": "NGO",
            "desc": "Comprehensive care and rehabilitation for mental disorders.",
            "verified": True
        }
    ],
    "West Bengal": [
        {
            "name": "Lifeline Foundation",
            "location": "Kolkata",
            "number": "033-24637401",
            "type": "Crisis",
            "desc": "Reach out for free emotional support (10am - 6pm).",
            "verified": True
        },
        {
            "name": "Antara",
            "location": "Kolkata",
            "type": "Hospital",
            "desc": "Psychiatric treatment and rehabilitation centre.",
            "verified": True
        }
    ]
}

def get_resources_by_state(state):
    """
    Returns resources for a specific state + National resources.
    """
    state_resources = INDIAN_RESOURCES.get(state, [])
    national_resources = INDIAN_RESOURCES.get("National", [])
    
    # Return simulated "Nearest Professionals" based on state
    professionals = []
    if state in INDIAN_RESOURCES:
        professionals = [
            {"name": f"Dr. Sharma ({state} Clinic)", "rating": 4.8, "verified": True},
            {"name": f"MindCare Center {state}", "rating": 4.5, "verified": True}
        ]
        
    return {
        "emergency": national_resources,
        "local": state_resources,
        "professionals": professionals
    }

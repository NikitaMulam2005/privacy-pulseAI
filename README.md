🏛️ PrivacyPulse AI — Web Safety & Transparency Companion

“Understand Before You Accept.”
Built by Nikita Mulam for the Chrome Built-In AI Challenge 2025

🔍 Overview

In an era where websites constantly collect and process user data, PrivacyPulse AI empowers users to analyze, summarize, and evaluate website privacy policies before accepting them.
This system integrates a Chrome Extension and a Web Platform, backed by an AI-powered backend that provides real-time privacy risk analysis.

🧠 Key Features

🧩 Chrome Extension – Automatically detects and summarizes privacy policies on visited websites.

🌐 Web Portal – Allows users to manually scan any website URL.

⚙️ FastAPI Backend – Handles AI analysis and data storage.

🧠 Gemini API – Generates concise, user-friendly summaries of long privacy policies.

🌾 Random Forest Classifier – Predicts website risk levels (Safe / Neutral / Risky) based on linguistic and structural features.

📊 Dashboard – Displays detailed reports and historical privacy risk analysis.

🎭 Playwright Integration – Automates policy extraction from complex webpages.

sequenceDiagram
    participant U as 👤 User
    participant CE as 🧩 Chrome Extension
    participant WUI as 🌐 Web Interface
    participant BE as ⚙️ FastAPI Backend
    participant AI as 🧠 Gemini API
    participant DB as 🗄️ MongoDB
    participant UI as 💻 Dashboard

    %% Chrome Extension Flow
    U->>CE: Visit website
    CE->>BE: Send extracted Privacy Policy text
    BE->>AI: Request summary & risk analysis
    AI-->>BE: Return analyzed summary
    BE->>DB: Store results
    BE-->>CE: Send summarized insights
    CE-->>U: Display real-time popup summary

    %% Web Portal Flow
    U->>WUI: Enter/paste website URL
    WUI->>BE: Send URL for scanning (via Playwright)
    BE->>AI: Analyze privacy policy
    AI-->>BE: Return summary & classification
    BE->>DB: Save results
    BE-->>WUI: Return structured summary
    WUI-->>U: Display insights

    %% Dashboard Access
    U->>UI: Open dashboard
    UI->>DB: Fetch stored analyses
    DB-->>UI: Display risk reports and insights

⚙️ Tech Stack
| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| Frontend        | HTML, CSS, JS, Chrome Extension API |
| Backend         | FastAPI (Python)                    |
| AI Layer        | Gemini API + Random Forest Model    |
| Web Scraping    | Playwright                          |
| Database        | MongoDB                             |
| Hosting         | Render / Vercel / Local Testing     |
| Version Control | Git + GitHub                        |

🧪 Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/<your-username>/PrivacyPulseAI.git

2️⃣ Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3️⃣ (Extension) Setup

Go to Chrome → Extensions → Manage Extensions → Load unpacked
Select the extension/ folder inside the project.
Open any website to see the privacy popup appear.

4️⃣ Web Portal

npm install
npm start

🧪 Testing the Application

Launch the FastAPI backend.
Load the Chrome Extension in your browser.
Visit any website with a visible privacy policy.
You’ll see a real-time summary popup.
Optionally, open the web portal and paste any URL to view full analysis and reports.


🚀 Live Demo

🧩 Demo Video: [Add YouTube or Drive link]
🌐 Web Portal: https://privacypulse-frontend.onrender.com/


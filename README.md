# Nairobi Urban Flood CAT — Team A

End-to-end pluvial flood catastrophe prototype for the Kenya Re / UoN hackathon.

Pipeline: **Hazard → Vulnerability → Exposure → Financial engine → EP curve**, plus an AI layer that changes the numbers.

See `HACKATHON_NOTE.md` for sources, assumptions and the AI feature.

## Run (Windows PowerShell)

```powershell
cd c:\Users\MOSES\Downloads\Dev\hackathon
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

# terminal 1
$env:PYTHONPATH = "backend"
python -m uvicorn app.main:app --reload --port 8000

# terminal 2
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

- Toggle **AI drainage correction** and press **Run model** — 1-in-100 loss should move.
- Paste free text such as `25 informal iron-sheet houses in Kibera, KES 800000 each` — location count and TIV should rise.

## Layout

```
config/                 return periods, JRC k, drainage AI (all labelled)
data/                   starter-kit CSVs
backend/app/engine/     ingestion, vulnerability, financial, AI, SHAP
frontend/               React workbench
HACKATHON_NOTE.md       judge note
```

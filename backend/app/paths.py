from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "team_a_nairobi"
if not DATA_DIR.exists():
    DATA_DIR = ROOT / "data"
CONFIG_DIR = ROOT / "config"
RUNS_DIR = ROOT / "backend" / "runs"
PARAMETERS_PATH = CONFIG_DIR / "model_parameters.yaml"
ASSUMPTIONS_PATH = CONFIG_DIR / "assumptions_register.yaml"
EXPOSURE_PATH = DATA_DIR / "exposure_nairobi_with_hazard.csv"
HOTSPOTS_PATH = DATA_DIR / "nairobi_hotspots_geocoded.csv"
LEDGER_PATH = RUNS_DIR / "ledger.jsonl"

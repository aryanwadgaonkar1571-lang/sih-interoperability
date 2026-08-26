from fastapi import FastAPI, HTTPException

app = FastAPI(title="Mock Dept A")

MOCK_DB = {
    "1001": {"aadhaar_no": "1001", "full_name": "Rohan Sharma", "dob": "15-08-1998", "gender": "M"}
}

@app.get("/citizen/{citizen_id}")
def get_citizen(citizen_id: str):
    record = MOCK_DB.get(citizen_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record
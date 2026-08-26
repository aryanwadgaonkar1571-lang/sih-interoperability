from fastapi import FastAPI, HTTPException

app = FastAPI(title="Mock Dept B")

MOCK_DB = {
    "1001": {"citizen_uid": "1001", "applicant_name": "Rohan Sharma", "applicant_dob": "1998-08-15", "sex": "Male"}
}

@app.get("/applicant/{applicant_id}")
def get_applicant(applicant_id: str):
    record = MOCK_DB.get(applicant_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record
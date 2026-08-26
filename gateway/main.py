from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from mapper import SchemaMapper

app = FastAPI(title="SIH Interoperability Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIT_LOGS = []

DEPT_ENDPOINTS = {
    "DEPT_A": "http://localhost:8001/citizen",
    "DEPT_B": "http://localhost:8002/applicant"
}

class InteropRequest(BaseModel):
    source_dept: str
    target_dept: str
    citizen_id: str
    consent_given: bool

@app.post("/api/v1/interop/fetch")
def exchange_citizen_data(req: InteropRequest):
    if not req.consent_given:
        raise HTTPException(status_code=403, detail="Consent not provided by citizen.")

    source_mapper = SchemaMapper(f"mappings/{req.source_dept.lower()}.yaml")
    target_mapper = SchemaMapper(f"mappings/{req.target_dept.lower()}.yaml")

    endpoint = f"{DEPT_ENDPOINTS[req.source_dept]}/{req.citizen_id}"
    resp = requests.get(endpoint)
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Citizen record not found in source department.")
    
    raw_source_data = resp.json()

    canonical_record = source_mapper.to_canonical(raw_source_data)
    transformed_target_data = target_mapper.from_canonical(canonical_record)

    log_entry = {
        "timestamp": "2026-08-25T16:30:00Z",
        "source": req.source_dept,
        "target": req.target_dept,
        "status": "SUCCESS",
        "fields_mapped": list(canonical_record.keys())
    }
    AUDIT_LOGS.append(log_entry)

    return {
        "status": "success",
        "canonical_intermediate": canonical_record,
        "payload_delivered_to_target": transformed_target_data,
        "audit_id": len(AUDIT_LOGS)
    }

@app.get("/api/v1/audit-trail")
def get_audit_trail():
    return {"logs": AUDIT_LOGS}
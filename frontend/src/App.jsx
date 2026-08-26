import React, { useState, useEffect } from "react";
import axios from "axios";

const GATEWAY_URL = "http://localhost:8000/api/v1";

export default function App() {
  const [sourceDept, setSourceDept] = useState("DEPT_A");
  const [targetDept, setTargetDept] = useState("DEPT_B");
  const [citizenId, setCitizenId] = useState("1001");
  const [consentGiven, setConsentGiven] = useState(true);
  
  const [result, setResult] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${GATEWAY_URL}/audit-trail`);
      setAuditLogs(res.data.logs);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${GATEWAY_URL}/interop/fetch`, {
        source_dept: sourceDept,
        target_dept: targetDept,
        citizen_id: citizenId,
        consent_given: consentGiven,
      });
      setResult(res.data);
      fetchAuditLogs();
    } catch (err) {
      setError(err.response?.data?.detail || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2>SIH Government Interoperability Gateway</h2>
      <p style={{ color: "#666" }}>Live Schema Transformation &amp; Data Exchange Engine</p>

      {/* Control Panel */}
      <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>1. Data Request Controls</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Source Department:
            <select value={sourceDept} onChange={(e) => setSourceDept(e.target.value)} style={{ marginLeft: "8px" }}>
              <option value="DEPT_A">Dept A (Identity)</option>
              <option value="DEPT_B">Dept B (e-District)</option>
            </select>
          </label>

          <label>
            Target Department:
            <select value={targetDept} onChange={(e) => setTargetDept(e.target.value)} style={{ marginLeft: "8px" }}>
              <option value="DEPT_B">Dept B (e-District)</option>
              <option value="DEPT_A">Dept A (Identity)</option>
            </select>
          </label>

          <label>
            Citizen ID:
            <input value={citizenId} onChange={(e) => setCitizenId(e.target.value)} style={{ marginLeft: "8px", width: "80px" }} />
          </label>

          <label style={{ cursor: "pointer", fontWeight: "bold" }}>
            <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} />
            {" "}Citizen Consent Provided (DEPA)
          </label>

          <button onClick={handleFetchData} disabled={loading} style={{ padding: "8px 16px", cursor: "pointer" }}>
            {loading ? "Transforming..." : "Execute Request"}
          </button>
        </div>
      </div>

      {/* Error Output */}
      {error && (
        <div style={{ background: "#ffe6e6", border: "1px solid red", color: "red", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Side-by-Side Data Output */}
      {result && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1, border: "1px solid #ddd", padding: "12px", borderRadius: "6px", background: "#f9f9f9" }}>
            <h4>Canonical Schema (Intermediate)</h4>
            <pre>{JSON.stringify(result.canonical_intermediate, null, 2)}</pre>
          </div>
          <div style={{ flex: 1, border: "1px solid #ddd", padding: "12px", borderRadius: "6px", background: "#eef9ff" }}>
            <h4>Delivered Target Payload</h4>
            <pre>{JSON.stringify(result.payload_delivered_to_target, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Audit Log Section */}
      <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
        <h3>2. Live Audit Trail Log</h3>
        {auditLogs.length === 0 ? (
          <p>No transactions logged yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={{ padding: "8px" }}>Timestamp</th>
                <th style={{ padding: "8px" }}>Source</th>
                <th style={{ padding: "8px" }}>Target</th>
                <th style={{ padding: "8px" }}>Status</th>
                <th style={{ padding: "8px" }}>Mapped Fields</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{log.timestamp}</td>
                  <td style={{ padding: "8px" }}>{log.source}</td>
                  <td style={{ padding: "8px" }}>{log.target}</td>
                  <td style={{ padding: "8px", color: "green", fontWeight: "bold" }}>{log.status}</td>
                  <td style={{ padding: "8px" }}>{log.fields_mapped.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
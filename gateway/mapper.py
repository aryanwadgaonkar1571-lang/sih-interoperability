from datetime import datetime
from typing import Any, Dict
import yaml

class SchemaMapper:
    def __init__(self, config_path: str):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)
        self.mappings = self.config.get("mappings", [])

    def _apply_transform(self, value: Any, transform_type: str, reverse: bool = False) -> Any:
        if not value or transform_type == "none":
            return value

        if transform_type == "DD-MM-YYYY_to_ISO":
            dt = datetime.strptime(value, "%d-%m-%Y")
            return dt.strftime("%Y-%m-%d")
        
        elif transform_type == "ISO_to_DD-MM-YYYY":
            dt = datetime.strptime(value, "%Y-%m-%d")
            return dt.strftime("%d-%m-%Y")

        elif transform_type == "gender_m_f_to_canonical":
            mapping = {"M": "Male", "F": "Female", "O": "Other"}
            return mapping.get(str(value).upper(), "Unknown")
            
        elif transform_type == "gender_canonical_to_full":
            return str(value).capitalize()

        return value

    def to_canonical(self, source_data: Dict[str, Any]) -> Dict[str, Any]:
        canonical_data = {}
        for rule in self.mappings:
            src = rule["source_field"]
            target = rule["canonical_field"]
            transform = rule.get("transform", "none")
            
            if src in source_data:
                canonical_data[target] = self._apply_transform(source_data[src], transform)
        return canonical_data

    def from_canonical(self, canonical_data: Dict[str, Any]) -> Dict[str, Any]:
        target_data = {}
        for rule in self.mappings:
            src = rule["source_field"]
            target = rule["canonical_field"]
            transform = rule.get("transform", "none")

            if target in canonical_data:
                target_data[src] = self._apply_transform(canonical_data[target], transform, reverse=True)
        return target_data
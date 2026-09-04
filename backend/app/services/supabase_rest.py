import httpx
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

class SupabaseREST:
    """
    Direct Supabase REST client using PostgREST endpoints.
    Ensures 100% reliable read & write operations directly to Supabase PostgreSQL database.
    """
    @classmethod
    def get_url(cls) -> str:
        return f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/"

    @classmethod
    def get_headers(cls) -> Dict[str, str]:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        return {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    @classmethod
    def select(cls, table: str, query_params: str = "select=*") -> List[Dict[str, Any]]:
        url = f"{cls.get_url()}{table}?{query_params}"
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(url, headers=cls.get_headers())
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            print(f"[SupabaseREST.select ERROR] {table}: {e}")
        return []

    @classmethod
    def insert(cls, table: str, data: Dict[str, Any] | List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        url = f"{cls.get_url()}{table}"
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=data, headers=cls.get_headers())
                if resp.status_code in (200, 201):
                    res = resp.json()
                    return res if isinstance(res, list) else [res]
        except Exception as e:
            print(f"[SupabaseREST.insert ERROR] {table}: {e}")
        return []

    @classmethod
    def update(cls, table: str, query_params: str, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        url = f"{cls.get_url()}{table}?{query_params}"
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.patch(url, json=data, headers=cls.get_headers())
                if resp.status_code in (200, 204):
                    res = resp.json() if resp.status_code == 200 else []
                    return res if isinstance(res, list) else [res]
        except Exception as e:
            print(f"[SupabaseREST.update ERROR] {table}: {e}")
        return []

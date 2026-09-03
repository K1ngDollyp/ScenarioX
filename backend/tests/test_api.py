import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "ScenarioX"
    assert data["status"] == "online"


@pytest.mark.asyncio
async def test_auth_me_endpoint():
    headers = {"Authorization": "Bearer dev-token-00000000-0000-0000-0000-000000000001"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["email"].endswith("@scenariox.ai")

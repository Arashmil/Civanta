import asyncio
import httpx
from app.main import app

async def test_api():
    print("Starting ASGI test...")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/")
        print("Root Status:", r.status_code)
        print("Root JSON:", r.json())

        # Test Demo login
        login_res = await client.post("/api/auth/demo-login?role=citizen")
        print("Demo Login Citizen Status:", login_res.status_code)
        token = login_res.json()["access_token"]
        print("Got token successfully.")

        # Test Audit verify
        audit_res = await client.get("/api/audit/verify")
        print("Audit Verify:", audit_res.json())

if __name__ == "__main__":
    asyncio.run(test_api())

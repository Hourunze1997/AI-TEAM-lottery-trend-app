"""历史开奖接口测试"""


def test_list_draws(client, db_session, fake_draws):
    resp = client.get("/api/v1/draws")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert data["total"] >= 5


def test_list_draws_pagination(client, fake_draws):
    resp = client.get("/api/v1/draws?page=1&page_size=2")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2
    assert data["page"] == 1


def test_get_draw_by_period(client, fake_draws):
    resp = client.get("/api/v1/draws/2024001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["period"] == "2024001"


def test_get_draw_not_found(client):
    resp = client.get("/api/v1/draws/notexist")
    assert resp.status_code == 404
    body = resp.json()
    assert body["error"]["code"] == "NOT_FOUND"
    assert "request_id" in body

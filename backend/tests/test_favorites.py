"""收藏接口测试"""
def test_create_favorite(client, auth_header):
    resp = client.post(
        "/api/v1/favorites",
        json={"front_numbers": [1, 2, 3, 4, 5], "back_numbers": [1, 2], "tag": "test"},
        headers=auth_header,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["front_numbers"] == [1, 2, 3, 4, 5]
    assert data["tag"] == "test"


def test_create_favorite_invalid(client, auth_header):
    resp = client.post(
        "/api/v1/favorites",
        json={"front_numbers": [1, 2, 3], "back_numbers": [1], "tag": "x"},
        headers=auth_header,
    )
    assert resp.status_code == 400


def test_list_favorites_empty(client, auth_header):
    resp = client.get("/api/v1/favorites", headers=auth_header)
    assert resp.status_code == 200
    assert resp.json() == []


def test_hit_stats(client, auth_header):
    client.post(
        "/api/v1/favorites",
        json={"front_numbers": [1, 2, 3, 4, 5], "back_numbers": [1, 2]},
        headers=auth_header,
    )
    resp = client.get("/api/v1/favorites/hit-stats", headers=auth_header)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

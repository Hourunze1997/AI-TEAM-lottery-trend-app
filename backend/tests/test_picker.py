"""随机选号接口测试"""
from app.services.picker import DISCLAIMER, _max_run, generate_tickets


def test_ticket_validity():
    """所有生成的号码必须在大乐透规则内且有序"""
    for t in generate_tickets(200):
        f, b = t["front_numbers"], t["back_numbers"]
        assert len(f) == 5 and len(set(f)) == 5 and all(1 <= n <= 35 for n in f)
        assert len(b) == 2 and len(set(b)) == 2 and all(1 <= n <= 12 for n in b)
        assert f == sorted(f) and b == sorted(b)


def test_randomness_spread():
    """500 注应几乎覆盖全部 35 个前区号——证明没有偏向"""
    seen = set()
    for t in generate_tickets(500, seed=7):
        seen.update(t["front_numbers"])
    assert len(seen) >= 33


def test_rule_max_consecutive():
    for t in generate_tickets(100, max_consecutive=1, seed=3):
        assert _max_run(t["front_numbers"]) == 1


def test_rule_sum_range():
    for t in generate_tickets(100, sum_range=(60, 90), seed=11):
        assert 60 <= sum(t["front_numbers"]) <= 90


def test_rules_too_strict_raises():
    import pytest
    with pytest.raises(ValueError):
        generate_tickets(1, sum_range=(15, 16))


def test_seed_reproducible():
    a = generate_tickets(5, seed=42)
    b = generate_tickets(5, seed=42)
    assert a == b


def test_generate_endpoint(client):
    resp = client.get("/api/v1/picker/generate?count=3")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 3
    assert len(data["tickets"]) == 3
    assert data["disclaimer"] == DISCLAIMER
    assert data["rules"] == {}


def test_generate_endpoint_with_rules(client):
    resp = client.get("/api/v1/picker/generate?count=5&max_consecutive=2&sum_min=60&sum_max=140")
    assert resp.status_code == 200
    data = resp.json()
    assert data["rules"]["max_consecutive"] == 2
    assert "不影响中奖概率" in data["rules"]["note"]
    for t in data["tickets"]:
        assert sum(t["front_numbers"]) <= 140


def test_generate_endpoint_invalid_params(client):
    assert client.get("/api/v1/picker/generate?sum_min=60").status_code == 400
    assert client.get("/api/v1/picker/generate?sum_min=140&sum_max=60").status_code == 400
    assert client.get("/api/v1/picker/generate?sum_min=15&sum_max=16").status_code == 400


def test_old_prediction_endpoint_gone(client):
    assert client.get("/api/v1/predictions/next?target_period=x").status_code in (404, 307)

"""预测接口测试"""
from app.services.predictor import predict_all_ordered
from app.models.draw import Draw
from datetime import datetime, timedelta


def _make_draws():
    draws = []
    base = datetime(2024, 1, 1)
    nums_front_pool = [list(range(1 + i, 6 + i)) for i in range(30)]
    nums_back_pool = [1, 2]
    for i in range(30):
        d = Draw(
            period=f"2024{i:04d}",
            draw_date=base + timedelta(days=i),
            front_numbers=nums_front_pool[i % 30],
            back_numbers=nums_back_pool,
        )
        draws.append(d)
    return draws


def test_predict_order():
    draws = _make_draws()
    out = predict_all_ordered(draws)
    assert [p["algorithm"] for p in out] == ["cold_hot", "missing", "mean_revert", "random"]


def test_confidence_range():
    draws = _make_draws()
    out = predict_all_ordered(draws)
    for p in out:
        assert 0.0 <= p["confidence"] <= 1.0


def test_predictions_endpoint(client, fake_draws):
    resp = client.get("/api/v1/predictions/next?target_period=2024090")
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_period"] == "2024090"
    assert len(data["predictions"]) == 4
    algos = [p["algorithm"] for p in data["predictions"]]
    assert algos == ["cold_hot", "missing", "mean_revert", "random"]

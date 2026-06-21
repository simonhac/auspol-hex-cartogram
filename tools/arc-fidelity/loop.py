from compare import compare
cycles = [
    ("cycle0", dict(inner_ratio=0.14,  seat_ratio=0.42)),
    ("cycle1", dict(inner_ratio=0.229, seat_ratio=0.42, count_mode="linear")),
    ("cycle2", dict(inner_ratio=0.229, seat_ratio=0.48, count_mode="linear")),
    ("cycle3", dict(inner_ratio=0.232, seat_ratio=0.479, count_mode="linear")),
]
for label, params in cycles:
    compare(params, label, draw=(label in ("cycle0","cycle3")))

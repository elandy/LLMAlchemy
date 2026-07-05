from models import CombinationRecord

_cache: dict[tuple[str, str], CombinationRecord] = {}


def normalize(a: str, b: str):
    return tuple(sorted((a.strip().lower(), b.strip().lower())))


def get(a: str, b: str):
    return _cache.get(normalize(a, b))


def put(record: CombinationRecord):
    _cache[normalize(record.left, record.right)] = record
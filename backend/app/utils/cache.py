"""
Lightweight in-memory TTL cache for high-performance FastAPI responses.
Eliminates redundant cross-continental database round-trips.
"""
import time
from typing import Any, Optional
from threading import Lock

class InMemoryTTLCache:
    def __init__(self, default_ttl_seconds: int = 15):
        self.default_ttl = default_ttl_seconds
        self._store = {}
        self._lock = Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            val, expiry = entry
            if time.time() > expiry:
                del self._store[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        with self._lock:
            self._store[key] = (value, time.time() + ttl)

    def invalidate(self, prefix: Optional[str] = None):
        with self._lock:
            if not prefix:
                self._store.clear()
            else:
                keys_to_del = [k for k in self._store if k.startswith(prefix)]
                for k in keys_to_del:
                    del self._store[k]

# Global cache instance
cache = InMemoryTTLCache(default_ttl_seconds=15)

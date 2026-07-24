import random
import string
from locust import HttpUser, task, between

# Sample known short codes that should be pre-seeded in your PostgreSQL/Redis 
# before running the test to ensure valid cache hits and tracking.
KNOWN_SHORT_CODES = [f"short{i}" for i in range(1, 100)]

def generate_random_short_code(length=7):
    """Generates a random short code to simulate cache misses."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

class RedirectionTester(HttpUser):
    """
    TaskSet 1: High-Throughput Redirection
    Run this user class to stress-test Redis cache retrieval speed vs. a cache miss.
    This will help measure the p95 latency reduction provided by Redis.
    """
    # Wait time between tasks for each simulated user
    wait_time = between(0.1, 0.5)

    @task(4) # 80% of the time, simulate a cache hit
    def cache_hit(self):
        """Simulates a cache hit by requesting a known short code."""
        short_code = random.choice(KNOWN_SHORT_CODES)
        # allow_redirects=False prevents Locust from automatically following the redirect,
        # allowing us to measure the exact latency of the FastAPI redirection endpoint itself.
        with self.client.get(f"/{short_code}", name="/[short_code] (Cache Hit)", allow_redirects=False, catch_response=True) as response:
            if response.status_code in [301, 302, 307, 308]:
                response.success()
            elif response.status_code == 404:
                response.failure("Known short code returned 404. Ensure test data is seeded.")

    @task(1) # 20% of the time, simulate a cache miss
    def cache_miss(self):
        """Simulates a cache miss by requesting a random (likely non-existent) short code."""
        short_code = generate_random_short_code()
        with self.client.get(f"/{short_code}", name="/[short_code] (Cache Miss)", allow_redirects=False, catch_response=True) as response:
            # We expect a 404 for a cache miss since it doesn't exist in DB either,
            # but this still exercises the cache miss logic (checking Redis -> checking DB -> returning 404)
            if response.status_code == 404:
                response.success()


class AnalyticsTester(HttpUser):
    """
    TaskSet 2: The Click-Tracking Pipeline
    Run this user class to generate sustained traffic for analytics tracking.
    This provides continuous valid hits to monitor PostgreSQL writes vs Redis batching buffering.
    """
    # Shorter wait time to generate higher throughput for testing the background pipeline
    wait_time = between(0.05, 0.2)

    @task
    def track_click(self):
        """Generates a valid redirect to continuously trigger the background click-tracking pipeline."""
        short_code = random.choice(KNOWN_SHORT_CODES)
        with self.client.get(f"/{short_code}", name="/[short_code] (Analytics Tracking)", allow_redirects=False, catch_response=True) as response:
            if response.status_code in [301, 302, 307, 308]:
                response.success()
            else:
                response.failure(f"Unexpected status code: {response.status_code}")

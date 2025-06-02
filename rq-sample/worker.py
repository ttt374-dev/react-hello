import redis
from rq import Worker, Queue

redis_url = "redis://redis:6379"
conn = redis.from_url(redis_url)

# Create a queue and worker
queue = Queue(connection=conn)
worker = Worker([queue], connection=conn)

worker.work()

import redis
from rq import Queue
from tasks import say_hello

redis_conn = redis.from_url("redis://localhost:6379")
q = Queue(connection=redis_conn)

job = q.enqueue(say_hello, "Tom")
print(f"Job {job.id} enqueued")

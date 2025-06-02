import redis
from rq import Queue
from jobs import say_hello

redis_conn = redis.from_url("redis://localhost:6379")
q = Queue(connection=redis_conn)

job = q.enqueue(say_hello, "WTF MEN!!!!")
print(f"Job {job.id} enqueued")

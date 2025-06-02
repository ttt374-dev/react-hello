import redis
from rq import Queue
from jobs import say_hello
from transcribe import transcribe_title


redis_conn = redis.from_url("redis://localhost:6379")
q = Queue(connection=redis_conn, default_timeout=1800)

#job = q.enqueue(say_hello, "WTF MEN!!!!")
job = q.enqueue(transcribe_title, "active")
print(f"Job {job.id} enqueued")

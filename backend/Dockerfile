FROM python:3.11-slim

# 必要パッケージを早めにインストール（torch前にffmpegも）
RUN apt-get update && apt-get install -y ffmpeg build-essential
# 先に CPU 版の torch をインストール
RUN pip install torch==2.7.0+cpu --index-url https://download.pytorch.org/whl/cpu

WORKDIR /app

COPY requirements.txt .
#RUN pip install -r requirements.txt

RUN pip install --upgrade pip && pip install -r requirements.txt
# whisper を最後に明示的にインストール（torch依存解決済みなので再DLされない）
RUN pip install openai-whisper

COPY . .

EXPOSE 8000

#CMD ["uvicorn", "database:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


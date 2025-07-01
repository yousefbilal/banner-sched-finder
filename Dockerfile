FROM python:3.11-slim
WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD gunicorn -w 2 -b 0.0.0.0:8080 app:app

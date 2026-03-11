FROM python:3.10-slim

WORKDIR /app

# Install dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Initialize DB and start server
CMD python init_db.py && flask run --host=0.0.0.0

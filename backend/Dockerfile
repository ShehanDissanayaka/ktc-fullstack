# Use official Python slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optional but recommended for PIL, etc.)
RUN apt-get update && apt-get install -y build-essential

# Copy requirement files first
COPY requirements.txt ./

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of the app
COPY . ./

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Final command
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]

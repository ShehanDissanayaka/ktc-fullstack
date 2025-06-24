# Use official slim Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install build tools for PIL, WeasyPrint
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango1.0 \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app
COPY . ./

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Final command
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]

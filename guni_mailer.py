import os

# Set the default port to 8041 if the environment variable is not set
bind = f"0.0.0.0:{os.environ.get('PORT', 8001)}"

# Optional: Enable debug mode if needed (though it's typically set via the app, not Gunicorn)
debug = os.environ.get('FLASK_DEBUG', 'True') == 'False'

# Optional: Set workers count to handle multiple requests
workers = os.cpu_count() * 2 + 1

# Optional: Set the timeout
timeout = 60

import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
from app import app
from models import Task

with app.app_context():
    for t in Task.query.all():
        print(t.id, t.name, t.type, t.cycle, t.unit, t.completed, t.last_reset)

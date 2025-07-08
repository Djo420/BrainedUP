from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id            = db.Column(db.String, primary_key=True)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    tasks         = db.relationship('Task', back_populates='user', cascade='all, delete-orphan')

    def __init__(self, email: str, password_hash: str):
        self.id = email
        self.email = email
        self.password_hash = password_hash

class Task(db.Model):
    __tablename__ = 'task'
    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.String, db.ForeignKey('user.id'), nullable=False)
    name        = db.Column(db.String(200), nullable=False)
    type        = db.Column(db.String(50), nullable=False)
    cycle       = db.Column(db.String(50), nullable=False)
    unit        = db.Column(db.String(20))
    completed   = db.Column(db.Boolean, default=False)
    last_reset  = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    priority    = db.Column(db.Boolean, default=False)

    user = db.relationship('User', back_populates='tasks')

    def __init__(self, user_id: str, name: str, type: str, cycle: str, unit: str | None = None, completed: bool = False):
        self.user_id   = user_id
        self.name      = name
        self.type      = type
        self.cycle     = cycle
        self.unit      = unit
        self.completed = completed
        self.last_reset = datetime.now(timezone.utc)
        self.priority  = False

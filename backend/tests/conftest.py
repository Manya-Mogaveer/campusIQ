import pytest
from app.database.session import engine, Base, SessionLocal
from app.database.init_db import seed_database
from app.navigation.graph import graph_manager


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        graph_manager.build_graph(db)
    finally:
        db.close()
    yield

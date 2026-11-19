import os
from app.database.session import engine, Base, SessionLocal
import app.models as m
from app.database.init_db import seed_database
from app.navigation.graph import graph_manager

db = SessionLocal()
try:
    print("Clearing old sample spatial records...")
    db.query(m.PathEdge).delete()
    db.query(m.PathNode).delete()
    db.query(m.QRCheckpoint).delete()
    db.query(m.Location).delete()
    db.query(m.Building).delete()
    db.commit()

    print("Re-seeding verified SIT Valachil campus records...")
    seed_database(db)
    graph_manager.build_graph(db)
    print(f"Successfully reseeded: {db.query(m.Building).count()} buildings, {db.query(m.Location).count()} locations, {len(graph_manager.graph.nodes)} nodes, {len(graph_manager.graph.edges)} edges.")
finally:
    db.close()

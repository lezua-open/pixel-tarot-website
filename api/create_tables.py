from app.database import engine, Base
from app.models import Reading, ReadingCard

print("创建表...")
Base.metadata.create_all(bind=engine)
print("表创建成功!")

# 验证表
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"数据库中的表: {tables}")

from app.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('数据库连接成功:', result.scalar())
except Exception as e:
    print('数据库连接失败:', e)

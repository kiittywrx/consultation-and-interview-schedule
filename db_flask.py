import os
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    config = {
        'host': os.environ.get('MYSQLHOST', 'localhost'),
        'port': os.environ.get('MYSQLPORT', '3306'),
        'user': os.environ.get('MYSQLUSER', 'root'),
        'password': os.environ.get('MYSQLPASSWORD', ''),
        'database': os.environ.get('MYSQLDATABASE', 'admission_system'),
        'autocommit': True
    }
    try:
        connection = mysql.connector.connect(**config)
        return connection
    except Error as e:
        print(f"[DB ERROR] {e}")
        return None
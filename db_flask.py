import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            port="3306",
            database="admission_system",
            user="root",
            password="152845",
            autocommit=True
        )
        return connection
    except Error as e:
        print(f"[DB ERROR] {e}")
        return None
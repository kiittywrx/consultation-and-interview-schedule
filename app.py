from flask import Flask, render_template
from db_flask import get_db_connection
from collections import defaultdict
from datetime import date
import json

app = Flask(__name__)

# Українські скорочення днів тижня
WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
# Скорочені назви місяців
MONTHS_GEN = {
    1: "січ", 2: "лют", 3: "бер", 4: "квіт", 5: "трав",
    6: "чер", 7: "лип", 8: "сер", 9: "вер", 10: "жов",
    11: "лис", 12: "гру"
}

@app.route("/")
def index():
    conn = get_db_connection()
    if not conn:
        # Якщо немає з'єднання – показуємо повідомлення
        return render_template("schedule.html", schedule_json="[]")

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                consultation_date,
                start_time,
                end_time,
                format,
                location,
                group_type
            FROM consultation_slots
            WHERE is_active = 1
            ORDER BY consultation_date, start_time
        """)
        rows = cursor.fetchall()
    except Exception as e:
        print(f"Query error: {e}")
        rows = []
    finally:
        cursor.close()
        conn.close()

    # Групуємо слоти за датою
    slots_by_date = defaultdict(list)
    for row in rows:
        d = row["consultation_date"]
        time_range = f"{row['start_time']} – {row['end_time']}"
        slots_by_date[d].append({
            "timeRange": time_range,
            "format": row["format"],
            "groupType": row["group_type"],
            "location": row["location"],
            "available": True
        })


    # Формуємо список днів
    schedule_data = []
    for dt in sorted(slots_by_date.keys()):
        day_name = WEEKDAYS_SHORT[dt.weekday()]
        day = dt.day
        month_short = MONTHS_GEN.get(dt.month, "")
        full_date = f"{day:02d} {month_short}" if month_short else dt.strftime("%d %b")
        schedule_data.append({
            "dayName": day_name,
            "fullDate": full_date,
            "slotsData": slots_by_date[dt]
        })

    return render_template("schedule.html", schedule_json=json.dumps(schedule_data, ensure_ascii=False))

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
// Отримуємо дані, передані бд
const scheduleDataElement = document.getElementById('schedule-data');
let scheduleRaw = [];
if (scheduleDataElement) {
    try {
        scheduleRaw = JSON.parse(scheduleDataElement.textContent);
    } catch (e) {
        console.error('Помилка парсингу даних графіка:', e);
    }
}

// Елементи, які будуть потрібні
const track = document.getElementById('scheduleTrack');
const container = document.getElementById('scheduleScrollContainer');
const prevBtn = document.getElementById('prevArrowBtn');
const nextBtn = document.getElementById('nextArrowBtn');
const toggleBtn = document.getElementById('toggleShowBtn');
const toggleBtnText = document.getElementById('toggleBtnText');
const toggleArrowIcon = document.getElementById('toggleArrowIcon');

// функція для визначення "група" чи "групи"
function getGroupLabel(groupType) {
    if (!groupType) return 'група';
    return groupType.length > 5 ? 'групи' : 'група';
}

//  якщо даних немає – виводимо повідомлення і блокуємо керування
if (scheduleRaw.length === 0) {
    track.innerHTML = `
        <div class="empty-slots-placeholder" style="width:100%; padding:40px; text-align:center;">
            <div style="font-size:1.1rem; color:#5b7a9a;">Наразі немає доступних консультацій</div>
            <div style="font-size:0.85rem; color:#8aa0b8; margin-top:8px;">
                Графік буде опубліковано найближчим часом
            </div>
        </div>`;
    prevBtn.classList.add('disabled');
    nextBtn.classList.add('disabled');
    if (toggleBtn) toggleBtn.style.display = 'none';
} else {
    function renderDayColumn(day) {
        const hasSlots = day.slotsData && day.slotsData.length > 0;

        if (!hasSlots) {
            return `
                <div class="schedule-col">
                    <div class="schedule-title">
                        <div>${day.dayName},<br>${day.fullDate}</div>
                    </div>
                    <div class="schedule-day-slots">
                        <div class="empty-slots-placeholder">Немає доступних слотів</div>
                    </div>
                </div>
            `;
        }

        const slotsHtml = day.slotsData.map(slot => {
            // формуємо рядок інформації для відображення

            const groupLabel = getGroupLabel(slot.groupType);
            const infoDisplay = `${slot.format} · ${groupLabel} ${slot.groupType}`;
            return `
                <div class="unified-slot"
                     data-time="${slot.timeRange}"
                     data-format="${slot.format}"
                     data-location="${slot.location}"
                     data-group="${slot.groupType}">
                    <div class="slot-time">${slot.timeRange}</div>
                    <div class="slot-info">${infoDisplay}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="schedule-col">
                <div class="schedule-title">
                    <div>${day.dayName},<br>${day.fullDate}</div>
                </div>
                <div class="schedule-day-slots">
                    ${slotsHtml}
                </div>
            </div>
        `;
    }

    let currentVisibleCount = 5;

    function renderVisibleDays() {
        const visibleDays = scheduleRaw.slice(0, currentVisibleCount);
        track.innerHTML = visibleDays.map(day => renderDayColumn(day)).join('');
        const btnText = document.getElementById('toggleBtnText');
        const arrowIcon = document.getElementById('toggleArrowIcon');
        if (currentVisibleCount >= scheduleRaw.length) {
            btnText.innerText = 'Показати менше слотів';
            arrowIcon.classList.add('rotated');
        } else {
            btnText.innerText = 'Показати більше слотів';
            arrowIcon.classList.remove('rotated');
        }
    }

    document.getElementById('toggleShowBtn').addEventListener('click', () => {
        if (currentVisibleCount >= scheduleRaw.length) {
            currentVisibleCount = 5;
        } else {
            currentVisibleCount = scheduleRaw.length;
        }
        renderVisibleDays();
        container.scrollLeft = 0;
        updateArrowsState();
    });

    function updateArrowsState() {
        if (!container) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft <= 5) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
        if (container.scrollLeft >= maxScroll - 5) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }

    function scrollContainer(direction) {
        const scrollAmount = 280;
        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        setTimeout(updateArrowsState, 200);
    }

    prevBtn.addEventListener('click', () => scrollContainer('left'));
    nextBtn.addEventListener('click', () => scrollContainer('right'));
    container.addEventListener('scroll', updateArrowsState);

    renderVisibleDays();
    setTimeout(() => {
        updateArrowsState();
    }, 100);

    //  обробник кліку на слот
    document.addEventListener('click', (e) => {
        const slot = e.target.closest('.unified-slot');
        if (!slot) return;

        const timeText = slot.getAttribute('data-time') || '';
        const format = slot.getAttribute('data-format') || '';
        const location = slot.getAttribute('data-location') || '';
        const groupType = slot.getAttribute('data-group') || '';

        let detailsLine = '';
        const formatLower = format.toLowerCase();
        if (formatLower.includes('онлайн') || formatLower.includes('online')) {
            detailsLine = `🔗 Посилання на зустріч: ${location || 'не вказано'}`;
        } else {
            detailsLine = `📍 Місце проведення: ${location || 'не вказано'}`;
        }

        const groupLabel = getGroupLabel(groupType);
        const message = `📌 Обраний слот\n\n🕒 Час: ${timeText}\n👥 ${groupLabel.charAt(0).toUpperCase() + groupLabel.slice(1)}: ${groupType}\n${detailsLine}`;
        alert(message);
    });
}

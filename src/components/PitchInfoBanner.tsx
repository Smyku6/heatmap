import React from 'react';
import './PitchInfoBanner.css';
import type { PitchInfo } from '../types';

interface PitchInfoBannerProps {
  pitchInfo: PitchInfo;
  activityDate?: Date;
  duration?: any;
}

const PitchInfoBanner: React.FC<PitchInfoBannerProps> = ({ pitchInfo, activityDate, duration }) => {
  if (!pitchInfo) return null;

  // Generuj kalendarz dla miesiąca aktywności
  const generateCalendar = (date: Date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = date.getMonth();
    const today = date.getDate();

    // Pierwszy dzień miesiąca
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Dzień tygodnia (0 = niedziela, dostosuj do 1 = poniedziałek)
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Poniedziałek = 0

    const daysInMonth = lastDay.getDate();
    const weeks = [];
    let week = new Array(7).fill(null);
    let dayCounter = 1;

    // Wypełnij kalendarz
    for (let i = 0; i < 6; i++) { // Max 6 tygodni
      week = new Array(7).fill(null);

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startDay) {
          // Puste dni przed początkiem miesiąca
          continue;
        }
        if (dayCounter > daysInMonth) {
          break;
        }
        week[j] = dayCounter;
        dayCounter++;
      }

      weeks.push(week);
      if (dayCounter > daysInMonth) break;
    }

    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];

    return {
      monthName: monthNames[month],
      year,
      weeks,
      activeDay: today
    };
  };

  const calendar = activityDate ? generateCalendar(activityDate) : null;

  // Losowy kolor dla każdego boiska (możesz to zastąpić mapą)
  const getPitchColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, rgba(202, 253, 0, 0.3) 0%, rgba(202, 253, 0, 0.1) 100%)',
      'linear-gradient(135deg, rgba(78, 205, 196, 0.3) 0%, rgba(78, 205, 196, 0.1) 100%)',
      'linear-gradient(135deg, rgba(255, 115, 81, 0.3) 0%, rgba(255, 115, 81, 0.1) 100%)',
    ];
    const hash = name?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <div className="pitch-info-banner">
      <div className="pitch-info-left">
        {/* Avatar boiska */}
        <div
          className="pitch-avatar"
          style={{ background: getPitchColor(pitchInfo.name) }}
        >
          <span className="material-symbols-outlined">stadium</span>
        </div>

        {/* Info o boisku */}
        <div className="pitch-details">
          <h2 className="pitch-name">{pitchInfo.name}</h2>
          <div className="pitch-meta">
            <span className="pitch-location">
              <span className="material-symbols-outlined">location_on</span>
              {pitchInfo.location}
            </span>
            <span className="pitch-dimensions">
              <span className="material-symbols-outlined">straighten</span>
              {pitchInfo.dimensions.length}m × {pitchInfo.dimensions.width}m
            </span>
          </div>
        </div>
      </div>

      {/* Kalendarz po prawej */}
      {calendar && (
        <div className="pitch-info-right">
          <div className="mini-calendar">
            <div className="calendar-header">
              <span className="calendar-month">{calendar.monthName}</span>
              <span className="calendar-year">{calendar.year}</span>
            </div>

            <div className="calendar-grid">
              {/* Nagłówki dni tygodnia */}
              <div className="calendar-weekdays">
                {['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'].map((day, i) => (
                  <div key={i} className="calendar-weekday">{day}</div>
                ))}
              </div>

              {/* Dni miesiąca */}
              <div className="calendar-days">
                {calendar.weeks.map((week, weekIdx) => (
                  <React.Fragment key={weekIdx}>
                    {week.map((day, dayIdx) => (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`calendar-day ${day === calendar.activeDay ? 'active' : ''} ${!day ? 'empty' : ''}`}
                      >
                        {day || ''}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Data i czas aktywności */}
            <div className="calendar-footer">
              {duration && duration.timeRange ? (
                <>
                  <span className="activity-time">
                    <span className="material-symbols-outlined">schedule</span>
                    {duration.timeRange}
                  </span>
                  <span className="activity-duration">
                    <span className="material-symbols-outlined">timer</span>
                    {duration.formatted}
                  </span>
                </>
              ) : activityDate ? (
                <span className="activity-time">
                  <span className="material-symbols-outlined">schedule</span>
                  {activityDate.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchInfoBanner;
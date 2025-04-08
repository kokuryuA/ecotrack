import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onDateSelect }) => {
  const [date, setDate] = useState<Date>(new Date());

  const handleDateChange = (value: Date) => {
    setDate(value);
    if (onDateSelect) {
      onDateSelect(value);
    }
  };

  return (
    <div className="calendar-widget">
      <h3>Calendar</h3>
      <Calendar
        onChange={handleDateChange}
        value={date}
        className="calendar"
        tileClassName="calendar-tile"
      />
    </div>
  );
};

export default CalendarWidget;

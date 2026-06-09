import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AppointmentCalendar({ appointments }) {
  const events = appointments.map((a) => ({
    id: a.id,
    title: `Dr. ${a.doctor_id} - Patient ${a.patient_id}`,
    start: new Date(a.appointment_time),
    end: new Date(new Date(a.appointment_time).getTime() + 30 * 60000),
  }));

  return (
    <Paper sx={{ p: 2, height: '70vh' }}>
      <Typography variant="h6" gutterBottom>
        Appointment Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '90%' }}
      />
    </Paper>
  );
}
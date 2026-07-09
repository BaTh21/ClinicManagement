import React from 'react';
import { Box, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { formatInTimeZone } from 'date-fns-tz';   // NEW import
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Cambodia time zone
const TIMEZONE = 'Asia/Phnom_Penh';

// Parse an appointment_time string (ISO or naïve) as UTC
const toUTCDate = (timeString) => {
  const clean = timeString.endsWith('Z') ? timeString : timeString + 'Z';
  return new Date(clean);
};

export default function AppointmentCalendar({ appointments, patients, doctors }) {
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : `Doctor ${doctorId}`;
  };

  // Build events – all times treated as UTC instants
  const events = appointments.map((a) => {
    const start = toUTCDate(a.appointment_time);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30‑min appointments

    return {
      id: a.id,
      title: `${getPatientName(a.patient_id)} – ${getDoctorName(a.doctor_id)}`,
      start,
      end,
    };
  });

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} color="#004d7a" mb={2}>
        Appointment Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '70vh' }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: '#008793',
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: 'none',
            display: 'block',
            fontWeight: 500,
          },
        })}
        // Custom formats – all times shown in Cambodia time
        formats={{
          timeGutterFormat: (date, culture, localizer) =>
            formatInTimeZone(date, TIMEZONE, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${formatInTimeZone(start, TIMEZONE, 'HH:mm')} – ${formatInTimeZone(end, TIMEZONE, 'HH:mm')}`,
          dayHeaderFormat: (date, culture, localizer) =>
            formatInTimeZone(date, TIMEZONE, 'EEEE, MMM d'),
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            `${formatInTimeZone(start, TIMEZONE, 'MMM d')} – ${formatInTimeZone(end, TIMEZONE, 'MMM d, yyyy')}`,
        }}
      />
    </Box>
  );
}
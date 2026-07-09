import React from 'react';
import { Box, Typography } from '@mui/material';
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

export default function AppointmentCalendar({ appointments, patients, doctors }) {
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : `Doctor ${doctorId}`;
  };

  const events = appointments.map((a) => ({
    id: a.id,
    title: `${getPatientName(a.patient_id)} – ${getDoctorName(a.doctor_id)}`,
    start: new Date(a.appointment_time),
    end: new Date(new Date(a.appointment_time).getTime() + 30 * 60000),
  }));

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
      />
    </Box>
  );
}